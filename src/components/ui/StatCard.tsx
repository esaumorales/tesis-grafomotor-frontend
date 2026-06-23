import { Icon } from '@iconify/react';
import clsx from 'clsx';

interface StatCardProps {
  value: string | number;
  label: string;
  trendText?: string;
  trendUp?: boolean;
  icon: string;
}

export default function StatCard({ value, label, trendText, trendUp, icon }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        <Icon icon={icon} className="text-3xl" />
      </div>
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-extrabold text-text-main tracking-tight">{value}</h3>
        {trendText && (
          <p 
            className={clsx(
              "text-xs mt-1.5 font-medium flex items-center gap-1",
              trendUp ? "text-success" : "text-danger"
            )}
          >
            {trendText}
          </p>
        )}
      </div>
    </div>
  );
}
