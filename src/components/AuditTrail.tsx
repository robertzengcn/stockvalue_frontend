import type { RiskScore, ValuationResult } from "../api/types";

interface AuditTrailProps {
  risk: RiskScore | null;
  valuation: ValuationResult | null;
}

export function AuditTrail({ risk, valuation }: AuditTrailProps) {
  const summary =
    risk?.red_flags?.length
      ? `风险提示：${risk.red_flags.join("；")}`
      : "暂无AI诊断简述（可来自财报与估值审计）。";
  const sources: string[] = [];
  if (valuation?.audit_trail) {
    if (valuation.audit_trail.params) sources.push("DCF 参数与假设");
    if (valuation.audit_trail.fcf_projections) sources.push("自由现金流预测");
  }

  return (
    <div className="audit-trail">
      <h3>AI 逻辑追溯区</h3>
      <div className="audit-trail__grid">
        <div className="audit-trail__summary">
          <h4>AI 诊断简述</h4>
          <p>{summary}</p>
        </div>
        <div className="audit-trail__sources">
          <h4>数据溯源</h4>
          <ul>
            {sources.length > 0
              ? sources.map((s, i) => <li key={i}>{s}</li>)
              : <li>财报原文位置（待后端提供链接）</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
