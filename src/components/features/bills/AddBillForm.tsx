import { useState, useEffect } from 'react';
import { Bill, BillCategory, BillStatus, BillFrequency, PaymentMethod, TransactionType } from '@/types';
import { BILL_ICONS, INCOME_CATEGORIES } from '@/utils/constants';
import { BillIcon } from '@/components/ui/BillIcon';
import { DatePicker } from '@/components/ui/DatePicker';
import { PlusCircle, FileText, DollarSign, ExternalLink, QrCode, Tag, Calendar, User, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AddBillFormProps {
    isOpen: boolean;
    onClose: () => void;
    currency: string;
    onAddBill: (bill: Omit<Bill, 'id'>) => void;
    onUpdateBill?: (id: string, updatedBill: Bill) => void;
    billToEdit?: Bill | null;
    initialType?: TransactionType;
    onShowNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const EXPENSE_CATEGORIES: { value: BillCategory; label: string }[] = [
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent & Housing' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'internet', label: 'Internet & Phone' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'loan', label: 'Loan & Debt' },
    { value: 'other', label: 'Other Expense' },
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
    initialType = 'expense',
    onShowNotification,
}: AddBillFormProps) => {
    const isEditMode = !!billToEdit;

    const [transactionType, setTransactionType] = useState<TransactionType>(initialType);

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
            setTransactionType(billToEdit.type || 'expense');
            setFormData({
                name: billToEdit.name || '',
                amount: billToEdit.amount !== undefined ? billToEdit.amount.toString() : '',
                dueDate: billToEdit.dueDate || '',
                category: billToEdit.category || 'utilities',
                status: billToEdit.status || 'pending',
                frequency: billToEdit.frequency || 'one-time',
                icon: billToEdit.icon || (billToEdit.type === 'income' ? 'Briefcase' : 'FileText'),
                paymentUrl: billToEdit.paymentUrl || '',
                paymentMethod: billToEdit.paymentMethod || 'manual',
            });
        } else if (isOpen) {
            const defaultType = initialType;
            setTransactionType(defaultType);
            setFormData({
                name: '',
                amount: '',
                dueDate: new Date().toISOString().split('T')[0],
                category: defaultType === 'income' ? 'salary' : 'utilities',
                status: 'pending',
                frequency: 'one-time',
                icon: defaultType === 'income' ? 'Briefcase' : 'FileText',
                paymentUrl: '',
                paymentMethod: 'manual',
            });
        }
    }, [billToEdit, isOpen, initialType]);

    const handleTypeChange = (type: TransactionType) => {
        setTransactionType(type);
        setFormData(prev => ({
            ...prev,
            category: type === 'income' ? 'salary' : 'utilities',
            icon: type === 'income' ? 'Briefcase' : 'FileText',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.dueDate) {
            onShowNotification('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        if (isEditMode && billToEdit && onUpdateBill) {
            const updatedBill: Bill = {
                ...billToEdit,
                type: transactionType,
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
            onShowNotification('Success!', `"${formData.name}" has been updated.`, 'success');
        } else {
            const groupId = Date.now().toString();
            const newBill: Omit<Bill, 'id'> = {
                groupId,
                type: transactionType,
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

            const isIncome = transactionType === 'income';
            let successMessage = isIncome
                ? `Income "${formData.name}" logged successfully.`
                : `Bill "${formData.name}" added successfully.`;
            if (formData.frequency !== 'one-time') {
                successMessage += ` Recurring (${formData.frequency}) cycle enabled.`;
            }
            onShowNotification('Success!', successMessage, 'success');
        }

        onClose();
    };

    const categoriesList = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-11/12 max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-border/30 shadow-2xl">
                {/* Fixed Sticky Header */}
                <DialogHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/20 px-6 sm:px-8 py-5 pr-16 flex flex-row items-center justify-between shrink-0 mb-0">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {isEditMode ? (
                            <><FileText className="w-7 h-7 text-primary" /> Edit {transactionType === 'income' ? 'Income' : 'Bill'}</>
                        ) : (
                            <><PlusCircle className="w-7 h-7 text-primary" /> Add {transactionType === 'income' ? 'Income' : 'Bill'}</>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {/* Form Wrapper */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Form Fields */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                        {/* Transaction Type Segmented Switcher */}
                        {!isEditMode && (
                            <div className="p-1 bg-muted rounded-2xl flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('expense')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                                        transactionType === 'expense'
                                            ? "bg-card text-foreground shadow-md font-extrabold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <ArrowDownCircle className="w-4 h-4 text-destructive" /> Bill / Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('income')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                                        transactionType === 'income'
                                            ? "bg-emerald-600 text-white shadow-md font-extrabold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <ArrowUpCircle className="w-4 h-4 text-emerald-300" /> Income Earnings
                                </button>
                            </div>
                        )}

                        {/* Section 1: Identity */}
                        <div className="bg-muted/40 border border-border/20 p-5 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Identity &amp; Amount
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="bill-name">{transactionType === 'income' ? 'Income Source Name *' : 'Bill Name *'}</Label>
                                        <Input
                                            id="bill-name"
                                            type="text"
                                            name="name"
                                            placeholder={transactionType === 'income' ? 'e.g. Monthly Salary' : 'e.g. Electric Utility'}
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
                                    label={transactionType === 'income' ? 'Received / Pay Date *' : 'Due Date *'}
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
                                <Tag className="w-4 h-4" /> Category &amp; Visual Icon
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
                                            {categoriesList.map((cat) => (
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
                                                        ? transactionType === 'income'
                                                            ? 'bg-emerald-600 text-white shadow-md scale-105'
                                                            : 'bg-primary text-primary-foreground shadow-md scale-105'
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
                                <ExternalLink className="w-4 h-4" /> Reference &amp; Links
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="payment-method">Reference Type</Label>
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
                                        <Label htmlFor="payment-url">Link / URL</Label>
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
                                            <QrCode className="w-4 h-4" /> Reference No.
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
                                            <FileText className="w-4 h-4" /> Details / Note (Optional)
                                        </Label>
                                        <Input
                                            id="payment-detail"
                                            type="text"
                                            name="paymentUrl"
                                            placeholder="e.g. Bank Transfer Ref: 123-456"
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
                        <Button
                            type="submit"
                            className={cn(
                                "h-11 px-8 font-bold text-sm rounded-xl shadow-md hover:scale-105 transition-all",
                                transactionType === 'income'
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : ""
                            )}
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {isEditMode ? (transactionType === 'income' ? 'Update Income' : 'Update Bill') : (transactionType === 'income' ? 'Save Income' : 'Save Bill')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
