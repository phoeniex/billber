import { useState, useEffect, FormEvent } from 'react';
import { Bill } from '@/types';
import { Save, Edit2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Bill | null;
    currency: string;
    onUpdateTransaction: (id: string, updatedTransaction: Bill) => void;
    onShowNotification: (title: string, message: string, type: 'success' | 'error') => void;
    onEditBill?: (bill: Bill) => void;
}

export const EditTransactionModal = ({
    isOpen,
    onClose,
    transaction,
    currency,
    onUpdateTransaction,
    onShowNotification,
    onEditBill
}: EditTransactionModalProps) => {
    const [dueDate, setDueDate] = useState('');
    const [paidDate, setPaidDate] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen && transaction) {
            setDueDate(transaction.dueDate);
            setPaidDate(transaction.paidDate || '');
            setPaidAmount(transaction.paidAmount?.toString() || transaction.amount?.toString() || '0');
            setNote(transaction.note || '');
        }
    }, [isOpen, transaction]);

    if (!transaction) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!dueDate) {
            onShowNotification('Error', 'Due date is required.', 'error');
            return;
        }

        if (transaction.status === 'paid' && !paidDate) {
            onShowNotification('Error', 'Paid date is required for paid transactions.', 'error');
            return;
        }

        if (!paidAmount || parseFloat(paidAmount) <= 0) {
            onShowNotification('Error', 'Please enter a valid amount.', 'error');
            return;
        }

        const updatedTransaction: Bill = {
            ...transaction,
            dueDate,
            paidDate: transaction.status === 'paid' ? paidDate : undefined,
            paidAmount: parseFloat(paidAmount),
            note: note.trim() || undefined,
        };

        onUpdateTransaction(transaction.id, updatedTransaction);
        onShowNotification('Success!', 'Transaction has been updated.', 'success');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Save className="w-6 h-6 text-primary" />
                        Edit Transaction
                    </DialogTitle>
                </DialogHeader>

                <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div>
                        <div className="text-sm text-muted-foreground">Bill Name</div>
                        <div className="font-bold text-lg">{transaction.name}</div>
                    </div>
                    {onEditBill && (
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                onEditBill(transaction);
                                onClose();
                            }}
                            title="Edit the parent bill"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Bill
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <DatePicker
                        label="Due Date"
                        value={dueDate}
                        onChange={setDueDate}
                        required
                    />

                    {transaction.status === 'paid' && (
                        <DatePicker
                            label="Paid Date"
                            value={paidDate}
                            onChange={setPaidDate}
                            required
                        />
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="paid-amount">
                            {transaction.status === 'paid' ? 'Paid Amount' : 'Amount'} ({currency})
                        </Label>
                        <Input
                            id="paid-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            className="text-lg"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="note">Note (Optional)</Label>
                        <textarea
                            id="note"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                            rows={3}
                            placeholder="Add a note about this transaction..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border/30 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6 font-medium">Cancel</Button>
                        <Button type="submit" className="h-11 px-8 font-bold text-sm rounded-xl shadow-md hover:scale-105 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
