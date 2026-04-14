import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export default function StatCard({ icon, label, value, subtitle, className }: StatCardProps) {
  return (
    <div className={clsx('bg-white rounded-xl border border-secondary-100 p-5', className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-secondary-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-secondary-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
