export type BillFrequency = 'one-time' | 'monthly' | 'yearly';
export type PaymentMethod = 'url' | 'barcode' | 'manual' | 'other';

export interface Bill {
    id: string;
    name: string;
    amount?: number;
    dueDate: string;
    category: BillCategory;
    status: BillStatus;
    frequency: BillFrequency;
    icon?: string;
    paymentUrl?: string;
    paymentMethod?: PaymentMethod;
    createdAt: string;
    paidDate?: string;
    paidAmount?: number;
    note?: string;
    groupId?: string;
}

export type BillCategory =
    | 'utilities'
    | 'rent'
    | 'insurance'
    | 'subscription'
    | 'internet'
    | 'credit-card'
    | 'loan'
    | 'other';

export type BillStatus = 'paid' | 'pending' | 'overdue' | 'skipped';

export interface BillFormData {
    name: string;
    amount: string;
    dueDate: string;
    category: BillCategory;
    status: BillStatus;
    frequency: BillFrequency;
    icon: string;
    paymentUrl: string;
    paymentMethod: PaymentMethod;
}

export interface Notification {
    id: string;

    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
}

export interface Currency {
    symbol: string;
    name: string;
    flag: string;
}

export interface DashboardStats {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    count: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
}
