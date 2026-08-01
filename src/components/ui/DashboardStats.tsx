import { DashboardStats as Stats } from '@/types';
import { TrendingUp, Receipt, Wallet, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
    stats: Stats;
    currency: string;
    locale: string;
    className?: string;
}

interface StatCardProps {
    title: string;
    value: string;
    desc: string;
    icon: React.ReactNode;
    valueColor?: string;
}

const StatCard = ({ title, value, desc, icon, valueColor }: StatCardProps) => (
    <div className="bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl p-4 flex flex-col gap-1.5 border border-border/20">
        <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">{title}</span>
            <div className={cn('p-1.5 rounded-xl bg-muted/60 shrink-0', valueColor)}>{icon}</div>
        </div>
        <div className={cn('text-xl font-extrabold tracking-tight truncate', valueColor)}>{value}</div>
        <div className="text-[11px] text-muted-foreground font-medium truncate">{desc}</div>
    </div>
);

export const DashboardStats = ({ stats, currency, locale, className }: DashboardStatsProps) => {
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

    const netBalance = stats.netBalance ?? ((stats.totalIncome || 0) - (stats.totalExpenses || stats.total || 0));
    const isNetPositive = netBalance >= 0;

    return (
        <div className={cn("grid grid-cols-2 gap-3", className)}>
            <StatCard
                title="Total Income"
                value={`+${currency}${format(stats.totalIncome || 0)}`}
                desc="Incoming earnings"
                icon={<TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                valueColor="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
                title="Total Bills"
                value={`${currency}${format(stats.totalExpenses || stats.total || 0)}`}
                desc={`${stats.count} bill${stats.count !== 1 ? 's' : ''}`}
                icon={<Receipt className="w-4 h-4 text-primary" />}
                valueColor="text-primary"
            />
            <StatCard
                title="Net Balance"
                value={`${isNetPositive ? '+' : ''}${currency}${format(netBalance)}`}
                desc={isNetPositive ? 'Positive cash flow' : 'Negative cash flow'}
                icon={<Wallet className={cn("w-4 h-4", isNetPositive ? "text-emerald-500" : "text-destructive")} />}
                valueColor={isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
            />
            <StatCard
                title="Pending / Due"
                value={`${currency}${format(stats.pending + stats.overdue)}`}
                desc={`${stats.pendingCount} due · ${stats.overdueCount} overdue`}
                icon={stats.overdueCount > 0 ? <AlertCircle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-[color:var(--warning)]" />}
                valueColor={stats.overdueCount > 0 ? "text-destructive" : "text-[color:var(--warning)]"}
            />
        </div>
    );
};
