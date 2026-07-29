import { Bill } from '@/types';
import { History, CheckCircle, FastForward, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/billUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    if (!currentBill) return null;

    const history = allBills.filter(b => {
        const isMatch = currentBill.groupId
            ? b.groupId === currentBill.groupId
            : b.name === currentBill.name;
        return isMatch && (b.status === 'paid' || b.status === 'skipped');
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    const formatAmount = (amount: number) => {
        try {
            return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        } catch { return amount.toFixed(2); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-11/12 sm:max-w-xl p-6 sm:p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" />
                        Payment History
                    </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground">
                    History for <span className="font-bold text-foreground">{currentBill.name}</span>
                </p>

                {history.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No payment history found.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {history.map(record => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                                <div className="flex items-center gap-3">
                                    {record.status === 'paid' ? (
                                        <CheckCircle className="w-5 h-5 text-[color:var(--success)]" />
                                    ) : (
                                        <FastForward className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {formatDate(record.dueDate)}
                                            {record.status === 'skipped' && (
                                                <Badge variant="outline" className="text-[10px]">Skipped</Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {record.paidDate ? `Paid on ${formatDate(record.paidDate)}` : 'Skipped'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">
                                        {record.status === 'paid' ? (
                                            <span className="text-[color:var(--success)]">
                                                {currency}{formatAmount(record.paidAmount || record.amount || 0)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground line-through">
                                                {currency}{formatAmount(record.amount || 0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-1 mt-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                                            onClick={() => onEdit(record)}
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this transaction record?')) {
                                                    onDelete(record.id);
                                                }
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
