import { useEffect, useRef, useState, startTransition } from "react";
import * as Slider from "@radix-ui/react-slider";
import type { DCFValuationRequest, ValuationResult } from "../api/types";

interface ValuationSandboxProps {
  ticker: string;
  valuation: ValuationResult | null;
  dcfLoading: boolean;
  onParamsChange: (
    params: Partial<Omit<DCFValuationRequest, "ticker">>,
  ) => void;
}

const DEBOUNCE_MS = 400;

export function ValuationSandbox({
  valuation,
  dcfLoading,
  onParamsChange,
}: ValuationSandboxProps) {
  const [g, setG] = useState(0.05);
  const [rf, setRf] = useState(0.03);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevValuationIdRef = useRef<string | undefined>();

  useEffect(() => {
    if (!valuation?.dcf_params) return;
    if (prevValuationIdRef.current === valuation.valuation_id) return;
    prevValuationIdRef.current = valuation.valuation_id;
    startTransition(() => {
      setG(valuation.dcf_params.growth_rate_stage1);
      setRf(valuation.dcf_params.risk_free_rate);
    });
  }, [valuation]);

  useEffect(() => {
    if (!valuation) return;
    const same =
      Math.abs(g - valuation.dcf_params.growth_rate_stage1) < 1e-6 &&
      Math.abs(rf - valuation.dcf_params.risk_free_rate) < 1e-6;
    if (same) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onParamsChange({ growth_rate_stage1: g, risk_free_rate: rf });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [g, rf, valuation, onParamsChange]);

  if (!valuation) return <div className="valuation-sandbox">暂无估值数据</div>;

  const iv = valuation.intrinsic_value;
  const price = valuation.current_price;
  const margin = valuation.margin_of_safety * 100;
  const rangeMin = iv * 0.7;
  const rangeMax = iv * 1.3;
  const positionPct =
    rangeMax > rangeMin
      ? ((price - rangeMin) / (rangeMax - rangeMin)) * 100
      : 50;

  const conclusion =
    margin > 0
      ? `当前具备 **${margin.toFixed(0)}%** 安全边际`
      : `溢价 **${(-margin).toFixed(0)}%**，建议等待`;

  return (
    <div className="valuation-sandbox">
      <h3>动态估值沙盒</h3>
      <div className="valuation-sandbox__ruler" role="img" aria-label="价值尺">
        <div className="valuation-sandbox__ruler-track">
          <span className="valuation-sandbox__ruler-label valuation-sandbox__ruler-label--left">
            安全边际区
          </span>
          <span className="valuation-sandbox__ruler-label valuation-sandbox__ruler-label--right">
            溢价区
          </span>
          <div
            className="valuation-sandbox__ruler-pointer"
            style={{ left: `${Math.max(0, Math.min(100, positionPct))}%` }}
          >
            当前股价 {price.toFixed(2)}
          </div>
        </div>
        <p className="valuation-sandbox__iv">内在价值: {iv.toFixed(2)} 元/股</p>
      </div>
      <div className="valuation-sandbox__sliders">
        <label className="valuation-sandbox__slider-label">
          营收增长率 g: {(g * 100).toFixed(1)}%
          <Slider.Root
            className="valuation-sandbox__slider"
            min={0}
            max={20}
            step={0.5}
            value={[g * 100]}
            onValueChange={([v]) => setG(v / 100)}
            disabled={dcfLoading}
          >
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb />
          </Slider.Root>
        </label>
        <label className="valuation-sandbox__slider-label">
          无风险利率 (Rf): {(rf * 100).toFixed(1)}%
          <Slider.Root
            className="valuation-sandbox__slider"
            min={1}
            max={10}
            step={0.1}
            value={[rf * 100]}
            onValueChange={([v]) => setRf(v / 100)}
            disabled={dcfLoading}
          >
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb />
          </Slider.Root>
        </label>
      </div>
      {dcfLoading && <p className="valuation-sandbox__updating">更新中…</p>}
      <p
        className={`valuation-sandbox__conclusion ${margin > 15 ? "valuation-sandbox__conclusion--safe" : ""}`}
        dangerouslySetInnerHTML={{
          __html: conclusion.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
        }}
      />
      <p>
        WACC: {(valuation.wacc * 100).toFixed(2)}% · 估值水平:{" "}
        {valuation.valuation_level}
      </p>
    </div>
  );
}
