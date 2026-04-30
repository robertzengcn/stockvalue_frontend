import type {
  DocumentContextChunk,
  RiskScore,
  ValuationResult,
  YieldGap,
} from "../api/types";

interface AuditTrailProps {
  risk: RiskScore | null;
  yieldData: YieldGap | null;
  valuation: ValuationResult | null;
  riskDocContext: DocumentContextChunk[];
  dcfDocContext: DocumentContextChunk[];
}

export function AuditTrail({
  risk,
  yieldData,
  valuation,
  riskDocContext,
  dcfDocContext,
}: AuditTrailProps) {
  const summary = [
    risk?.narrative?.summary,
    yieldData?.narrative?.summary,
    valuation?.narrative?.summary,
  ]
    .filter(Boolean)
    .join("；");

  const keyDrivers = [
    ...(risk?.narrative?.key_drivers ?? []),
    ...(yieldData?.narrative?.key_drivers ?? []),
    ...(valuation?.narrative?.key_drivers ?? []),
  ];

  const keyRisks = [
    ...(risk?.narrative?.risks ?? []),
    ...(yieldData?.narrative?.risks ?? []),
    ...(valuation?.narrative?.risks ?? []),
  ];

  const sources: string[] = [];
  if (valuation?.audit_trail) {
    if (valuation.audit_trail.params) sources.push("DCF 参数与假设");
    if (valuation.audit_trail.fcf_projections) sources.push("自由现金流预测");
  }
  if (risk?.mscore_data?.audit_trail) {
    sources.push("M-Score 单项指标审计痕迹");
  }

  const docContext = [...riskDocContext, ...dcfDocContext];
  const uniqueDocContext = docContext.filter(
    (item, index, arr) =>
      arr.findIndex((x) => x.chunk_id === item.chunk_id) === index,
  );

  return (
    <div className="audit-trail">
      <h3>AI 逻辑追溯区</h3>
      <div className="audit-trail__grid">
        <div className="audit-trail__summary">
          <h4>AI 诊断简述</h4>
          <p>{summary || "暂无AI诊断简述（可来自财报与估值审计）。"}</p>
          {(keyDrivers.length > 0 || keyRisks.length > 0) && (
            <div className="audit-trail__narrative">
              {keyDrivers.length > 0 && (
                <>
                  <h5>关键驱动</h5>
                  <ul>
                    {keyDrivers.map((item, idx) => (
                      <li key={`driver-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              {keyRisks.length > 0 && (
                <>
                  <h5>关键风险</h5>
                  <ul>
                    {keyRisks.map((item, idx) => (
                      <li key={`risk-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
        <div className="audit-trail__sources">
          <h4>数据溯源</h4>
          <ul>
            {sources.length > 0
              ? sources.map((s, i) => <li key={i}>{s}</li>)
              : <li>财报原文位置（待后端提供链接）</li>}
          </ul>
          {uniqueDocContext.length > 0 && (
            <div className="audit-trail__doc-context">
              <h5>文档片段上下文</h5>
              <ul>
                {uniqueDocContext.slice(0, 4).map((item) => (
                  <li key={item.chunk_id}>
                    <strong>
                      {item.section || "未命名章节"}
                      {item.page_number ? ` · 第${item.page_number}页` : ""}
                    </strong>
                    <p>{item.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
