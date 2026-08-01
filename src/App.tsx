import { useState, useEffect } from 'react';
import { Bill, TransactionType } from '@/types';
import { Loader2, User as UserIcon } from 'lucide-react';

import { AddBillForm } from './components/features/bills/AddBillForm';
import { BillsList } from './components/features/bills/BillsList';
import { BillCalendar } from './components/features/calendar/BillCalendar';
import { DashboardStats } from './components/ui/DashboardStats';
import { UserPage } from './components/features/user/UserPage';
import { PayBillModal } from './components/features/bills/PayBillModal';
import { BillHistoryModal } from './components/features/bills/BillHistoryModal';
import { EditTransactionModal } from './components/features/bills/EditTransactionModal';
import { AuthModal } from './components/auth/AuthModal';

import { useBills, PaymentDetails } from './hooks/useBills';
import { useCurrency } from './hooks/useCurrency';
import { useNotifications } from './hooks/useNotifications';
import { useBillChecker } from './hooks/useBillChecker';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';

function App() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [showUserSheet, setShowUserSheet] = useState(false);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [addModalType, setAddModalType] = useState<TransactionType>('expense');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [billToPay, setBillToPay] = useState<Bill | null>(null);
    const [historyBill, setHistoryBill] = useState<Bill | null>(null);
    const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Bill | null>(null);

    const {
        bills,
        loading: billsLoading,
        addBill,
        updateBill,
        updateBillGroup,
        deleteBill,
        markAsPaid,
        skipBill,
        deleteBillInstance
    } = useBills();

    const { currency, locale, updateCurrency, updateLocale } = useCurrency();
    const { showNotification } = useNotifications();
    const { theme, toggleTheme } = useTheme();

    useBillChecker(bills, showNotification);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setAddModalType('expense');
                setBillToEdit(null);
                setShowAddBillModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleConfirmPayment = (id: string, details: PaymentDetails, createNextBill: boolean) => {
        markAsPaid(id, details, createNextBill);

        const paidBill = bills.find(b => b.id === id);
        const isIncome = paidBill?.type === 'income';
        let message = isIncome
            ? `Income of ${currency}${details.amount.toFixed(2)} logged for "${paidBill?.name}".`
            : `Payment of ${currency}${details.amount.toFixed(2)} logged for "${paidBill?.name}".`;
        if (paidBill?.frequency !== 'one-time' && createNextBill) {
            message += ' Next due date has been scheduled.';
        }

        showNotification(isIncome ? 'Income Logged' : 'Payment Confirmed', message, 'success');
        setBillToPay(null);
    };

    const handleSkipBill = (id: string) => {
        const skippedBill = bills.find(b => b.id === id);
        skipBill(id);

        let message = `Skipped payment for "${skippedBill?.name}".`;
        if (skippedBill?.frequency !== 'one-time') {
            message += ' Advanced to next billing cycle.';
        }

        showNotification('Bill Skipped', message, 'success');
    };

    const handleDeleteBill = (id: string) => {
        const billToDelete = bills.find(b => b.id === id);
        deleteBill(id);
        showNotification('Item Deleted', `"${billToDelete?.name}" has been deleted.`, 'success');

        if (historyBill?.id === id) setHistoryBill(null);
        if (billToEdit?.id === id) setBillToEdit(null);
        if (transactionToEdit?.id === id) setTransactionToEdit(null);
    };

    const handleDeleteTransaction = (id: string) => {
        const billToDelete = bills.find(b => b.id === id);
        deleteBillInstance(id);
        showNotification('Transaction Deleted', `Transaction for "${billToDelete?.name}" deleted.`, 'success');
    };

    const handleEditBill = (bill: Bill) => {
        setBillToEdit(bill);
        setAddModalType(bill.type || 'expense');
        setShowAddBillModal(true);
    };

    const handleUpdateBill = (id: string, updatedBill: Bill) => {
        updateBillGroup(id, updatedBill);
        setBillToEdit(null);
    };

    const handleUpdateTransaction = (id: string, updatedTransaction: Bill) => {
        updateBill(id, updatedTransaction);
        setTransactionToEdit(null);
    };

    const stats = {
        total: bills.filter(b => (b.type || 'expense') === 'expense').reduce((acc, b) => acc + (b.amount || 0), 0),
        totalIncome: bills.filter(b => b.type === 'income').reduce((acc, b) => acc + (b.amount || 0), 0),
        totalExpenses: bills.filter(b => (b.type || 'expense') === 'expense').reduce((acc, b) => acc + (b.amount || 0), 0),
        netBalance: bills.filter(b => b.type === 'income').reduce((acc, b) => acc + (b.amount || 0), 0) - bills.filter(b => (b.type || 'expense') === 'expense').reduce((acc, b) => acc + (b.amount || 0), 0),
        paid: bills.filter(b => b.status === 'paid').reduce((acc, b) => acc + (b.amount || 0), 0),
        pending: bills.filter(b => b.status === 'pending').reduce((acc, b) => acc + (b.amount || 0), 0),
        overdue: bills.filter(b => b.status === 'overdue').reduce((acc, b) => acc + (b.amount || 0), 0),
        count: bills.length,
        paidCount: bills.filter(b => b.status === 'paid').length,
        pendingCount: bills.filter(b => b.status === 'pending').length,
        overdueCount: bills.filter(b => b.status === 'overdue').length,
    };

    if (isLoading || (isAuthenticated && billsLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 transition-colors duration-300 font-sans relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Left Panel: Calendar & Summary Stats */}
            <div className="relative z-10 w-full lg:w-[400px] xl:w-[480px] p-6 lg:p-10 flex flex-col gap-8 shrink-0 bg-card/30 backdrop-blur-md border-r border-border/30">
                <div className="lg:sticky lg:top-10 flex flex-col gap-6">
                    <BillCalendar bills={bills} currency={currency} locale={locale} />

                    {/* Financial Summary Stats in Sidebar */}
                    <div className="bg-card/40 backdrop-blur-md rounded-3xl p-5 border border-border/20 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Financial Summary</h4>
                        <DashboardStats stats={stats} currency={currency} locale={locale} />
                    </div>
                </div>

                {/* User Profile Card */}
                <div
                    onClick={() => setShowUserSheet(true)}
                    className="mt-auto lg:sticky lg:bottom-10 flex items-center justify-between p-4 bg-card/50 backdrop-blur-md rounded-2xl border border-border/20 shadow-sm cursor-pointer hover:bg-card/80 transition-all duration-200"
                    title="Click to open Account & Settings"
                >
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-sm">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Guest Mode</p>
                                    <p className="text-xs text-muted-foreground">Account & Settings</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Main Panel: Bills & Income List */}
            <div className="relative z-10 flex-1 bg-background/80 backdrop-blur-md p-6 lg:p-12 lg:rounded-l-[3rem] shadow-none lg:shadow-xl min-h-screen flex flex-col border-l border-border/20">
                <div className="max-w-5xl mx-auto w-full">

                    {/* Bills & Income List */}
                    <BillsList
                        bills={bills}
                        currency={currency}
                        locale={locale}
                        onMarkAsPaid={(id) => {
                            const bill = bills.find(b => b.id === id);
                            if (bill) setBillToPay(bill);
                        }}
                        onSkip={handleSkipBill}
                        onDelete={handleDeleteBill}
                        onViewHistory={(bill) => setHistoryBill(bill)}
                        onAddBill={(type = 'expense') => {
                            setBillToEdit(null);
                            setAddModalType(type);
                            setShowAddBillModal(true);
                        }}
                        onEdit={handleEditBill}
                    />
                </div>
            </div>

            {/* Slide-Over User & Settings Sheet */}
            <UserPage
                isOpen={showUserSheet}
                onClose={() => setShowUserSheet(false)}
                currency={currency}
                locale={locale}
                theme={theme}
                onCurrencyChange={updateCurrency}
                onLocaleChange={updateLocale}
                onThemeChange={toggleTheme}
                onOpenAuthModal={() => setShowAuthModal(true)}
                totalBillsCount={bills.length}
            />

            {/* Modals */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />

            <AddBillForm
                isOpen={showAddBillModal}
                onClose={() => {
                    setShowAddBillModal(false);
                    setBillToEdit(null);
                }}
                currency={currency}
                onAddBill={addBill}
                onUpdateBill={handleUpdateBill}
                billToEdit={billToEdit}
                initialType={addModalType}
                onShowNotification={showNotification}
            />

            <PayBillModal
                bill={billToPay}
                isOpen={!!billToPay}
                onClose={() => setBillToPay(null)}
                currency={currency}
                onConfirmPayment={handleConfirmPayment}
            />

            <BillHistoryModal
                isOpen={!!historyBill}
                onClose={() => setHistoryBill(null)}
                currentBill={historyBill}
                allBills={bills}
                currency={currency}
                locale={locale}
                onEdit={(bill) => setTransactionToEdit(bill)}
                onDelete={handleDeleteTransaction}
            />

            <EditTransactionModal
                isOpen={!!transactionToEdit}
                onClose={() => setTransactionToEdit(null)}
                transaction={transactionToEdit}
                currency={currency}
                onUpdateTransaction={handleUpdateTransaction}
                onShowNotification={showNotification}
                onEditBill={handleEditBill}
            />
        </div>
    );
}

export default App;
