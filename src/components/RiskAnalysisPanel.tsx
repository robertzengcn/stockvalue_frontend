import { useState } from "react";

interface RiskAnalysisPanelProps {
  onAnalyze: (year?: number) => void;
  loading: boolean;
}

export function RiskAnalysisPanel({ onAnalyze, loading }: RiskAnalysisPanelProps) {
  const [year, setYear] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = year.trim() ? parseInt(year, 10) : undefined;
    onAnalyze(y);
  }

  return (
    <form onSubmit={handleSubmit} className="risk-panel">
      <h3>风险分析</h3>
      <div className="risk-panel__controls">
        <div className="risk-panel__field">
          <label htmlFor="risk-year">分析年份（可选）</label>
          <input
            id="risk-year"
            type="number"
            min="2000"
            max="2099"
            placeholder="留空为最近年度"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className="risk-panel__btn" disabled={loading}>
          {loading ? "分析中…" : "单独风险分析"}
        </button>
      </div>
    </form>
  );
}
