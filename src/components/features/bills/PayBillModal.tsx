import { useState, useEffect } from 'react';
import { Bill } from '@/types';
import { X, DollarSign, FileText, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import Barcode from 'react-barcode';

interface PayBillModalProps {
    bill: Bill | null;
    isOpen: boolean;
    onClose: () => void;
    currency: string;
    onConfirmPayment: (id: string, details: { date: string, amount: number, note?: string }, createNextBill: boolean) => void;
}

export const PayBillModal = ({ bill, isOpen, onClose, currency, onConfirmPayment }: PayBillModalProps) => {
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [createNextBill, setCreateNextBill] = useState(true);

    useEffect(() => {
        if (bill && isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            setAmount(bill.amount?.toString() || '');
            setNote('');
            // Default to true only if it's a recurring bill
            setCreateNextBill(true);
        }
    }, [bill, isOpen]);

    if (!isOpen || !bill) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirmPayment(bill.id, {
            date,
            amount: parseFloat(amount),
            note
        }, createNextBill);
        onClose();
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-lg">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-success" />
                    Log Payment
                </h3>

                <div className="divider mt-0"></div>

                {/* Payment Method Display */}
                {bill.paymentMethod === 'url' && bill.paymentUrl && (
                    <div className="bg-base-200 p-4 rounded-xl mb-6 flex flex-col items-center text-center animate-fade-in">
                        <p className="font-semibold mb-2">Pay via Online Portal</p>
                        <a
                            href={bill.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-outline gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open Payment Link
                        </a>
                    </div>
                )}

                {bill.paymentMethod === 'barcode' && bill.paymentUrl && (
                    <div className="bg-white text-black p-4 rounded-xl mb-6 flex flex-col items-center justify-center animate-fade-in border-2 border-base-300">
                        <p className="font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <QrCode className="w-4 h-4" />
                            Scan to Pay
                        </p>
                        <div className="overflow-hidden max-w-full">
                            <Barcode value={bill.paymentUrl} width={2} height={60} fontSize={14} />
                        </div>
                    </div>
                )}

                {bill.paymentMethod === 'manual' && bill.paymentUrl && (
                    <div className="bg-base-200 p-4 rounded-xl mb-6 flex flex-col items-center text-center animate-fade-in">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Payment Details
                        </p>
                        <p className="text-sm opacity-80 break-all">{bill.paymentUrl}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <DatePicker
                        label="Date Paid"
                        value={date}
                        onChange={(newDate) => setDate(newDate)}
                        required
                    />

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Amount Paid ({currency})
                            </span>
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            className="input input-bordered w-full"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Note (Optional)
                            </span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered h-24"
                            placeholder="e.g. Paid via Bank Transfer..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                    </div>

                    {bill.frequency !== 'one-time' && (
                        <div className="form-control bg-base-200/50 p-3 rounded-xl">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={createNextBill}
                                    onChange={(e) => setCreateNextBill(e.target.checked)}
                                />
                                <div className="flex flex-col">
                                    <span className="label-text font-semibold">Update Due Date</span>
                                    <span className="label-text-alt text-base-content/60">Uncheck to log payment but keep bill pending (e.g. partial payment)</span>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-success text-white px-8">
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
