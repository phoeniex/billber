import { useState, FormEvent, useEffect } from 'react';
import { BillFormData, Bill, BillCategory, BillFrequency, PaymentMethod } from '@/types';
import { BILL_ICONS } from '@/utils/constants';
import { BillIcon } from '@/components/ui/BillIcon';
import { DatePicker } from '@/components/ui/DatePicker';
import { PlusCircle, Repeat, X, Calendar, DollarSign, User, CreditCard, QrCode, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface AddBillFormProps {
    isOpen: boolean;
    onClose: () => void;
    currency: string;
    onAddBill: (bill: Omit<Bill, 'id'>) => void;
    onUpdateBill?: (id: string, bill: Bill) => void;
    billToEdit?: Bill | null;
    onShowNotification: (title: string, message: string, type: 'success' | 'error') => void;
}

const ICONS_PER_PAGE = 18;

export const AddBillForm = ({ isOpen, onClose, currency, onAddBill, onUpdateBill, billToEdit, onShowNotification }: AddBillFormProps) => {
    const isEditMode = !!billToEdit;

    const [formData, setFormData] = useState<BillFormData>({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities',
        status: 'pending',
        frequency: 'monthly',
        icon: 'FileText',
        paymentUrl: '',
        paymentMethod: 'manual',
    });

    const [iconPage, setIconPage] = useState(0);

    // Reset or Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (billToEdit) {
                setFormData({
                    name: billToEdit.name,
                    amount: billToEdit.amount?.toString() || '',
                    dueDate: billToEdit.dueDate,
                    category: billToEdit.category,
                    status: billToEdit.status,
                    frequency: billToEdit.frequency,
                    icon: billToEdit.icon || 'FileText',
                    paymentUrl: billToEdit.paymentUrl || '',
                    paymentMethod: billToEdit.paymentMethod || 'manual',
                });
            } else {
                setFormData({
                    name: '',
                    amount: '',
                    dueDate: new Date().toISOString().split('T')[0],
                    category: 'utilities',
                    status: 'pending',
                    frequency: 'monthly',
                    icon: 'FileText',
                    paymentUrl: '',
                    paymentMethod: 'manual',
                });
            }
            setIconPage(0);
        }
    }, [isOpen, billToEdit]);

    if (!isOpen) return null;

    const totalPages = Math.ceil(BILL_ICONS.length / ICONS_PER_PAGE);
    const visibleIcons = BILL_ICONS.slice(iconPage * ICONS_PER_PAGE, (iconPage + 1) * ICONS_PER_PAGE);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.dueDate) {
            onShowNotification('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        if (isEditMode && billToEdit && onUpdateBill) {
            // Update existing bill
            const updatedBill: Bill = {
                ...billToEdit,
                name: formData.name,
                amount: formData.amount ? parseFloat(formData.amount) : undefined,
                dueDate: formData.dueDate,
                category: formData.category,
                // Do not blindly overwrite status if we are just editing details, 
                // UNLESS user wanted to reset it (maybe add a status picker later? for now keep existing status or use formData if we expose it)
                // For now, let's trust formData which defaults to 'pending' for new, but we set it from billToEdit above.
                status: formData.status,
                frequency: formData.frequency,
                icon: formData.icon,
                paymentUrl: formData.paymentUrl,
                paymentMethod: formData.paymentMethod,
            };

            onUpdateBill(billToEdit.id, updatedBill);
            onShowNotification('Success!', `Bill "${formData.name}" has been updated.`, 'success');
        } else {
            // Add new bill
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
                successMessage += ` It will repeat ${formData.frequency}.`;
            }
            onShowNotification('Success!', successMessage, 'success');
        }

        // Reset form
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
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
                    {isEditMode ? (
                        <>
                            <FileText className="w-8 h-8 text-primary" />
                            Edit Bill
                        </>
                    ) : (
                        <>
                            <PlusCircle className="w-8 h-8 text-primary" />
                            Add New Bill
                        </>
                    )}
                </h3>

                <div className="divider mt-0"></div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Section 1: Identity (Name, Category, Icon) */}
                    <div className="bg-base-200/50 p-4 rounded-xl">
                        <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Identity
                        </h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label" htmlFor="bill-name">
                                        <span className="label-text font-semibold">Bill Name</span>
                                    </label>
                                    <input
                                        id="bill-name"
                                        type="text"
                                        name="name"
                                        placeholder="e.g., Electric Bill"
                                        className="input input-bordered input-primary w-full"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label" htmlFor="bill-category">
                                        <span className="label-text font-semibold">Category</span>
                                    </label>
                                    <select
                                        id="bill-category"
                                        name="category"
                                        className="select select-bordered select-primary w-full"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as BillCategory })}
                                    >
                                        <option value="utilities">Utilities</option>
                                        <option value="rent">Rent/Mortgage</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="internet">Internet/Phone</option>
                                        <option value="credit-card">Credit Card</option>
                                        <option value="loan">Loan</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Select Icon</span>
                                </label>

                                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                                    {visibleIcons.map((icon) => (
                                        <button
                                            key={icon.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: icon.id })}
                                            className={`btn btn-square btn-sm ${formData.icon === icon.id ? 'btn-primary' : 'btn-ghost'} tool-tip`}
                                            title={icon.label}
                                        >
                                            <BillIcon icon={icon.id} className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-4">
                                        <div className="join">
                                            <button
                                                type="button"
                                                className="join-item btn btn-sm disabled:bg-transparent disabled:border-transparent disabled:text-base-content/20"
                                                disabled={iconPage === 0}
                                                onClick={() => setIconPage(p => p - 1)}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            {Array.from({ length: totalPages }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className={`join-item btn btn-sm ${iconPage === i ? 'btn-active' : ''}`}
                                                    onClick={() => setIconPage(i)}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                className="join-item btn btn-sm disabled:bg-transparent disabled:border-transparent disabled:text-base-content/20"
                                                disabled={iconPage === totalPages - 1}
                                                onClick={() => setIconPage(p => p + 1)}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Schedule */}
                    <div className="bg-base-200/50 p-4 rounded-xl">
                        <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Schedule
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DatePicker
                                label="Next Due Date"
                                value={formData.dueDate}
                                onChange={(newDate) => setFormData({ ...formData, dueDate: newDate })}
                                required
                            />

                            <div className="form-control">
                                <label className="label" htmlFor="bill-frequency">
                                    <span className="label-text font-semibold flex items-center gap-2">
                                        <Repeat className="w-4 h-4" />
                                        Repeat Interval
                                    </span>
                                </label>
                                <select
                                    id="bill-frequency"
                                    name="frequency"
                                    className="select select-bordered select-primary w-full"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as BillFrequency })}
                                >
                                    <option value="one-time">Never (One-time)</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Amount */}
                    <div className="bg-base-200/50 p-4 rounded-xl">
                        <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Amount
                        </h4>
                        <div className="form-control">
                            <label className="label" htmlFor="bill-amount">
                                <span className="label-text font-semibold">Amount Due ({currency})</span>
                            </label>
                            <input
                                id="bill-amount"
                                type="number"
                                name="amount"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="input input-bordered input-primary w-full text-lg"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Section 4: Payment Method */}
                    <div className="bg-base-200/50 p-4 rounded-xl">
                        <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Payment
                        </h4>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label" htmlFor="payment-method">
                                    <span className="label-text font-semibold">Payment Method</span>
                                </label>
                                <select
                                    id="payment-method"
                                    name="paymentMethod"
                                    className="select select-bordered select-primary w-full"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                                >
                                    <option value="url">Online Link / URL</option>
                                    <option value="barcode">Barcode / Reference</option>
                                    <option value="manual">Manual Pay (Cash/Card)</option>
                                </select>
                            </div>

                            {formData.paymentMethod === 'url' && (
                                <div className="form-control animate-fade-in">
                                    <label className="label" htmlFor="payment-url">
                                        <span className="label-text font-semibold">Payment Link / URL</span>
                                    </label>
                                    <input
                                        id="payment-url"
                                        type="url"
                                        name="paymentUrl"
                                        placeholder="https://..."
                                        className="input input-bordered input-primary w-full"
                                        value={formData.paymentUrl}
                                        onChange={(e) => setFormData({ ...formData, paymentUrl: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            {formData.paymentMethod === 'barcode' && (
                                <div className="form-control animate-fade-in">
                                    <label className="label" htmlFor="payment-ref">
                                        <span className="label-text font-semibold flex items-center gap-2">
                                            <QrCode className="w-4 h-4" />
                                            Barcode / Reference No.
                                        </span>
                                    </label>
                                    <input
                                        id="payment-ref"
                                        type="text"
                                        name="paymentUrl"
                                        placeholder="e.g. REF-12345678"
                                        className="input input-bordered input-primary w-full font-mono"
                                        value={formData.paymentUrl}
                                        onChange={(e) => setFormData({ ...formData, paymentUrl: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            {formData.paymentMethod === 'manual' && (
                                <div className="form-control animate-fade-in">
                                    <label className="label" htmlFor="payment-detail">
                                        <span className="label-text font-semibold flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Payment Details (Optional)
                                        </span>
                                    </label>
                                    <input
                                        id="payment-detail"
                                        type="text"
                                        name="paymentUrl"
                                        placeholder="e.g. Bank Account: 123-456..."
                                        className="input input-bordered input-primary w-full"
                                        value={formData.paymentUrl}
                                        onChange={(e) => setFormData({ ...formData, paymentUrl: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-action border-t border-base-300 pt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary px-8">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            {isEditMode ? 'Update Bill' : 'Save Bill'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
