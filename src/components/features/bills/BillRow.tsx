import { Bill } from '@/types';
import { BillIcon } from '@/components/ui/BillIcon';
import { getDaysUntilDue, formatDate } from '@/utils/billUtils';
import { MoreVertical, CheckCircle, FastForward, Trash2, History, Edit2 } from 'lucide-react';

interface BillRowProps {
    bill: Bill;
    currency: string;
    locale: string;
    onMarkAsPaid: (id: string) => void;
    onSkip: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: (bill: Bill) => void;
    onEdit: (bill: Bill) => void;
}

export const BillRow = ({
    bill, currency, locale,
    onMarkAsPaid, onSkip, onDelete, onViewHistory, onEdit
}: BillRowProps) => {
    const formattedAmount = bill.amount !== undefined ? new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(bill.amount) : '--';

    const isOverdue = bill.status === 'overdue';
    const dueStatus = getDaysUntilDue(bill.dueDate);



    return (
        <div className="group flex items-center gap-4 p-4 bg-base-100 hover:bg-base-200/50 rounded-2xl transition-all duration-200 cursor-default border border-transparent hover:border-base-200 shadow-sm hover:shadow-md mb-3">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-primary bg-base-200/80 group-hover:bg-white transition-colors shadow-sm`}>
                <BillIcon icon={bill.icon || 'FileText'} className="w-6 h-6" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0" onClick={() => onViewHistory(bill)}>
                <div className="flex items-center mb-1">
                    <h4 className="font-bold text-base truncate cursor-pointer hover:text-primary transition-colors">
                        {bill.name}
                        <span className="text-sm font-normal opacity-60 ml-2 capitalize">
                            • {bill.category}
                        </span>
                    </h4>
                </div>
                <div className={`text-sm font-medium ${isOverdue ? 'text-error' : 'opacity-50'}`}>
                    {dueStatus} <span className="opacity-40 font-normal mx-1">•</span> {formatDate(bill.dueDate)}
                </div>
            </div>

            {/* Amount & Actions */}
            <div className="text-right flex items-center gap-4">
                <div className="text-right mr-2">
                    <div className="font-extrabold text-lg text-base-content/90">
                        {currency}{formattedAmount}
                    </div>
                    {bill.frequency && bill.frequency !== 'one-time' && (
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {bill.frequency}
                        </div>
                    )}
                </div>

                {/* Action Buttons (Visible on Hover or Touch) */}
                <div className="flex items-center gap-2">
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsPaid(bill.id);
                            }}
                            className="btn btn-circle btn-sm btn-success text-white shadow-sm hover:scale-110 transition-transform"
                            title="Mark as Paid"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}

                    <div className="dropdown dropdown-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                            <MoreVertical className="w-4 h-4 opacity-50" />
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-200">
                            {(bill.status === 'pending' || bill.status === 'overdue') && (
                                <>

                                    <li><a onClick={() => onSkip(bill.id)}><FastForward className="w-4 h-4" /> Skip</a></li>
                                </>
                            )}
                            <li><a onClick={() => onViewHistory(bill)}><History className="w-4 h-4" /> History</a></li>
                            <li><a onClick={() => onEdit(bill)}><Edit2 className="w-4 h-4" /> Edit</a></li>
                            <div className="divider my-1"></div>
                            <li><a onClick={() => onDelete(bill.id)} className="text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /> Delete</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
