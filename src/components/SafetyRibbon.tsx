import type { RiskScore } from "../api/types";

interface SafetyRibbonProps {
  ticker: string;
  risk: RiskScore | null;
}

const RISK_LABEL: Record<string, string> = {
  LOW: "安全",
  MEDIUM: "观察",
  HIGH: "高危",
  CRITICAL: "高危",
};

/** Derive 0-100 health score from risk level and M-Score (M < -1.78 = safer). */
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
  return Math.max(0, Math.min(100, base + mBonus));
}

export function SafetyRibbon({ ticker, risk }: SafetyRibbonProps) {
  if (!risk) return <div className="safety-ribbon">暂无风险数据</div>;

  const level = risk.risk_level;
  const label = RISK_LABEL[level] ?? level;
  const statusClass =
    level === "LOW"
      ? "safe"
      : level === "MEDIUM"
        ? "watch"
        : "danger";
  const score = healthScore(risk);

  return (
    <div className={`safety-ribbon safety-ribbon--${statusClass}`}>
      <div className="safety-ribbon__main">
        <span className="safety-ribbon__ticker">{ticker}</span>
        <span className="safety-ribbon__dot" aria-hidden />
        <span className="safety-ribbon__rating">AI 综合安全评级：{label}</span>
        <span className="safety-ribbon__mscore">M-Score: {risk.m_score.toFixed(2)}</span>
        <span className="safety-ribbon__score" title="财务健康度评分（点击查看 M-Score 拆解）">
          财务健康度: {score}
        </span>
      </div>
      <details className="safety-ribbon__brief">
        <summary>排雷简报</summary>
        <ul>
          {risk.red_flags.length > 0
            ? risk.red_flags.map((f, i) => <li key={i}>{f}</li>)
            : <li>暂无风险提示</li>}
        </ul>
        <p>存贷双高: {risk.存贷双高 ? "是" : "否"} · 商誉/权益: {(risk.goodwill_ratio * 100).toFixed(1)}%</p>
      </details>
    </div>
  );
}
