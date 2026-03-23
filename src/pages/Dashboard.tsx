import { TickerInput } from "../components/TickerInput";
import { useDashboard } from "../hooks/useDashboard";
import { SafetyRibbon } from "../components/SafetyRibbon";
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
    loading,
    dcfLoading,
    error,
    analyze,
    refreshDcf,
  } = useDashboard();

  const hasResults = risk ?? yieldData ?? valuation;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>价值投资决策看板</h1>
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
