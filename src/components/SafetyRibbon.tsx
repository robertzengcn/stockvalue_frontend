import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { FScoreData, RiskScore } from "../api/types";

interface SafetyRibbonProps {
  ticker: string;
  risk: RiskScore | null;
}

const MSCORE_INDICATORS = [
  {
    key: "dsri",
    name: "DSRI",
    label: "应收账款指数",
    desc: "应收账款增长率 vs 营收增长率。若远大于 1，可能虚增收入。",
  },
  {
    key: "gmi",
    name: "GMI",
    label: "毛利率指数",
    desc: "毛利率同比下滑时 > 1，公司更有动机粉饰报表。",
  },
  {
    key: "aqi",
    name: "AQI",
    label: "资产质量指数",
    desc: "非流动资产占比异常升高，可能通过资本化费用操纵利润。",
  },
  {
    key: "sgi",
    name: "SGI",
    label: "营收增长指数",
    desc: "高速增长伴随高操纵风险，管理层为维持增长预期可能造假。",
  },
  {
    key: "depi",
    name: "DEPI",
    label: "折旧率指数",
    desc: "折旧率异常下降可能意味着改变折旧政策以虚增利润。",
  },
  {
    key: "sgai",
    name: "SGAI",
    label: "销售管理费用指数",
    desc: "销售及管理费用占比上升，可能隐藏运营效率恶化。",
  },
  {
    key: "lvgi",
    name: "LVGI",
    label: "杠杆指数",
    desc: "杠杆率上升，财务风险增加，可能通过举债维持经营。",
  },
  {
    key: "tata",
    name: "TATA",
    label: "应计总额/总资产",
    desc: "利润中缺乏现金流支撑（全是会计数字），造假概率极大。",
  },
] as const;

const RISK_LABEL: Record<string, string> = {
  LOW: "安全",
  MEDIUM: "观察",
  HIGH: "高危",
  CRITICAL: "高危",
};

const FSCORE_ITEMS: {
  key: keyof FScoreData;
  label: string;
  dimension: string;
}[] = [
  { key: "positive_roa", label: "ROA > 0（盈利）", dimension: "盈利能力" },
  { key: "positive_cfo", label: "经营现金流 > 0", dimension: "盈利能力" },
  { key: "improving_roa", label: "ROA 同比改善", dimension: "盈利能力" },
  {
    key: "cfo_exceeds_roa",
    label: "CFO > ROA（现金流覆盖利润）",
    dimension: "盈利能力",
  },
  { key: "lower_leverage", label: "杠杆率下降", dimension: "杠杆与流动性" },
  { key: "higher_liquidity", label: "流动比率提升", dimension: "杠杆与流动性" },
  { key: "no_new_shares", label: "未增发新股", dimension: "杠杆与流动性" },
  { key: "improving_margin", label: "毛利率提升", dimension: "运营效率" },
  { key: "improving_turnover", label: "资产周转率提升", dimension: "运营效率" },
];

function fscoreLevel(score: number): string {
  if (score >= 8) return "极优";
  if (score >= 7) return "优良";
  if (score >= 5) return "中等";
  if (score >= 3) return "偏弱";
  return "极差";
}

function fscoreLevelClass(score: number): string {
  if (score >= 7) return "safe";
  if (score >= 5) return "watch";
  return "danger";
}

/** Derive 0-100 health score from risk level, M-Score, and F-Score. */
function healthScore(risk: RiskScore): number {
  const base =
    risk.risk_level === "LOW"
      ? 85
      : risk.risk_level === "MEDIUM"
        ? 60
        : risk.risk_level === "HIGH"
          ? 35
          : 15;
  const mBonus = risk.m_score < -1.78 ? 10 : risk.m_score > 0 ? -10 : 0;
  const fBonus = risk.f_score >= 7 ? 5 : risk.f_score <= 2 ? -5 : 0;
  return Math.max(0, Math.min(100, base + mBonus + fBonus));
}

