import { TickerInput } from "../components/TickerInput";
import { useDashboard } from "../hooks/useDashboard";
import { SafetyRibbon } from "../components/SafetyRibbon";
import { YieldGapCanvas } from "../components/YieldGapCanvas";
import { ValuationSandbox } from "../components/ValuationSandbox";
import { AuditTrail } from "../components/AuditTrail";
import { AnalysisTabs } from "../components/AnalysisTabs";

export function Dashboard() {
  const {
    ticker,
    setTicker,
    costBasis,
    setCostBasis,
    risk,
    yieldData,
    valuation,
    riskDocContext,
    dcfDocContext,
    stockName,
    loading,
    riskLoading,
    dcfLoading,
    error,
    analyze,
    analyzeRiskOnly,
    refreshDcf,
  } = useDashboard();

  const hasResults = risk ?? yieldData ?? valuation;

  const basicContent = hasResults ? (
    <>
      <section className="dashboard__safety">
        <SafetyRibbon ticker={ticker} risk={risk} />
      </section>

      <div className="dashboard__body">
        <section className="dashboard__yield">
          <YieldGapCanvas yieldData={yieldData} />
        </section>
        <section className="dashboard__valuation">
          <ValuationSandbox
            ticker={ticker}
            valuation={valuation}
            dcfLoading={dcfLoading}
            onParamsChange={refreshDcf}
          />
        </section>
      </div>

      <section className="dashboard__audit">
        <AuditTrail
          risk={risk}
          yieldData={yieldData}
          valuation={valuation}
          riskDocContext={riskDocContext}
          dcfDocContext={dcfDocContext}
        />
      </section>
    </>
  ) : (
    <p className="dashboard__empty">请输入股票代码并点击分析</p>
  );

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        {/* <h1>价值投资决策看板</h1> */}
        {stockName && (
          <span className="dashboard__stock-name">{stockName}</span>
        )}
        <TickerInput
          ticker={ticker}
          onTickerChange={setTicker}
          costBasis={costBasis}
          onCostBasisChange={setCostBasis}
          onAnalyze={analyze}
          loading={loading}
          error={error}
        />
      </header>

      <section className="dashboard__tabs">
        <AnalysisTabs
          ticker={ticker || undefined}
          onAnalyzeRisk={analyzeRiskOnly}
          riskLoading={riskLoading}
          basicContent={basicContent}
        />
      </section>
    </div>
  );
}
