import { useCallback, useState } from "react";
import { analyzeDcf, analyzeRisk, analyzeYield } from "../api/client";
import type {
  DCFValuationRequest,
  RiskAnalysisRequest,
  RiskScore,
  ValuationResult,
  YieldGap,
} from "../api/types";

const TICKER_REGEX = /^\d{4,6}\.(SH|SZ|HK)$/i;

const DEFAULT_DCF: DCFValuationRequest = {
  ticker: "",
  growth_rate_stage1: 0.05,
  growth_rate_stage2: 0.03,
  years_stage1: 5,
  years_stage2: 5,
  terminal_growth: 0.025,
};

export function useDashboard() {
  const [ticker, setTicker] = useState("");
  const [costBasis, setCostBasis] = useState<string>("");
  const [risk, setRisk] = useState<RiskScore | null>(null);
  const [yieldData, setYieldData] = useState<YieldGap | null>(null);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dcfLoading, setDcfLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateTicker = useCallback(
    (t: string) => TICKER_REGEX.test(t.trim()),
    [],
  );

  const analyze = useCallback(async () => {
    const t = ticker.trim().toUpperCase();
    if (!TICKER_REGEX.test(t)) {
      setError("请输入正确股票代码，如 600519.SH、000002.SZ、0700.HK");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const [riskRes, yieldRes, dcfRes] = await Promise.all([
        analyzeRisk({ ticker: t }),
        analyzeYield({
          ticker: t,
          cost_basis: costBasis ? Number(costBasis) : 100,
        }),
        analyzeDcf({ ticker: t }),
      ]);
      if (riskRes.success && riskRes.data) setRisk(riskRes.data);
      else setRisk(null);
      if (yieldRes.success && yieldRes.data) setYieldData(yieldRes.data);
      else setYieldData(null);
      if (dcfRes.success && dcfRes.data) setValuation(dcfRes.data);
      else setValuation(null);
      const err = riskRes.error ?? yieldRes.error ?? dcfRes.error;
      if (err) setError(err);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
      setRisk(null);
      setYieldData(null);
      setValuation(null);
    } finally {
      setLoading(false);
    }
  }, [ticker, costBasis]);

  const analyzeRiskOnly = useCallback(
    async (year?: number) => {
      const t = ticker.trim().toUpperCase();
      if (!TICKER_REGEX.test(t)) {
        setError("请输入正确股票代码，如 600519.SH、000002.SZ、0700.HK");
        return;
      }
      setError(null);
      setRiskLoading(true);
      try {
        const req: RiskAnalysisRequest = { ticker: t };
        if (year !== undefined) req.year = year;
        const res = await analyzeRisk(req);
        if (res.success && res.data) {
          setRisk(res.data);
        } else {
          setRisk(null);
          if (res.error) setError(res.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "风险分析请求失败");
        setRisk(null);
      } finally {
        setRiskLoading(false);
      }
    },
    [ticker],
  );

  const refreshDcf = useCallback(
    async (partial: Partial<Omit<DCFValuationRequest, "ticker">>) => {
      const t = ticker.trim().toUpperCase();
      if (!TICKER_REGEX.test(t)) return;
      const base = valuation?.dcf_params
        ? {
            ticker: t,
            growth_rate_stage1: valuation.dcf_params.growth_rate_stage1,
            growth_rate_stage2: valuation.dcf_params.growth_rate_stage2,
            years_stage1: valuation.dcf_params.years_stage1,
            years_stage2: valuation.dcf_params.years_stage2,
            terminal_growth: valuation.dcf_params.terminal_growth,
            risk_free_rate: valuation.dcf_params.risk_free_rate,
            beta: valuation.dcf_params.beta,
            market_risk_premium: valuation.dcf_params.market_risk_premium,
          }
        : { ...DEFAULT_DCF, ticker: t };
      const next: DCFValuationRequest = { ...base, ...partial };
      setDcfLoading(true);
      try {
        const res = await analyzeDcf(next);
        if (res.success && res.data) setValuation(res.data);
      } finally {
        setDcfLoading(false);
      }
    },
    [ticker, valuation?.dcf_params],
  );

  return {
    ticker,
    setTicker,
    costBasis,
    setCostBasis,
    risk,
    yieldData,
    valuation,
    loading,
    riskLoading,
    dcfLoading,
    error,
    validateTicker,
    analyze,
    analyzeRiskOnly,
    refreshDcf,
  };
}
