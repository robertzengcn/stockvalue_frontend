/**
 * API client for StockValueFinder backend.
 * Base URL from import.meta.env.VITE_API_BASE_URL.
 */

import type {
  ApiResponse,
  DCFValuationRequest,
  RiskAnalysisRequest,
  RiskScore,
  ValuationResult,
  YieldAnalysisRequest,
  YieldGap,
} from "./types";

const BASE_URL =
  (import.meta as unknown as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as ApiResponse<T>;
  if (!res.ok) {
    return {
      success: false,
      data: null,
      error: data.error ?? `HTTP ${res.status}`,
      meta: data.meta,
    };
  }
  return data;
}

export function analyzeRisk(
  request: RiskAnalysisRequest,
): Promise<ApiResponse<RiskScore>> {
  const body: Record<string, unknown> = { ticker: request.ticker };
  if (request.year !== undefined) body.year = request.year;
  return post<RiskScore>("/api/v1/analyze/risk/", body);
}

export function analyzeYield(
  request: YieldAnalysisRequest,
): Promise<ApiResponse<YieldGap>> {
  return post<YieldGap>("/api/v1/analyze/yield/", {
    ticker: request.ticker,
    cost_basis: request.cost_basis,
  });
}

export function analyzeDcf(
  request: DCFValuationRequest,
): Promise<ApiResponse<ValuationResult>> {
  return post<ValuationResult>("/api/v1/analyze/dcf/", request);
}
