import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Bill } from '@/types';
import { getNextDueDate } from '@/utils/billUtils';

export interface PaymentDetails {
    date: string;
    amount: number;
    note?: string;
}

const getInitialDemoBills = (): Bill[] => {
    const today = new Date();
    const formatD = (offsetDays: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
    };

    return [
        {
            id: 'demo-1',
            groupId: 'grp-1',
            name: 'Rent & Housing',
            amount: 1450.00,
            dueDate: formatD(5),
            category: 'rent',
            status: 'pending',
            frequency: 'monthly',
            icon: 'Home',
            paymentMethod: 'manual',
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-2',
            groupId: 'grp-2',
            name: 'Electric Utility',
            amount: 88.50,
            dueDate: formatD(2),
            category: 'utilities',
            status: 'pending',
            frequency: 'monthly',
            icon: 'Zap',
            paymentMethod: 'url',
            paymentUrl: 'https://example.com/pay',
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-3',
            groupId: 'grp-3',
            name: 'Fibre Internet',
            amount: 65.00,
            dueDate: formatD(-2),
            category: 'internet',
            status: 'overdue',
            frequency: 'monthly',
            icon: 'Wifi',
            paymentMethod: 'url',
            paymentUrl: 'https://example.com/internet',
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-4',
            groupId: 'grp-4',
            name: 'Streaming Service',
            amount: 15.99,
            dueDate: formatD(-10),
            category: 'subscription',
            status: 'paid',
            paidDate: formatD(-10),
            paidAmount: 15.99,
            frequency: 'monthly',
            icon: 'Tv',
            paymentMethod: 'manual',
            createdAt: new Date().toISOString()
        }
    ];
};

