/**
 * API types mirroring backend (stockvalue_backend).
 * Envelope and request/response DTOs for analyze endpoints.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: { total?: number; page?: number; limit?: number };
}

// --- Enums (match backend) ---
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type YieldRecommendation = "ATTRACTIVE" | "NEUTRAL" | "UNATTRACTIVE";
export type ValuationLevel =
  | "SIGNIFICANTLY_UNDERVALUED"
  | "UNDERVALUED"
  | "FAIR_VALUE"
  | "OVERVALUED"
  | "SIGNIFICANTLY_OVERVALUED";
export type Market = "A_SHARE" | "HK_SHARE";

// --- Risk ---
export interface MScoreData {
  dsri: number;
  gmi: number;
  aqi: number;
  sgi: number;
  depi: number;
  sgai: number;
  lvgi: number;
  tata: number;
}

export interface RiskScore {
  ticker: string;
  report_id: string;
  risk_level: RiskLevel;
  score_id: string;
  calculated_at: string;
  m_score: number;
  mscore_data: MScoreData;
  /** High cash + high debt flag (存贷双高) */
  存贷双高: boolean;
  cash_amount: number;
  debt_amount: number;
  cash_growth_rate: number;
  debt_growth_rate: number;
  goodwill_ratio: number;
  goodwill_excessive: boolean;
  profit_cash_divergence: boolean;
  profit_growth: number;
  ocf_growth: number;
  red_flags: string[];
}

// --- Yield ---
export interface YieldGap {
  ticker: string;
  cost_basis: number;
  current_price: number;
  gross_dividend_yield: number;
  net_dividend_yield: number;
  risk_free_bond_rate: number;
  risk_free_deposit_rate: number;
  yield_gap: number;
  recommendation: YieldRecommendation;
  market: Market;
  analysis_id: string;
  calculated_at: string;
}

// --- Valuation (DCF) ---
export interface DCFParams {
  growth_rate_stage1: number;
  growth_rate_stage2: number;
  years_stage1: number;
  years_stage2: number;
  terminal_growth: number;
  risk_free_rate: number;
  beta: number;
  market_risk_premium: number;
}

export interface ValuationResult {
  ticker: string;
  current_price: number;
  intrinsic_value: number;
  wacc: number;
  margin_of_safety: number;
  valuation_level: ValuationLevel;
  valuation_id: string;
  calculated_at: string;
  dcf_params: DCFParams;
  audit_trail: Record<string, unknown>;
}

// --- Request DTOs ---
export interface RiskAnalysisRequest {
  ticker: string;
  year?: number;
}

export interface YieldAnalysisRequest {
  ticker: string;
  cost_basis: number;
}

export interface DCFValuationRequest {
  ticker: string;
  growth_rate_stage1?: number;
  growth_rate_stage2?: number;
  years_stage1?: number;
  years_stage2?: number;
  terminal_growth?: number;
  risk_free_rate?: number;
  beta?: number;
  market_risk_premium?: number;
}
