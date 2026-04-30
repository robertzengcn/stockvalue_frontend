import { type ReactNode, useState } from "react";
import { RiskAnalysisPanel } from "./RiskAnalysisPanel";
import { DocumentUploadPanel } from "./DocumentUploadPanel";

type Tab = "basic" | "risk" | "upload";

interface AnalysisTabsProps {
  ticker?: string;
  onAnalyzeRisk: (year?: number) => void;
  riskLoading: boolean;
  basicContent: ReactNode;
}

export function AnalysisTabs({
  ticker,
  onAnalyzeRisk,
  riskLoading,
  basicContent,
}: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  return (
    <div className="analysis-tabs">
      <div className="analysis-tabs__header">
        <button
          className={`analysis-tabs__tab ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          基础信息分析
        </button>
        <button
          className={`analysis-tabs__tab ${activeTab === "risk" ? "active" : ""}`}
          onClick={() => setActiveTab("risk")}
        >
          风险分析
        </button>
        <button
          className={`analysis-tabs__tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          文档上传
        </button>
      </div>

      <div className="analysis-tabs__content">
        {activeTab === "basic" && basicContent}
        {activeTab === "risk" && (
          <RiskAnalysisPanel onAnalyze={onAnalyzeRisk} loading={riskLoading} />
        )}
        {activeTab === "upload" && (
          <DocumentUploadPanel ticker={ticker || undefined} />
        )}
      </div>

      <style>{`
        .analysis-tabs {
          margin-bottom: 16px;
        }

        .analysis-tabs__header {
          display: flex;
          border-bottom: 1px solid #444;
          margin-bottom: 0;
        }

        .analysis-tabs__tab {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #999;
          transition: all 0.2s ease;
        }

        .analysis-tabs__tab:hover {
          color: #ddd;
          background: #2a2a2a;
        }

        .analysis-tabs__tab.active {
          color: #646cff;
          border-bottom-color: #646cff;
        }

        .analysis-tabs__content {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 16px 0;
        }
      `}</style>
    </div>
  );
}
