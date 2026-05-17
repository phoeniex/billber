import { Bill } from '@/types';
import { X, History, CheckCircle, FastForward, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/billUtils';

interface BillHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBill: Bill | null;
    allBills: Bill[];
    currency: string;
    locale: string;
    onEdit: (bill: Bill) => void;
    onDelete: (id: string) => void;
}

export const BillHistoryModal = ({ isOpen, onClose, currentBill, allBills, currency, locale, onEdit, onDelete }: BillHistoryModalProps) => {
    if (!isOpen || !currentBill) return null;

    // Find history: same groupId, or same name if groupId missing (legacy)
    // Filter for paid/skipped
    const history = allBills.filter(b => {
        const isMatch = currentBill.groupId
            ? b.groupId === currentBill.groupId
            : b.name === currentBill.name; // Fallback for legacy

        // Exclude the current viewing bill itself if it's in the list (though mostly we filter for paid/skipped)
        return isMatch && (b.status === 'paid' || b.status === 'skipped');
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()); // Newest first

    const formatAmount = (amount: number) => {
        try {
            return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        } catch { return amount.toFixed(2); }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Payment History
                </h3>
                <p className="opacity-70 mb-4">History for <span className="font-bold">{currentBill.name}</span></p>

                {history.length === 0 ? (
                    <div className="py-8 text-center opacity-50">
                        <p>No payment history found.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {history.map(record => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    {record.status === 'paid' ? (
                                        <CheckCircle className="w-5 h-5 text-success" />
                                    ) : (
                                        <FastForward className="w-5 h-5 text-base-content/50" />
                                    )}
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {formatDate(record.dueDate)}
                                            {record.status === 'skipped' && <span className="badge badge-xs badge-ghost">Skipped</span>}
                                        </div>
                                        <div className="text-xs opacity-60">
                                            {record.paidDate ? `Paid on ${formatDate(record.paidDate)}` : 'Skipped'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">
                                        {record.status === 'paid' ? (
                                            <span className="text-success">{currency}{formatAmount(record.paidAmount || record.amount || 0)}</span>
                                        ) : (
                                            <span className="opacity-50 line-through">{currency}{formatAmount(record.amount || 0)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={() => onEdit(record)} className="btn btn-xs btn-ghost btn-circle text-primary" title="Edit">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this transaction record?')) {
                                                    onDelete(record.id);
                                                }
                                            }}
                                            className="btn btn-xs btn-ghost btn-circle text-error"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
