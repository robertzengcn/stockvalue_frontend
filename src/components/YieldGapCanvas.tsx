import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as Select from "@radix-ui/react-select";
import type { YieldGap } from "../api/types";

type Benchmark = "3y_deposit" | "5y_deposit" | "10y_bond";
type TaxContext = "stock_connect" | "native";

interface YieldGapCanvasProps {
  yieldData: YieldGap | null;
}

export function YieldGapCanvas({ yieldData }: YieldGapCanvasProps) {
  const [benchmark, setBenchmark] = useState<Benchmark>("3y_deposit");
  const [taxContext, setTaxContext] = useState<TaxContext>("stock_connect");

  if (!yieldData) return <div className="yield-canvas">暂无股息利差数据</div>;

  const bondRate = yieldData.risk_free_bond_rate * 100;
  const depositRate = yieldData.risk_free_deposit_rate * 100;
  const fiveYRate = depositRate; // placeholder: backend has no 5Y yet

  const displayNetYield =
    taxContext === "native" && yieldData.market === "HK_SHARE"
      ? yieldData.gross_dividend_yield * 100
      : yieldData.net_dividend_yield * 100;
  const netPct = displayNetYield.toFixed(2);

  const benchmarkRate =
    benchmark === "10y_bond"
      ? bondRate
      : benchmark === "5y_deposit"
        ? fiveYRate
        : depositRate;
  const spread = displayNetYield - benchmarkRate;
  const spreadStr =
    spread >= 0 ? `+${spread.toFixed(2)}%` : `${spread.toFixed(2)}%`;

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}月`,
    净股息率: yieldData.net_dividend_yield * 100,
    "10年国债": bondRate,
    "3年大额存单": depositRate,
  }));

  return (
    <div className="yield-canvas">
      <h3>机会成本对标区</h3>
      <div className="yield-canvas__controls">
        <label className="yield-canvas__label">
          银行存款基准
          <Select.Root
            value={benchmark}
            onValueChange={(v) => setBenchmark(v as Benchmark)}
          >
            <Select.Trigger className="yield-canvas__select">
              <Select.Value />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content>
                <Select.Item value="3y_deposit">3年大额存单</Select.Item>
                <Select.Item value="5y_deposit">5年定存</Select.Item>
                <Select.Item value="10y_bond">10年债</Select.Item>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </label>
        {yieldData.market === "HK_SHARE" && (
          <label className="yield-canvas__label">
            税率逻辑
            <select
              className="yield-canvas__select"
              value={taxContext}
              onChange={(e) => setTaxContext(e.target.value as TaxContext)}
            >
              <option value="stock_connect">港股通 (20% 红利税)</option>
              <option value="native">原生账户 (无扣税)</option>
            </select>
          </label>
        )}
      </div>
      <div className="yield-canvas__chart">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={months}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(v: unknown) =>
                typeof v === "number" ? `${v.toFixed(2)}%` : String(v)
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="净股息率"
              stroke="#22c55e"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="10年国债"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="3年大额存单"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="yield-canvas__panel">
        <p>
          当前净股息率
          {taxContext === "native" && yieldData.market === "HK_SHARE"
            ? "（原生账户）"
            : ""}
          : <strong>{netPct}%</strong>
        </p>
        <p className="yield-canvas__spread">
          超额收益 (Spread): <strong>{spreadStr}</strong>
        </p>
        <p>
          10年国债: {bondRate.toFixed(2)}% · 3年大额存单:{" "}
          {depositRate.toFixed(2)}%
        </p>
      </div>
      {yieldData.narrative && (
        <div className="yield-canvas__narrative">
          <h4>AI 分析摘要</h4>
          <p className="yield-canvas__narrative-summary">
            {yieldData.narrative.summary}
          </p>
          {(yieldData.narrative.bullets?.length ?? 0) > 0 && (
            <ul className="yield-canvas__narrative-bullets">
              {yieldData.narrative.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          <p className="yield-canvas__narrative-meta">
            由 {yieldData.narrative.llm_provider} 生成 ·{" "}
            {new Date(yieldData.narrative.generated_at).toLocaleString("zh-CN")}
          </p>
        </div>
      )}
    </div>
  );
}
