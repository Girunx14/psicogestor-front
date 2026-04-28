import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  variant?: 'default' | 'editorial';
}

export default function Card({ children, className, padding = true, variant = 'default' }: CardProps) {
  return (
    <div
      className={clsx(
        variant === 'editorial' ? 'card-editorial' : 'bg-white rounded-xl border border-secondary-100',
        padding && (variant === 'editorial' ? 'card-editorial-body' : 'p-6'),
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  className?: string;
}

export function CardEditorialHeader({ icon, title, className }: CardHeaderProps) {
  return (
    <div className={clsx('card-editorial-header', className)}>
      {icon && <div className="card-editorial-icon">{icon}</div>}
      <h3 className="card-editorial-title">{title}</h3>
    </div>
  );
}