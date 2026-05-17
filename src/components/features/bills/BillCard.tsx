import { Bill } from '@/types';
import { formatDate, getDaysUntilDue } from '@/utils/billUtils';
import { BillIcon } from '@/components/ui/BillIcon';
import { CheckCircle, Trash2, Repeat, FastForward, History } from 'lucide-react';

interface BillCardProps {
    bill: Bill;
    currency: string;
    locale: string;
    onMarkAsPaid: (id: string) => void;
    onSkip: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: (bill: Bill) => void;
}

export const BillCard = ({ bill, currency, locale, onMarkAsPaid, onSkip, onDelete, onViewHistory }: BillCardProps) => {
    const getStatusBadge = () => {
        switch (bill.status) {
            case 'paid': return 'badge-success';
            case 'pending': return 'badge-warning';
            case 'overdue': return 'badge-error';
            case 'skipped': return 'badge-ghost';
            default: return 'badge-info';
        }
    };

    const getBorderColor = () => {
        switch (bill.status) {
            case 'paid': return 'border-success';
            case 'pending': return 'border-warning';
            case 'overdue': return 'border-error';
            case 'skipped': return 'border-base-300';
            default: return 'border-info';
        }
    };

    const formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(bill.amount || 0);

    return (
        <div className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-t-4 ${getBorderColor()} animate-slide-in-up group`}>
            <div className="card-body p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl bg-base-200 text-primary group-hover:bg-primary group-hover:text-primary-content transition-colors duration-300`}>
                        <BillIcon icon={bill.icon || 'FileText'} className="w-8 h-8" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="card-title text-xl font-bold truncate" title={bill.name}>{bill.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs uppercase tracking-wider opacity-60 font-semibold">{bill.category}</span>
                                    {bill.frequency && bill.frequency !== 'one-time' && (
                                        <div className="badge badge-xs gap-1 capitalize badge-ghost">
                                            <Repeat className="w-3 h-3" />
                                            {bill.frequency}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`badge ${getStatusBadge()} font-semibold shrink-0 border-none`}>
                                {bill.status}
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <div className="text-sm opacity-60 font-medium">Amount Due</div>
                                <div
                                    className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => onViewHistory(bill)}
                                    title="View History"
                                >
                                    {currency}{formattedAmount}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm opacity-60 font-medium">Due Date</div>
                                <div className="font-semibold">{formatDate(bill.dueDate)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {bill.status !== 'paid' && bill.status !== 'skipped' && (
                    <div className="mt-2 text-sm font-medium text-right flex justify-end">
                        <span className={`${bill.status === 'overdue' ? 'text-error' : 'text-warning'}`}>
                            {getDaysUntilDue(bill.dueDate)}
                        </span>
                    </div>
                )}

                <div className="card-actions justify-end mt-4 pt-4 border-t border-base-100 gap-3">
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                        <>
                            <button
                                className="btn btn-circle btn-ghost btn-sm tooltip border-base-200"
                                data-tip="Skip Payment"
                                onClick={() => onSkip(bill.id)}
                            >
                                <FastForward className="w-4 h-4" />
                            </button>
                            <button
                                className="btn btn-success btn-sm rounded-full px-6 text-white hover:scale-105 transition-transform shadow-md border-none"
                                data-tip="Log Payment"
                                onClick={() => onMarkAsPaid(bill.id)}
                            >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Pay
                            </button>
                        </>
                    )}

                    <button
                        className="btn btn-circle btn-ghost btn-sm tooltip border-base-200"
                        data-tip="History"
                        onClick={() => onViewHistory(bill)}
                    >
                        <History className="w-4 h-4" />
                    </button>

                    <button
                        className="btn btn-circle btn-ghost btn-sm text-error/70 hover:text-error hover:bg-error/10 tooltip"
                        data-tip="Delete Bill"
                        onClick={() => onDelete(bill.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
