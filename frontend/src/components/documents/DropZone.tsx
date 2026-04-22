import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { uploadDocument } from '../../lib/api';
import { ProcessingStatus, type ProcessingStep } from './ProcessingStatus';

interface DropZoneProps {
  onUploadComplete?: () => void;
}

export function DropZone({ onUploadComplete }: DropZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setSteps([]);
      setStatus('idle');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: status === 'uploading' || status === 'processing',
  });

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setSteps([{ label: 'Uploading', status: 'active' }]);

    try {
      setSteps([
        { label: 'Uploaded', status: 'done' },
        { label: 'Parsing & vectorizing', status: 'active' },
      ]);
      setStatus('processing');

      await uploadDocument(file);

      setSteps([
        { label: 'Uploaded', status: 'done' },
        { label: 'Parsed', status: 'done' },
        { label: 'Vectorized', status: 'done' },
        { label: 'Saved to database', status: 'done' },
      ]);
      setStatus('done');
      setFile(null);
      onUploadComplete?.();

      // Reset after a bit
      setTimeout(() => {
        setSteps([]);
        setStatus('idle');
      }, 3000);
    } catch {
      setSteps((prev) => [
        ...prev.map((s) => (s.status === 'active' ? { ...s, status: 'error' as const } : s)),
      ]);
      setStatus('error');
    }
  };

  const clearFile = () => {
    setFile(null);
    setSteps([]);
    setStatus('idle');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-md p-6 flex flex-col items-center justify-center
          text-center cursor-pointer transition-colors duration-150 min-h-[120px]
          ${isDragActive
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-border-hover text-text-tertiary hover:border-text-tertiary hover:text-text-secondary'
          }
          ${(status === 'uploading' || status === 'processing') ? 'pointer-events-none opacity-40' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={20} className="mb-2" />
        <p className="font-mono text-xs">
          {isDragActive ? 'Drop here' : 'Drop PDF or click to select'}
        </p>
      </div>

      {/* Selected file */}
      {file && status === 'idle' && (
        <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-md px-3 py-2.5">
          <FileText size={16} className="text-text-tertiary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-primary font-mono truncate">{file.name}</p>
            <p className="text-[10px] text-text-tertiary font-mono">{formatSize(file.size)}</p>
          </div>
          <button onClick={clearFile} className="text-text-tertiary hover:text-text-secondary">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload button */}
      {file && status === 'idle' && (
        <button onClick={handleUpload} className="btn-primary w-full text-center">
          Upload & Vectorize
        </button>
      )}

      {/* Processing status */}
      {steps.length > 0 && <ProcessingStatus steps={steps} />}

      {/* Error retry */}
      {status === 'error' && (
        <button onClick={clearFile} className="btn-ghost w-full text-center">
          Try again
        </button>
      )}
    </div>
  );
}
