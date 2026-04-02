import type { FormEvent } from "react";
import * as Select from "@radix-ui/react-select";

type Exchange = "SH" | "SZ" | "HK";

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
  // Parse ticker into code and exchange
  const parseTicker = (ticker: string) => {
    const match = ticker.match(/^(\d+)\.(SH|SZ|HK)$/);
    if (match) {
      return { code: match[1], exchange: match[2] as Exchange };
    }
    // Handle .EXCHANGE format when user selected exchange before typing code
    const exchangeOnly = ticker.match(/^\.(SH|SZ|HK)$/);
    if (exchangeOnly) {
      return { code: "", exchange: exchangeOnly[1] as Exchange };
    }
    return { code: ticker.replace(/\D/g, ""), exchange: "SH" as Exchange };
  };

  const { code, exchange } = parseTicker(ticker);

  const handleCodeChange = (newCode: string) => {
    // Strip non-digit characters to prevent exchange suffix accumulation
    const digits = newCode.replace(/\D/g, "");
    if (digits) {
      onTickerChange(`${digits}.${exchange}`);
    } else {
      onTickerChange("");
    }
  };

  const handleExchangeChange = (newExchange: Exchange) => {
    // Only update if code is non-empty
    if (code.trim()) {
      onTickerChange(`${code}.${newExchange}`);
    } else {
      // Just update exchange in state, don't append to empty code
      onTickerChange(`.${newExchange}`);
    }
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onAnalyze();
  }

  const exchanges: { value: Exchange; label: string }[] = [
    { value: "SH", label: "上海" },
    { value: "SZ", label: "深圳" },
    { value: "HK", label: "港股" },
  ];

  return (
    <form onSubmit={handleSubmit} className="ticker-input">
      <div className="ticker-input__row">
        <label>股票代码</label>
        <div className="ticker-input__code-group">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="600519"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={loading}
            className="ticker-input__code-field"
          />
          <Select.Root
            value={exchange}
            onValueChange={handleExchangeChange}
            disabled={loading}
          >
            <Select.Trigger
              className="ticker-input__exchange-trigger"
              aria-label="选择交易所"
            >
              <Select.Value />
              <Select.Icon className="ticker-input__exchange-icon">
                ▼
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="ticker-input__exchange-content">
                <Select.Viewport className="ticker-input__exchange-viewport">
                  {exchanges.map((ex) => (
                    <Select.Item
                      key={ex.value}
                      value={ex.value}
                      className="ticker-input__exchange-item"
                    >
                      <Select.ItemText>{ex.label}</Select.ItemText>
                      <Select.ItemIndicator className="ticker-input__exchange-item-indicator">
                        ✓
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
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
      {error && (
        <p className="ticker-input__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