export function SafetyRibbon({ ticker, risk }: SafetyRibbonProps) {
  const [mscoreOpen, setMscoreOpen] = useState(false);

  if (!risk) return <div className="safety-ribbon">暂无风险数据</div>;

  const level = risk.risk_level;
  const label = RISK_LABEL[level] ?? level;
  const statusClass =
    level === "LOW" ? "safe" : level === "MEDIUM" ? "watch" : "danger";
  const score = healthScore(risk);

  return (
    <div className={`safety-ribbon safety-ribbon--${statusClass}`}>
      <div className="safety-ribbon__main">
        <span className="safety-ribbon__ticker">{ticker}</span>
        <span className="safety-ribbon__dot" aria-hidden />
        <span className="safety-ribbon__rating">AI 综合安全评级：{label}</span>
        <span className="safety-ribbon__mscore">
          M-Score: {risk.m_score.toFixed(2)}
          <Dialog.Root open={mscoreOpen} onOpenChange={setMscoreOpen}>
            <Dialog.Trigger asChild>
              <button
                className="safety-ribbon__info-btn"
                aria-label="查看 M-Score 指标说明"
                title="M-Score 指标说明"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 7v4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="4.5" r="0.75" fill="currentColor" />
                </svg>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="mscore-dialog__overlay" />
              <Dialog.Content className="mscore-dialog__content">
                <Dialog.Title className="mscore-dialog__title">
                  Beneish M-Score 指标说明
                </Dialog.Title>
                <Dialog.Description className="mscore-dialog__desc">
                  M-Score 是由 Messod Beneish 教授开发的财务造假探测模型，通过 8
                  个指标的变动判断公司是否操纵利润。 综合得分 &gt; -1.78
                  表示存在较高造假嫌疑。
                </Dialog.Description>
                <div className="mscore-dialog__formula">
                  <span className="mscore-dialog__formula-label">综合公式</span>
                  <code>
                    M = -4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI +
                    0.115×DEPI - 0.172×SGAI + 4.679×TATA - 0.327×LVGI
                  </code>
                </div>
                <div className="mscore-dialog__threshold">
                  当前 M-Score: <strong>{risk.m_score.toFixed(2)}</strong>
                  {risk.m_score < -1.78 ? (
                    <span className="mscore-dialog__threshold--safe">
                      （低于 -1.78 阈值，造假风险较低）
                    </span>
                  ) : (
                    <span className="mscore-dialog__threshold--danger">
                      （超过 -1.78 阈值，存在造假嫌疑）
                    </span>
                  )}
                </div>
                <table className="mscore-dialog__table">
                  <thead>
                    <tr>
                      <th>缩写</th>
                      <th>名称</th>
                      <th>当前值</th>
                      <th>含义</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MSCORE_INDICATORS.map((ind) => (
                      <tr key={ind.key}>
                        <td className="mscore-dialog__abbr">{ind.name}</td>
                        <td>{ind.label}</td>
                        <td className="mscore-dialog__value">
                          {risk.mscore_data[ind.key].toFixed(2)}
                        </td>
                        <td className="mscore-dialog__meaning">{ind.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Dialog.Close asChild>
                  <button className="mscore-dialog__close" aria-label="关闭">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </span>
        <span
          className={`safety-ribbon__fscore safety-ribbon__fscore--${fscoreLevelClass(risk.f_score)}`}
        >
          F-Score: {risk.f_score}/9（{fscoreLevel(risk.f_score)}）
        </span>
        <span className="safety-ribbon__score" title="财务健康度评分">
          财务健康度: {score}
        </span>
      </div>
      <details className="safety-ribbon__brief">
        <summary>排雷简报</summary>
        <ul>
          {risk.red_flags.length > 0 ? (
            risk.red_flags.map((f, i) => <li key={i}>{f}</li>)
          ) : (
            <li>暂无风险提示</li>
          )}
        </ul>
        <p>
          存贷双高: {risk.存贷双高 ? "是" : "否"} · 商誉/权益:{" "}
          {(risk.goodwill_ratio * 100).toFixed(1)}%
        </p>
      </details>
      <details className="safety-ribbon__fscore-detail">
        <summary>F-Score 拆解（Piotroski 9项基本面评分）</summary>
        <div className="safety-ribbon__fscore-grid">
          {["盈利能力", "杠杆与流动性", "运营效率"].map((dim) => (
            <div key={dim} className="safety-ribbon__fscore-group">
              <h4>{dim}</h4>
              <ul>
                {FSCORE_ITEMS.filter((item) => item.dimension === dim).map(
                  (item) => {
                    const passed = risk.fscore_data[item.key];
                    return (
                      <li
                        key={item.key}
                        className={passed ? "fscore-pass" : "fscore-fail"}
                      >
                        {passed ? "\u2713" : "\u2717"} {item.label}
                      </li>
                    );
                  },
                )}
              </ul>
            </div>
          ))}
        </div>
        <p className="safety-ribbon__fscore-note">
          得分 {risk.f_score}/9 ·{" "}
          {risk.f_score >= 7
            ? "基本面扎实且持续改善"
            : risk.f_score >= 5
              ? "基本面中性，部分指标承压"
              : "基本面偏弱，多项指标恶化，需谨慎"}
        </p>
      </details>
    </div>
  );
}
