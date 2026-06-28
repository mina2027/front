import React from 'react';
import { Sparkles, MessageCircle, CheckCircle2 } from 'lucide-react';
import { ReportStatus } from '../types';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const config: Record<
  ReportStatus,
  { label: string; pill: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  new:      { label: 'New',              pill: 'pill-brand',   Icon: Sparkles },
  pending:  { label: 'In Communication', pill: 'pill-warning', Icon: MessageCircle },
  resolved: { label: 'Reunited',         pill: 'pill-success', Icon: CheckCircle2 },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { label, pill, Icon } = config[status];
  return (
    <span className={`pill ${pill} ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