export const useBills = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    // Load bills (Firebase or LocalStorage)
    useEffect(() => {
        if (!user) {
            setBills([]);
            setLoading(false);
            return;
        }

        if (isFirebaseConfigured && db) {
            const q = query(collection(db, 'users', user.id, 'bills'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const billsData: Bill[] = [];
                snapshot.forEach((docSnap) => {
                    billsData.push({ ...docSnap.data(), id: docSnap.id } as Bill);
                });
                setBills(billsData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching bills:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            // LocalStorage mode
            const saved = localStorage.getItem(`billber_bills_${user.id}`);
            if (saved) {
                try {
                    setBills(JSON.parse(saved));
                } catch {
                    const defaults = getInitialDemoBills();
                    setBills(defaults);
                    localStorage.setItem(`billber_bills_${user.id}`, JSON.stringify(defaults));
                }
            } else {
                const defaults = getInitialDemoBills();
                setBills(defaults);
                localStorage.setItem(`billber_bills_${user.id}`, JSON.stringify(defaults));
            }
            setLoading(false);
        }
    }, [user]);

    const saveLocalBills = (newBills: Bill[]) => {
        setBills(newBills);
        if (user) {
            localStorage.setItem(`billber_bills_${user.id}`, JSON.stringify(newBills));
        }
    };

    const addBill = async (billData: Omit<Bill, 'id'>) => {
        if (!user) return;
        if (isFirebaseConfigured && db) {
            await addDoc(collection(db, 'users', user.id, 'bills'), {
                ...billData,
                createdAt: new Date().toISOString()
            });
        } else {
            const newBill: Bill = {
                ...billData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            saveLocalBills([...bills, newBill]);
        }
    };

    const updateBill = async (id: string, updates: Partial<Bill>) => {
        if (!user) return;
        if (isFirebaseConfigured && db) {
            const billRef = doc(db, 'users', user.id, 'bills', id);
            await updateDoc(billRef, updates);
        } else {
            const updated = bills.map(b => b.id === id ? { ...b, ...updates } : b);
            saveLocalBills(updated);
        }
    };

    const updateBillGroup = async (id: string, updates: Partial<Bill>) => {
        if (!user) return;

        const targetBill = bills.find(b => b.id === id);
        if (!targetBill) return;

        if (isFirebaseConfigured && db) {
            const batch = writeBatch(db);
            if (targetBill.groupId) {
                const groupBillsToUpdate = bills.filter(b =>
                    b.groupId === targetBill.groupId &&
                    (b.status === 'pending' || b.status === 'overdue')
                );
                groupBillsToUpdate.forEach(bill => {
                    const billRef = doc(db, 'users', user!.id, 'bills', bill.id);
                    batch.update(billRef, {
                        name: updates.name !== undefined ? updates.name : bill.name,
                        icon: updates.icon !== undefined ? updates.icon : bill.icon,
                        category: updates.category !== undefined ? updates.category : bill.category,
                        amount: updates.amount !== undefined ? updates.amount : bill.amount,
                        frequency: updates.frequency !== undefined ? updates.frequency : bill.frequency,
                        paymentUrl: updates.paymentUrl !== undefined ? updates.paymentUrl : bill.paymentUrl,
                        paymentMethod: updates.paymentMethod !== undefined ? updates.paymentMethod : bill.paymentMethod,
                    });
                });
            } else {
                const billRef = doc(db, 'users', user.id, 'bills', id);
                batch.update(billRef, updates);
            }
            await batch.commit();
        } else {
            const updated = bills.map(b => {
                if (targetBill.groupId && b.groupId === targetBill.groupId && (b.status === 'pending' || b.status === 'overdue')) {
                    return { ...b, ...updates };
                } else if (b.id === id) {
                    return { ...b, ...updates };
                }
                return b;
            });
            saveLocalBills(updated);
        }
    };

    const deleteBill = async (id: string) => {
        if (!user) return;

        const billToDelete = bills.find(b => b.id === id);
        if (!billToDelete) return;

        if (isFirebaseConfigured && db) {
            const batch = writeBatch(db);
            if (billToDelete.groupId) {
                const groupBills = bills.filter(b => b.groupId === billToDelete.groupId);
                groupBills.forEach(bill => {
                    const billRef = doc(db, 'users', user!.id, 'bills', bill.id);
                    batch.delete(billRef);
                });
            } else {
                const billRef = doc(db, 'users', user.id, 'bills', id);
                batch.delete(billRef);
            }
            await batch.commit();
        } else {
            const remaining = billToDelete.groupId
                ? bills.filter(b => b.groupId !== billToDelete.groupId)
                : bills.filter(b => b.id !== id);
            saveLocalBills(remaining);
        }
    };

    const deleteBillInstance = async (id: string) => {
        if (!user) return;
        if (isFirebaseConfigured && db) {
            await deleteDoc(doc(db, 'users', user.id, 'bills', id));
        } else {
            saveLocalBills(bills.filter(b => b.id !== id));
        }
    };

    const markAsPaid = async (id: string, details?: PaymentDetails, createNextBill: boolean = true) => {
        if (!user) return;

        const billToPay = bills.find(b => b.id === id);
        if (!billToPay || billToPay.status === 'paid' || billToPay.status === 'skipped') return;

        if (isFirebaseConfigured && db) {
            const batch = writeBatch(db);
            if (createNextBill) {
                const currentBillRef = doc(db, 'users', user.id, 'bills', id);
                batch.update(currentBillRef, {
                    status: 'paid',
                    paidDate: details?.date || new Date().toISOString(),
                    paidAmount: details?.amount || billToPay.amount,
                    note: details?.note
                });

                if (billToPay.frequency && billToPay.frequency !== 'one-time') {
                    const nextDate = getNextDueDate(billToPay.dueDate, billToPay.frequency);
                    const alreadyExists = bills.some(b => b.groupId === billToPay.groupId && b.dueDate === nextDate);
                    if (!alreadyExists) {
                        const nextBillRef = doc(collection(db, 'users', user.id, 'bills'));
                        const newBill: Omit<Bill, 'id'> = {
                            ...billToPay,
                            dueDate: nextDate,
                            status: 'pending',
                            paidDate: undefined,
                            paidAmount: undefined,
                            note: undefined,
                            createdAt: new Date().toISOString()
                        };
                        const cleanBill = JSON.parse(JSON.stringify(newBill));
                        batch.set(nextBillRef, cleanBill);
                    }
                }
            } else {
                const paymentRecordRef = doc(collection(db, 'users', user.id, 'bills'));
                const paymentRecord = {
                    ...billToPay,
                    status: 'paid',
                    paidDate: details?.date || new Date().toISOString(),
                    paidAmount: details?.amount || billToPay.amount,
                    note: details?.note,
                    createdAt: new Date().toISOString()
                };
                delete (paymentRecord as any).id;
                const cleanRecord = JSON.parse(JSON.stringify(paymentRecord));
                batch.set(paymentRecordRef, cleanRecord);
            }
            await batch.commit();
        } else {
            let newBills = [...bills];
            if (createNextBill) {
                newBills = newBills.map(b => b.id === id ? {
                    ...b,
                    status: 'paid',
                    paidDate: details?.date || new Date().toISOString(),
                    paidAmount: details?.amount || billToPay.amount,
                    note: details?.note
                } : b);

                if (billToPay.frequency && billToPay.frequency !== 'one-time') {
                    const nextDate = getNextDueDate(billToPay.dueDate, billToPay.frequency);
                    const alreadyExists = newBills.some(b => b.groupId === billToPay.groupId && b.dueDate === nextDate);
                    if (!alreadyExists) {
                        newBills.push({
                            ...billToPay,
                            id: Date.now().toString(),
                            dueDate: nextDate,
                            status: 'pending',
                            paidDate: undefined,
                            paidAmount: undefined,
                            note: undefined,
                            createdAt: new Date().toISOString()
                        });
                    }
                }
            } else {
                newBills.push({
                    ...billToPay,
                    id: Date.now().toString(),
                    status: 'paid',
                    paidDate: details?.date || new Date().toISOString(),
                    paidAmount: details?.amount || billToPay.amount,
                    note: details?.note,
                    createdAt: new Date().toISOString()
                });
            }
            saveLocalBills(newBills);
        }
    };

    const skipBill = async (id: string) => {
        if (!user) return;

        const billToSkip = bills.find(b => b.id === id);
        if (!billToSkip || billToSkip.status === 'paid' || billToSkip.status === 'skipped') return;

        if (isFirebaseConfigured && db) {
            const batch = writeBatch(db);
            const currentBillRef = doc(db, 'users', user.id, 'bills', id);
            batch.update(currentBillRef, { status: 'skipped' });

            if (billToSkip.frequency && billToSkip.frequency !== 'one-time') {
                const nextDate = getNextDueDate(billToSkip.dueDate, billToSkip.frequency);
                const alreadyExists = bills.some(b => b.groupId === billToSkip.groupId && b.dueDate === nextDate);
                if (!alreadyExists) {
                    const nextBillRef = doc(collection(db, 'users', user.id, 'bills'));
                    const newBill: Omit<Bill, 'id'> = {
                        ...billToSkip,
                        dueDate: nextDate,
                        status: 'pending',
                        paidDate: undefined,
                        paidAmount: undefined,
                        note: undefined,
                        createdAt: new Date().toISOString()
                    };
                    const cleanBill = JSON.parse(JSON.stringify(newBill));
                    batch.set(nextBillRef, cleanBill);
                }
            }
            await batch.commit();
        } else {
            const newBills = bills.map(b => b.id === id ? { ...b, status: 'skipped' as const } : b);
            if (billToSkip.frequency && billToSkip.frequency !== 'one-time') {
                const nextDate = getNextDueDate(billToSkip.dueDate, billToSkip.frequency);
                const alreadyExists = newBills.some(b => b.groupId === billToSkip.groupId && b.dueDate === nextDate);
                if (!alreadyExists) {
                    newBills.push({
                        ...billToSkip,
                        id: Date.now().toString(),
                        dueDate: nextDate,
                        status: 'pending',
                        paidDate: undefined,
                        paidAmount: undefined,
                        note: undefined,
                        createdAt: new Date().toISOString()
                    });
                }
            }
            saveLocalBills(newBills);
        }
    };

    return {
        bills,
        loading,
        addBill,
        updateBill,
        updateBillGroup,
        deleteBill,
        markAsPaid,
        skipBill,
        deleteBillInstance,
    };
};
