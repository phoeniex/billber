import { DashboardStats as Stats } from '@/types';
import { Receipt, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface DashboardStatsProps {
    stats: Stats;
    currency: string;
    locale: string;
}

export const DashboardStats = ({ stats, currency, locale }: DashboardStatsProps) => {
    const format = (value: number) => {
        try {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } catch (e) {
            return value.toFixed(2);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="stat bg-base-100 shadow-xl rounded-2xl stat-card-hover">
                <div className="stat-figure text-primary">
                    <Receipt className="w-8 h-8" />
                </div>
                <div className="stat-title text-base-content/60">Total Bills</div>
                <div className="stat-value text-primary">{currency}{format(stats.total)}</div>
                <div className="stat-desc">{stats.count} bill{stats.count !== 1 ? 's' : ''} this month</div>
            </div>

            <div className="stat bg-base-100 shadow-xl rounded-2xl stat-card-hover border-t-4 border-success">
                <div className="stat-figure text-success">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="stat-title text-base-content/60">Paid</div>
                <div className="stat-value text-success">{currency}{format(stats.paid)}</div>
                <div className="stat-desc">{stats.paidCount} bill{stats.paidCount !== 1 ? 's' : ''} completed</div>
            </div>

            <div className="stat bg-base-100 shadow-xl rounded-2xl stat-card-hover border-t-4 border-warning">
                <div className="stat-figure text-warning">
                    <Clock className="w-8 h-8" />
                </div>
                <div className="stat-title text-base-content/60">Pending</div>
                <div className="stat-value text-warning">{currency}{format(stats.pending)}</div>
                <div className="stat-desc">{stats.pendingCount} bill{stats.pendingCount !== 1 ? 's' : ''} due</div>
            </div>

            <div className="stat bg-base-100 shadow-xl rounded-2xl stat-card-hover border-t-4 border-error">
                <div className="stat-figure text-error">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div className="stat-title text-base-content/60">Overdue</div>
                <div className="stat-value text-error">{currency}{format(stats.overdue)}</div>
                <div className="stat-desc">{stats.overdueCount} bill{stats.overdueCount !== 1 ? 's' : ''} overdue</div>
            </div>
        </div>
    );
};
