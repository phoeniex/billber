import { useState, useEffect } from 'react';
import { Bill } from '@/types';

import { AddBillForm } from './components/features/bills/AddBillForm';
import { BillsList } from './components/features/bills/BillsList';
import { SettingsModal } from './components/features/settings/SettingsModal';
import { PayBillModal } from './components/features/bills/PayBillModal';
import { BillHistoryModal } from './components/features/bills/BillHistoryModal';
import { EditTransactionModal } from './components/features/bills/EditTransactionModal';
import { BillCalendar } from './components/features/calendar/BillCalendar';
import { useBills } from './hooks/useBills';
import { useCurrency } from './hooks/useCurrency';
import { useNotifications } from './hooks/useNotifications';
import { useBillChecker } from './hooks/useBillChecker';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { LogOut, User as UserIcon } from 'lucide-react';

function App() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [billToPay, setBillToPay] = useState<Bill | null>(null);
    const [historyBill, setHistoryBill] = useState<Bill | null>(null);
    const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Bill | null>(null);

    // Destructure locale and updateLocale
    const { currency, locale, updateCurrency, updateLocale } = useCurrency();
    const { theme, toggleTheme } = useTheme();
    const { bills, loading: billsLoading, addBill, updateBill, updateBillGroup, markAsPaid, skipBill, deleteBill, deleteBillInstance } = useBills();
    const { showNotification } = useNotifications();

    // Check bills for upcoming due dates
    useBillChecker(bills, showNotification);

    // Load persistence
    useEffect(() => {
        // Welcome
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            showNotification(
                'Welcome to Bill Manager!',
                'Track and manage your monthly bills with ease.',
                'success'
            );
            localStorage.setItem('hasSeenWelcome', 'true');
        }
    }, []);

    const handleCurrencyChange = (newCurrency: string) => {
        updateCurrency(newCurrency);
        showNotification('Settings Saved', `Currency changed to ${newCurrency}`, 'success');
    };

    const handleLocaleChange = (newLocale: string) => {
        updateLocale(newLocale);
        showNotification('Settings Saved', 'Region format updated', 'success');
    };

    const handleMarkAsPaid = (id: string) => {
        const bill = bills.find(b => b.id === id);
        if (bill) {
            setBillToPay(bill);
        }
    };

    const handleConfirmPayment = (id: string, details: { date: string, amount: number, note?: string }, createNextBill: boolean) => {
        markAsPaid(id, details, createNextBill);
        const bill = bills.find(b => b.id === id);
        if (bill) {
            showNotification('Payment Recorded', `${bill.name} marked as paid!`, 'success');
        }
        setBillToPay(null);
    };

    const handleSkipBill = (id: string) => {
        const bill = bills.find(b => b.id === id);
        if (!bill) return;

        if (window.confirm(`Are you sure you want to skip "${bill.name}"? This will mark it as skipped and schedule the next payment.`)) {
            skipBill(id);
            showNotification('Bill Skipped', `${bill.name} marked as skipped.`, 'info');
        }
    };

    const handleDeleteBill = (id: string) => {
        const bill = bills.find(b => b.id === id);
        if (!bill) return;

        if (window.confirm(`Are you sure you want to delete "${bill.name}"? This action cannot be undone.`)) {
            deleteBill(id);
            showNotification('Bill Deleted', `${bill.name} has been removed.`, 'info');
        }
    };

    const handleViewHistory = (bill: Bill) => {
        setHistoryBill(bill);
    };

    const handleEditBill = (bill: Bill) => {
        setBillToEdit(bill);
        setShowAddBillModal(true);
        setHistoryBill(null); // Close history modal to prevent overlap
    };

    const handleUpdateBill = (id: string, updatedBill: Bill) => {
        updateBillGroup(id, updatedBill);
        setBillToEdit(null);
        setShowAddBillModal(false);
    };

    const handleCloseAddBill = () => {
        setShowAddBillModal(false);
        setBillToEdit(null);
    };

    const handleDeleteTransaction = (id: string) => {
        deleteBillInstance(id);
        showNotification('Record Deleted', 'Transaction history record removed.', 'info');
    };

    const handleEditTransaction = (transaction: Bill) => {
        setTransactionToEdit(transaction);
    };

    const handleUpdateTransaction = (id: string, updatedTransaction: Bill) => {
        updateBill(id, updatedTransaction);
        setTransactionToEdit(null);
    };

    if (isLoading || (isAuthenticated && billsLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-ring loading-lg text-primary"></span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-primary/5 via-base-200 to-secondary/5 transition-colors duration-300 font-sans relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Left Panel: Calendar & Stats (Sidebar) */}
            <div className="relative z-10 w-full lg:w-[400px] xl:w-[480px] p-6 lg:p-10 flex flex-col gap-8 shrink-0 bg-base-100/30 backdrop-blur-md border-r border-white/5">
                {/* User Profile Card */}


                <div className="lg:sticky lg:top-10">
                    <BillCalendar bills={bills} currency={currency} locale={locale} />
                </div>

                {/* User Profile Card */}
                <div className="mt-auto lg:sticky lg:bottom-10 flex items-center justify-between p-4 bg-base-100/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-sm">
                    <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-base-300" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <UserIcon size={20} />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-sm">{user?.name}</p>
                            <p className="text-xs text-base-content/60">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Right Main Panel: Bills List (Main Content) */}
            <div className="relative z-10 flex-1 bg-base-100/80 backdrop-blur-md p-6 lg:p-12 lg:rounded-l-[3rem] shadow-none lg:shadow-xl min-h-screen flex flex-col border-l border-white/20">
                <div className="max-w-5xl mx-auto w-full">
                    <BillsList
                        bills={bills}
                        currency={currency}
                        locale={locale}
                        onMarkAsPaid={handleMarkAsPaid}
                        onSkip={handleSkipBill}
                        onDelete={handleDeleteBill}
                        onViewHistory={handleViewHistory}
                        onEdit={handleEditBill}
                        onAddBill={() => setShowAddBillModal(true)}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                </div>
            </div>



            <AddBillForm
                isOpen={showAddBillModal}
                onClose={handleCloseAddBill}
                currency={currency}
                onAddBill={addBill}
                onUpdateBill={handleUpdateBill}
                billToEdit={billToEdit}
                onShowNotification={showNotification}
            />

            <SettingsModal
                show={showSettings}
                onClose={() => setShowSettings(false)}
                currency={currency}
                locale={locale}
                theme={theme}
                onCurrencyChange={handleCurrencyChange}
                onLocaleChange={handleLocaleChange}
                onThemeChange={(newTheme) => {
                    toggleTheme(newTheme);
                    showNotification('Theme Updated', `Switched to ${newTheme} mode`, 'success');
                }}
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
                onEdit={handleEditTransaction}
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
