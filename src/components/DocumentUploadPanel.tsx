import { useCallback, useRef, useState } from "react";
import { uploadDocument } from "../api/client";
import type { DocumentUploadResponse } from "../api/types";

interface DocumentUploadPanelProps {
  ticker?: string;
  onUploadSuccess?: (result: DocumentUploadResponse) => void;
}

export function DocumentUploadPanel({
  ticker,
  onUploadSuccess,
}: DocumentUploadPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<DocumentUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== "application/pdf") {
      return "仅支持 PDF 格式文件";
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return "文件大小不能超过 50MB";
    }

    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(true);
      setError(null);
      setUploadResult(null);

      try {
        const result = await uploadDocument(file, ticker);
        if (result.success && result.data) {
          setUploadResult(result.data);
          if (onUploadSuccess) {
            onUploadSuccess(result.data);
          }
        } else {
          setError(result.error ?? "上传失败");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "上传失败");
      } finally {
        setUploading(false);
      }
    },
    [ticker, onUploadSuccess],
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getStatusText = (status: DocumentUploadResponse["status"]): string => {
    const statusMap: Record<DocumentUploadResponse["status"], string> = {
      PENDING: "等待处理",
      PROCESSING: "处理中",
      COMPLETED: "处理完成",
      FAILED: "处理失败",
    };
    return statusMap[status];
  };

  return (
    <div className="document-upload-panel">
      <div
        className={`document-upload-panel__dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "disabled" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileSelect}
          disabled={uploading}
          hidden
        />

        <div className="document-upload-panel__icon">
          {uploading ? (
            <span className="document-upload-panel__spinner" />
          ) : (
            <span>📄</span>
          )}
        </div>

        <div className="document-upload-panel__text">
          {uploading ? (
            <span>上传中...</span>
          ) : (
            <>
              <span>拖拽 PDF 文件到这里</span>
              <span className="document-upload-panel__hint">
                或点击选择文件（最大 50MB）
              </span>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="document-upload-panel__error" role="alert">
          {error}
        </p>
      )}

      {uploadResult && (
        <div className="document-upload-panel__result">
          <div className="document-upload-panel__result-header">
            <span className="document-upload-panel__result-icon">
              {uploadResult.status === "COMPLETED" ? "✓" : "⏳"}
            </span>
            <span className="document-upload-panel__result-filename">
              {uploadResult.filename}
            </span>
            <span className="document-upload-panel__result-size">
              {formatFileSize(uploadResult.file_size)}
            </span>
          </div>
          <div className="document-upload-panel__result-meta">
            <span>状态：{getStatusText(uploadResult.status)}</span>
            {uploadResult.ticker && (
              <span>股票代码：{uploadResult.ticker}</span>
            )}
            {uploadResult.stock_name && (
              <span>股票名称：{uploadResult.stock_name}</span>
            )}
          </div>
        </div>
      )}

      <style>{`
        .document-upload-panel {
          background: transparent;
        }

        .document-upload-panel__dropzone {
          border: 2px dashed #555;
          border-radius: 6px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #1a1a1a;
        }

        .document-upload-panel__dropzone:hover {
          border-color: #888;
          background: #222;
        }

        .document-upload-panel__dropzone.drag-over {
          border-color: #646cff;
          background: #1a1a2e;
        }

        .document-upload-panel__dropzone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .document-upload-panel__icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .document-upload-panel__spinner {
          display: inline-block;
          width: 24px;
          height: 24px;
          border: 3px solid #555;
          border-top-color: #646cff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .document-upload-panel__text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .document-upload-panel__text > span:first-child {
          font-size: 14px;
          color: #ddd;
        }

        .document-upload-panel__hint {
          font-size: 12px;
          color: #888;
        }

        .document-upload-panel__error {
          margin: 8px 0 0 0;
          padding: 8px 12px;
          background: #2a1515;
          color: #ef4444;
          border-radius: 4px;
          font-size: 13px;
        }

        .document-upload-panel__result {
          margin-top: 12px;
          padding: 12px;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 4px;
        }

        .document-upload-panel__result-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .document-upload-panel__result-icon {
          font-size: 18px;
        }

        .document-upload-panel__result-filename {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: #ddd;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .document-upload-panel__result-size {
          font-size: 12px;
          color: #888;
        }

        .document-upload-panel__result-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #aaa;
        }

        .document-upload-panel__result-meta > span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
}
