import type { FormEvent } from "react";

interface TickerInputProps {
  ticker: string;
  onTickerChange: (v: string) => void;
  costBasis: string;
  onCostBasisChange: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
}

export function TickerInput({
  ticker,
  onTickerChange,
  costBasis,
  onCostBasisChange,
  onAnalyze,
  loading,
  error,
}: TickerInputProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onAnalyze();
  }

  return (
    <form onSubmit={handleSubmit} className="ticker-input">
      <div className="ticker-input__row">
        <label htmlFor="ticker">股票代码</label>
        <input
          id="ticker"
          type="text"
          placeholder="600519.SH / 000002.SZ / 0700.HK"
          value={ticker}
          onChange={(e) => onTickerChange(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="ticker-input__row">
        <label htmlFor="cost_basis">成本价（元/股，可选）</label>
        <input
          id="cost_basis"
          type="number"
          min="0"
          step="0.01"
          placeholder="用于股息率计算"
          value={costBasis}
          onChange={(e) => onCostBasisChange(e.target.value)}
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "分析中…" : "分析"}
      </button>
      {error && <p className="ticker-input__error" role="alert">{error}</p>}
    </form>
  );
}
