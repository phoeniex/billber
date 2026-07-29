import { DashboardStats as Stats } from '@/types';
import { Receipt, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
    stats: Stats;
    currency: string;
    locale: string;
}

interface StatCardProps {
    title: string;
    value: string;
    desc: string;
    icon: React.ReactNode;
    accentColor?: string;
    valueColor?: string;
}

const StatCard = ({ title, value, desc, icon, accentColor, valueColor }: StatCardProps) => (
    <div className={cn(
        'bg-card shadow-xl rounded-2xl p-6 stat-card-hover flex flex-col gap-3 border-t-4',
        accentColor || 'border-t-primary'
    )}>
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className={cn('text-primary', valueColor)}>{icon}</span>
        </div>
        <div className={cn('text-3xl font-bold text-primary', valueColor)}>{value}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
);

export const DashboardStats = ({ stats, currency, locale }: DashboardStatsProps) => {
    const format = (value: number) => {
        try {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } catch {
            return value.toFixed(2);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
                title="Total Bills"
                value={`${currency}${format(stats.total)}`}
                desc={`${stats.count} bill${stats.count !== 1 ? 's' : ''} this month`}
                icon={<Receipt className="w-8 h-8" />}
                accentColor="border-t-primary"
                valueColor="text-primary"
            />
            <StatCard
                title="Paid"
                value={`${currency}${format(stats.paid)}`}
                desc={`${stats.paidCount} bill${stats.paidCount !== 1 ? 's' : ''} completed`}
                icon={<CheckCircle2 className="w-8 h-8" />}
                accentColor="border-t-[color:var(--success)]"
                valueColor="text-[color:var(--success)]"
            />
            <StatCard
                title="Pending"
                value={`${currency}${format(stats.pending)}`}
                desc={`${stats.pendingCount} bill${stats.pendingCount !== 1 ? 's' : ''} due`}
                icon={<Clock className="w-8 h-8" />}
                accentColor="border-t-[color:var(--warning)]"
                valueColor="text-[color:var(--warning)]"
            />
            <StatCard
                title="Overdue"
                value={`${currency}${format(stats.overdue)}`}
                desc={`${stats.overdueCount} bill${stats.overdueCount !== 1 ? 's' : ''} overdue`}
                icon={<AlertCircle className="w-8 h-8" />}
                accentColor="border-t-destructive"
                valueColor="text-destructive"
            />
        </div>
    );
};
