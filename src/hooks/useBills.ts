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
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Bill } from '@/types';
import { getNextDueDate } from '@/utils/billUtils';

export interface PaymentDetails {
    date: string;
    amount: number;
    note?: string;
}

export const useBills = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    // Real-time listener for bills
    useEffect(() => {
        if (!user) {
            setBills([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'users', user.id, 'bills'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const billsData: Bill[] = [];
            snapshot.forEach((doc) => {
                billsData.push({ ...doc.data(), id: doc.id } as Bill);
            });
            setBills(billsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching bills:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addBill = async (billData: Omit<Bill, 'id'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'users', user.id, 'bills'), {
                ...billData,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding bill: ", error);
            throw error;
        }
    };

    const updateBill = async (id: string, updates: Partial<Bill>) => {
        if (!user) return;
        try {
            const billRef = doc(db, 'users', user.id, 'bills', id);
            await updateDoc(billRef, updates);
        } catch (error) {
            console.error("Error updating bill: ", error);
            throw error;
        }
    };

    const updateBillGroup = async (id: string, updates: Partial<Bill>) => {
        if (!user) return;

        const targetBill = bills.find(b => b.id === id);
        if (!targetBill) return;

        try {
            const batch = writeBatch(db);

            // If bill has a groupId, update only UNPAID bills in the group (Part B: Preserve History)
            if (targetBill.groupId) {
                // We typically only want to update 'pending' or 'overdue' bills (future/current).
                // We do NOT want to change the amount/name of a bill you already paid 6 months ago.
                const groupBillsToUpdate = bills.filter(b =>
                    b.groupId === targetBill.groupId &&
                    (b.status === 'pending' || b.status === 'overdue')
                );

                groupBillsToUpdate.forEach(bill => {
                    const billRef = doc(db, 'users', user!.id, 'bills', bill.id);
                    // Only update shared properties
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
                // Single bill update
                const billRef = doc(db, 'users', user.id, 'bills', id);
                batch.update(billRef, updates);
            }

            await batch.commit();
        } catch (error) {
            console.error("Error updating bill group: ", error);
            throw error;
        }
    };

    const deleteBill = async (id: string) => {
        if (!user) return;

        const billToDelete = bills.find(b => b.id === id);
        if (!billToDelete) return;

        try {
            const batch = writeBatch(db);

            if (billToDelete.groupId) {
                // Delete all in group
                const groupBills = bills.filter(b => b.groupId === billToDelete.groupId);
                groupBills.forEach(bill => {
                    const billRef = doc(db, 'users', user!.id, 'bills', bill.id);
                    batch.delete(billRef);
                });
            } else {
                // Delete single
                const billRef = doc(db, 'users', user.id, 'bills', id);
                batch.delete(billRef);
            }

            await batch.commit();
        } catch (error) {
            console.error("Error deleting bill: ", error);
            throw error;
        }
    };

    const deleteBillInstance = async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.id, 'bills', id));
        } catch (error) {
            console.error("Error deleting bill instance: ", error);
            throw error;
        }
    };

    const markAsPaid = async (id: string, details?: PaymentDetails, createNextBill: boolean = true) => {
        if (!user) return;

        const billToPay = bills.find(b => b.id === id);
        if (!billToPay || billToPay.status === 'paid' || billToPay.status === 'skipped') return;

        try {
            const batch = writeBatch(db);

            if (createNextBill) {
                // Option A: Standard Flow (Mark Paid + Advance)
                // 1. Mark current as paid
                const currentBillRef = doc(db, 'users', user.id, 'bills', id);
                batch.update(currentBillRef, {
                    status: 'paid',
                    paidDate: details?.date || new Date().toISOString(),
                    paidAmount: details?.amount || billToPay.amount,
                    note: details?.note
                });

                // 2. Handle recurring (Create next bill)
                if (billToPay.frequency && billToPay.frequency !== 'one-time') {
                    const nextDate = getNextDueDate(billToPay.dueDate, billToPay.frequency);

                    // Check if next bill already exists to prevent duplicates (Idempotency)
                    const alreadyExists = bills.some(b =>
                        b.groupId === billToPay.groupId &&
                        b.dueDate === nextDate
                    );

                    if (!alreadyExists) {
                        const nextBillRef = doc(collection(db, 'users', user.id, 'bills'));
                        const newBill: Omit<Bill, 'id'> = {
                            ...billToPay,
                            dueDate: nextDate,
                            status: 'pending',
                            // Reset single-instance fields
                            paidDate: undefined,
                            paidAmount: undefined,
                            note: undefined,
                            createdAt: new Date().toISOString()
                            // Keep groupId to link them!
                        };

                        // Remove undefined fields to prevent Firestore errors
                        const cleanBill = JSON.parse(JSON.stringify(newBill));
                        batch.set(nextBillRef, cleanBill);
                    }
                }
            } else {
                // Option B: Log Payment Only (Keep Current Pending)
                // Create a separate payment record (History)
                const paymentRecordRef = doc(collection(db, 'users', user.id, 'bills'));
                const paymentRecord = {
                    ...billToPay,
                    status: 'paid',
                    paidDate: details?.date || new Date().toISOString(),
                    paidAmount: details?.amount || billToPay.amount,
                    note: details?.note,
                    createdAt: new Date().toISOString()
                };
                // Ensure no ID carries over (though addDoc/set handles it, good to be safe)
                delete (paymentRecord as any).id;

                const cleanRecord = JSON.parse(JSON.stringify(paymentRecord));
                batch.set(paymentRecordRef, cleanRecord);
            }

            await batch.commit();
        } catch (error) {
            console.error("Error marking bill as paid: ", error);
            throw error;
        }
    };

    const skipBill = async (id: string) => {
        if (!user) return;

        const billToSkip = bills.find(b => b.id === id);
        if (!billToSkip || billToSkip.status === 'paid' || billToSkip.status === 'skipped') return;

        try {
            const batch = writeBatch(db);

            // 1. Mark current as skipped
            const currentBillRef = doc(db, 'users', user.id, 'bills', id);
            batch.update(currentBillRef, { status: 'skipped' });

            // 2. Handle recurring
            if (billToSkip.frequency && billToSkip.frequency !== 'one-time') {
                const nextDate = getNextDueDate(billToSkip.dueDate, billToSkip.frequency);

                // Check if next bill already exists
                const alreadyExists = bills.some(b =>
                    b.groupId === billToSkip.groupId &&
                    b.dueDate === nextDate
                );

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
                    // Remove undefined fields
                    const cleanBill = JSON.parse(JSON.stringify(newBill));
                    batch.set(nextBillRef, cleanBill);
                }
            }

            await batch.commit();
        } catch (error) {
            console.error("Error skipping bill: ", error);
            throw error;
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
