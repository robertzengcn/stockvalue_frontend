import { TickerInput } from "../components/TickerInput";
import { useDashboard } from "../hooks/useDashboard";
import { SafetyRibbon } from "../components/SafetyRibbon";
import { RiskAnalysisPanel } from "../components/RiskAnalysisPanel";
import { YieldGapCanvas } from "../components/YieldGapCanvas";
import { ValuationSandbox } from "../components/ValuationSandbox";
import { AuditTrail } from "../components/AuditTrail";

export function Dashboard() {
  const {
    ticker,
    setTicker,
    costBasis,
    setCostBasis,
    risk,
    yieldData,
    valuation,
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

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>价值投资决策看板</h1>
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

      <section className="dashboard__risk-panel">
        <RiskAnalysisPanel onAnalyze={analyzeRiskOnly} loading={riskLoading} />
      </section>

      {hasResults && (
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
            <AuditTrail risk={risk} valuation={valuation} />
          </section>
        </>
      )}
    </div>
  );
}
