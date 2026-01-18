import { useEffect } from 'react';
import { Bill } from '@/types';

export const useBillChecker = (
    bills: Bill[],
    showNotification: (title: string, message: string, type: 'warning' | 'info') => void
) => {
    useEffect(() => {
        const checkBills = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            bills.forEach(bill => {
                if (bill.status === 'pending') {
                    const dueDate = new Date(bill.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysUntilDue <= 3 && daysUntilDue >= 0) {
                        showNotification(
                            `Bill Due Soon: ${bill.name}`,
                            `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} - $${bill.amount}`,
                            'warning'
                        );
                    }
                }
            });
        };

        if (bills.length > 0) {
            checkBills();
            const interval = setInterval(checkBills, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [bills, showNotification]);
};
