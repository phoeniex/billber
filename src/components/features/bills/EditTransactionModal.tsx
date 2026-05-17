import { useState, useEffect, FormEvent } from 'react';
import { Bill } from '@/types';
import { X, Save, Edit2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';

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

    if (!isOpen || !transaction) return null;

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
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                    <Save className="w-6 h-6 text-primary" />
                    Edit Transaction
                </h3>

                <div className="mb-4 p-3 bg-base-200 rounded-lg flex items-center justify-between">
                    <div>
                        <div className="text-sm opacity-60">Bill Name</div>
                        <div className="font-bold text-lg">{transaction.name}</div>
                    </div>
                    {onEditBill && (
                        <button
                            type="button"
                            onClick={() => {
                                onEditBill(transaction);
                                onClose();
                            }}
                            className="btn btn-sm btn-ghost gap-2"
                            title="Edit the parent bill"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Bill
                        </button>
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

                    <div className="form-control">
                        <label className="label" htmlFor="paid-amount">
                            <span className="label-text font-semibold">
                                {transaction.status === 'paid' ? 'Paid Amount' : 'Amount'} ({currency})
                            </span>
                        </label>
                        <input
                            id="paid-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            className="input input-bordered input-primary w-full text-lg"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label" htmlFor="note">
                            <span className="label-text font-semibold">Note (Optional)</span>
                        </label>
                        <textarea
                            id="note"
                            className="textarea textarea-bordered textarea-primary w-full"
                            rows={3}
                            placeholder="Add a note about this transaction..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="modal-action border-t border-base-300 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary px-8">
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
