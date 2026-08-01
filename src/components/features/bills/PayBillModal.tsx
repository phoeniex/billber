import { useState, useEffect } from 'react';
import { Bill } from '@/types';
import { DollarSign, FileText, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import Barcode from 'react-barcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

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
            setCreateNextBill(true);
        }
    }, [bill, isOpen]);

    if (!bill) return null;

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-11/12 sm:max-w-xl p-6 sm:p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <CheckCircle className="w-7 h-7 text-[color:var(--success)]" />
                        Log Payment
                    </DialogTitle>
                </DialogHeader>

                <Separator className="my-1" />

                {/* Payment Method Display */}
                {bill.paymentMethod === 'url' && bill.paymentUrl && (
                    <div className="bg-muted p-4 rounded-xl flex flex-col items-center text-center animate-fade-in">
                        <p className="font-semibold mb-2">Pay via Online Portal</p>
                        <Button variant="outline" onClick={() => window.open(bill.paymentUrl, '_blank', 'noopener,noreferrer')}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Payment Link
                        </Button>
                    </div>
                )}

                {bill.paymentMethod === 'barcode' && bill.paymentUrl && (
                    <div className="bg-white text-black p-4 rounded-xl flex flex-col items-center justify-center animate-fade-in border-2 border-border">
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
                    <div className="bg-muted p-4 rounded-xl flex flex-col items-center text-center animate-fade-in">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Payment Details
                        </p>
                        <p className="text-sm text-muted-foreground break-all">{bill.paymentUrl}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <DatePicker
                        label="Date Paid"
                        value={date}
                        onChange={(newDate) => setDate(newDate)}
                        required
                    />

                    <div className="space-y-1.5">
                        <Label htmlFor="pay-amount" className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Amount Paid ({currency})
                        </Label>
                        <Input
                            id="pay-amount"
                            type="number"
                            required
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pay-note" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Note (Optional)
                        </Label>
                        <textarea
                            id="pay-note"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                            placeholder="e.g. Paid via Bank Transfer..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {bill.frequency !== 'one-time' && (
                        <div className="flex items-center justify-between p-4 bg-muted/40 border border-border/20 rounded-2xl gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="create-next" className="text-sm font-semibold cursor-pointer">Update Due Date</label>
                                <span className="text-xs text-muted-foreground mt-0.5">Toggle off to log payment without scheduling next billing cycle</span>
                            </div>
                            <Switch
                                id="create-next"
                                checked={createNextBill}
                                onCheckedChange={(checked) => setCreateNextBill(!!checked)}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6 font-medium">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 px-8 font-bold text-sm rounded-xl bg-[#C8A96B] hover:bg-[#B8985B] text-white shadow-md hover:scale-105 transition-all cursor-pointer"
                        >
                            Confirm Payment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
