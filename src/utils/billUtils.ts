import { Bill, DashboardStats } from '@/types';

export const calculateStats = (bills: Bill[]): DashboardStats => {
    const totalIncome = bills.filter(b => b.type === 'income').reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalExpenses = bills.filter(b => (b.type || 'expense') === 'expense').reduce((sum, b) => sum + (b.amount || 0), 0);

    return {
        total: totalExpenses,
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        paid: bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + (bill.amount || 0), 0),
        pending: bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + (bill.amount || 0), 0),
        overdue: bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + (bill.amount || 0), 0),
        count: bills.length,
        paidCount: bills.filter(b => b.status === 'paid').length,
        pendingCount: bills.filter(b => b.status === 'pending').length,
        overdueCount: bills.filter(b => b.status === 'overdue').length,
    };
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const getDaysUntilDue = (dueDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
};

export const sortBills = (bills: Bill[]): Bill[] => {
    return [...bills].sort((a, b) => {
        const statusOrder: Record<string, number> = { overdue: 0, pending: 1, skipped: 2, paid: 3 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
};

export const getNextDueDate = (currentDate: string, frequency: 'monthly' | 'yearly'): string => {
    // Parsing manually to avoid timezone issues with plain dates
    const [year, month, day] = currentDate.split('-').map(Number);

    let newYear = year;
    let newMonth = month; // 1-12
    let newDay = day;

    if (frequency === 'monthly') {
        newMonth += 1;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
    } else if (frequency === 'yearly') {
        newYear += 1;
    }

    // Handle end-of-month days (e.g. Jan 31 -> Feb 28)
    const maxDaysInNewMonth = new Date(newYear, newMonth, 0).getDate();
    if (newDay > maxDaysInNewMonth) {
        newDay = maxDaysInNewMonth;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${newYear}-${pad(newMonth)}-${pad(newDay)}`;
};
