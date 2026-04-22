import { motion } from 'framer-motion';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export interface ProcessingStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

function StepIcon({ status }: { status: ProcessingStep['status'] }) {
  switch (status) {
    case 'done':
      return <Check size={12} className="text-accent" />;
    case 'active':
      return <Loader2 size={12} className="text-accent animate-spin" />;
    case 'error':
      return <AlertCircle size={12} className="text-red-400" />;
    default:
      return <span className="block w-1.5 h-1.5 rounded-full bg-text-tertiary" />;
  }
}

function statusLabel(status: ProcessingStep['status']) {
  switch (status) {
    case 'done': return '✓';
    case 'active': return '◌';
    case 'error': return '✗';
    default: return '·';
  }
}

export function ProcessingStatus({ steps }: { steps: ProcessingStep[] }) {
  return (
    <div className="bg-surface-2 border border-border rounded-md px-4 py-3">
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2.5"
          >
            <span className={`font-mono text-[11px] w-3 text-center
              ${step.status === 'done' ? 'text-accent' : ''}
              ${step.status === 'error' ? 'text-red-400' : ''}
              ${step.status === 'active' ? 'text-accent' : ''}
              ${step.status === 'pending' ? 'text-text-tertiary' : ''}
            `}>
              {statusLabel(step.status)}
            </span>
            <StepIcon status={step.status} />
            <span className={`font-mono text-xs
              ${step.status === 'done' ? 'text-text-secondary' : ''}
              ${step.status === 'active' ? 'text-text-primary' : ''}
              ${step.status === 'error' ? 'text-red-400' : ''}
              ${step.status === 'pending' ? 'text-text-tertiary' : ''}
            `}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
