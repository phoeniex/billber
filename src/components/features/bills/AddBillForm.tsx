import { useState, useEffect } from 'react';
import { Bill, BillCategory, BillStatus, BillFrequency, PaymentMethod } from '@/types';
import { BILL_ICONS } from '@/utils/constants';
import { BillIcon } from '@/components/ui/BillIcon';
import { DatePicker } from '@/components/ui/DatePicker';
import { PlusCircle, FileText, DollarSign, ExternalLink, QrCode, Tag, Calendar, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddBillFormProps {
    isOpen: boolean;
    onClose: () => void;
    currency: string;
    onAddBill: (bill: Omit<Bill, 'id'>) => void;
    onUpdateBill?: (id: string, updatedBill: Bill) => void;
    billToEdit?: Bill | null;
    onShowNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const CATEGORIES: { value: BillCategory; label: string }[] = [
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent & Housing' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'internet', label: 'Internet & Phone' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'loan', label: 'Loan & Debt' },
    { value: 'other', label: 'Other' },
];

const FREQUENCIES: { value: BillFrequency; label: string }[] = [
    { value: 'one-time', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: any }[] = [
    { value: 'manual', label: 'Manual / Note', icon: FileText },
    { value: 'url', label: 'Website Link', icon: ExternalLink },
    { value: 'barcode', label: 'Barcode / QR Ref', icon: QrCode },
];

export const AddBillForm = ({
    isOpen,
    onClose,
    currency,
    onAddBill,
    onUpdateBill,
    billToEdit,
    onShowNotification,
}: AddBillFormProps) => {
    const isEditMode = !!billToEdit;

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities' as BillCategory,
        status: 'pending' as BillStatus,
        frequency: 'one-time' as BillFrequency,
        icon: 'FileText',
        paymentUrl: '',
        paymentMethod: 'manual' as PaymentMethod,
    });

    useEffect(() => {
        if (billToEdit && isOpen) {
            setFormData({
                name: billToEdit.name || '',
                amount: billToEdit.amount !== undefined ? billToEdit.amount.toString() : '',
                dueDate: billToEdit.dueDate || '',
                category: billToEdit.category || 'utilities',
                status: billToEdit.status || 'pending',
                frequency: billToEdit.frequency || 'one-time',
                icon: billToEdit.icon || 'FileText',
                paymentUrl: billToEdit.paymentUrl || '',
                paymentMethod: billToEdit.paymentMethod || 'manual',
            });
        } else if (!isOpen) {
            setFormData({
                name: '',
                amount: '',
                dueDate: '',
                category: 'utilities',
                status: 'pending',
                frequency: 'one-time',
                icon: 'FileText',
                paymentUrl: '',
                paymentMethod: 'manual',
            });
        }
    }, [billToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.dueDate) {
            onShowNotification('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        if (isEditMode && billToEdit && onUpdateBill) {
            const updatedBill: Bill = {
                ...billToEdit,
                name: formData.name,
                amount: formData.amount ? parseFloat(formData.amount) : undefined,
                dueDate: formData.dueDate,
                category: formData.category,
                status: formData.status,
                frequency: formData.frequency,
                icon: formData.icon,
                paymentUrl: formData.paymentUrl,
                paymentMethod: formData.paymentMethod,
            };
            onUpdateBill(billToEdit.id, updatedBill);
            onShowNotification('Success!', `Bill "${formData.name}" has been updated.`, 'success');
        } else {
            const groupId = Date.now().toString();
            const newBill: Omit<Bill, 'id'> = {
                groupId,
                name: formData.name,
                amount: formData.amount ? parseFloat(formData.amount) : undefined,
                dueDate: formData.dueDate,
                category: formData.category,
                status: formData.status,
                frequency: formData.frequency,
                icon: formData.icon,
                paymentUrl: formData.paymentUrl,
                paymentMethod: formData.paymentMethod,
                createdAt: new Date().toISOString(),
            };

            onAddBill(newBill);

            let successMessage = `Bill "${formData.name}" has been added.`;
            if (formData.frequency !== 'one-time') {
                successMessage += ` Recurring (${formData.frequency}) cycle enabled.`;
            }
            onShowNotification('Success!', successMessage, 'success');
        }

        setFormData({
            name: '',
            amount: '',
            dueDate: '',
            category: 'utilities',
            status: 'pending',
            frequency: 'one-time',
            icon: 'FileText',
            paymentUrl: '',
            paymentMethod: 'manual',
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-11/12 max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-border/30 shadow-2xl">
                {/* Fixed Sticky Header */}
                <DialogHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/20 px-6 sm:px-8 py-5 flex flex-row items-center justify-between shrink-0 mb-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {isEditMode ? (
                            <><FileText className="w-7 h-7 text-primary" /> Edit Bill</>
                        ) : (
                            <><PlusCircle className="w-7 h-7 text-primary" /> Add New Bill</>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* Form Wrapper */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Form Fields */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                        {/* Section 1: Identity */}
                        <div className="bg-muted/40 border border-border/20 p-5 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Identity &amp; Details
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="bill-name">Bill Name *</Label>
                                        <Input
                                            id="bill-name"
                                            type="text"
                                            name="name"
                                            placeholder="e.g. Electric Utility"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="bill-amount">Amount ({currency})</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="bill-amount"
                                                type="number"
                                                name="amount"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="pl-9"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Dates & Recurring */}
                        <div className="bg-muted/40 border border-border/20 p-5 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Schedule &amp; Frequency
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DatePicker
                                    label="Due Date *"
                                    value={formData.dueDate}
                                    onChange={(newDate) => setFormData({ ...formData, dueDate: newDate })}
                                    required
                                />

                                <div className="space-y-1.5">
                                    <Label htmlFor="bill-frequency">Frequency</Label>
                                    <Select
                                        value={formData.frequency}
                                        onValueChange={(val) => setFormData({ ...formData, frequency: val as BillFrequency })}
                                    >
                                        <SelectTrigger id="bill-frequency" className="h-11 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FREQUENCIES.map((freq) => (
                                                <SelectItem key={freq.value} value={freq.value}>
                                                    {freq.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Category & Icon */}
                        <div className="bg-muted/40 border border-border/20 p-5 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Categorization &amp; Icon
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="bill-category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val as BillCategory })}
                                    >
                                        <SelectTrigger id="bill-category" className="h-11 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Select Icon</Label>
                                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-36 overflow-y-auto p-2 border border-input rounded-xl bg-background">
                                        {BILL_ICONS.map((iconObj) => (
                                            <button
                                                key={iconObj.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: iconObj.id })}
                                                className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                                                    formData.icon === iconObj.id
                                                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                }`}
                                                title={iconObj.label}
                                            >
                                                <BillIcon icon={iconObj.id} className="w-5 h-5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Payment Method */}
                        <div className="bg-muted/40 border border-border/20 p-5 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" /> Payment Details
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="payment-method">Payment Method</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PAYMENT_METHODS.map((method) => {
                                            const IconComp = method.icon;
                                            return (
                                                <button
                                                    key={method.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                                                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-medium ${
                                                        formData.paymentMethod === method.value
                                                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                                                            : 'border-input hover:bg-muted/50 text-muted-foreground'
                                                    }`}
                                                >
                                                    <IconComp className="w-4 h-4" />
                                                    {method.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {formData.paymentMethod === 'url' && (
                                    <div className="space-y-1.5 animate-fade-in">
                                        <Label htmlFor="payment-url">Payment Link / URL</Label>
                                        <Input
                                            id="payment-url"
                                            type="url"
                                            name="paymentUrl"
                                            placeholder="https://..."
                                            value={formData.paymentUrl}
                                            onChange={(e) => setFormData({ ...formData, paymentUrl: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                {formData.paymentMethod === 'barcode' && (
                                    <div className="space-y-1.5 animate-fade-in">
                                        <Label htmlFor="payment-ref" className="flex items-center gap-2">
                                            <QrCode className="w-4 h-4" /> Barcode / Reference No.
                                        </Label>
                                        <Input
                                            id="payment-ref"
                                            type="text"
                                            name="paymentUrl"
                                            placeholder="e.g. REF-12345678"
                                            className="font-mono"
                                            value={formData.paymentUrl}
                                            onChange={(e) => setFormData({ ...formData, paymentUrl: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                {formData.paymentMethod === 'manual' && (
                                    <div className="space-y-1.5 animate-fade-in">
                                        <Label htmlFor="payment-detail" className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Payment Details (Optional)
                                        </Label>
                                        <Input
                                            id="payment-detail"
                                            type="text"
                                            name="paymentUrl"
                                            placeholder="e.g. Bank Account: 123-456..."
                                            value={formData.paymentUrl}
                                            onChange={(e) => setFormData({ ...formData, paymentUrl: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Sticky Footer for Action Buttons */}
                    <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-md border-t border-border/20 px-6 sm:px-8 py-4 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6 font-medium">
                            Cancel
                        </Button>
                        <Button type="submit" className="h-11 px-8 font-bold text-sm rounded-xl shadow-md hover:scale-105 transition-all">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {isEditMode ? 'Update Bill' : 'Save Bill'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
