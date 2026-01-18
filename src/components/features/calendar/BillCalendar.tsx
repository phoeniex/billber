import { useState } from 'react';
import { Bill } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BillCalendarProps {
    bills: Bill[];
    currency: string;
    locale: string;
}

export const BillCalendar = ({ bills, currency, locale }: BillCalendarProps) => {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
    };

    // Filter bills for this view month
    const getBillsForMonth = () => {
        return bills.filter(b => {
            const d = new Date(b.dueDate);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    };

    const currentMonthBills = getBillsForMonth();

    const getBillsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bills.filter(b => b.dueDate === dateStr);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

    // Stats Calculations
    const totalPaidMonth = currentMonthBills
        .filter(b => b.status === 'paid')
        .reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);

    const totalDueMonth = currentMonthBills
        .filter(b => b.status !== 'skipped') // Exclude skipped from total due
        .reduce((sum, b) => sum + (b.amount || 0), 0);

    const totalOutstanding = bills
        .filter(b => b.status === 'pending' || b.status === 'overdue')
        .reduce((sum, b) => sum + (b.amount || 0), 0);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Calendar generation
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="invisible h-10 w-10"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayBills = getBillsForDay(day);
        const todayClass = isToday(day) ? 'bg-primary text-primary-content shadow-md' : 'text-base-content hover:bg-base-300';

        // Sort dots: overdue (error) > pending (warning) > paid (success)
        const sortedBills = [...dayBills].sort((a, b) => {
            const score = (s: string) => s === 'overdue' ? 3 : s === 'pending' ? 2 : 1;
            return score(b.status) - score(a.status);
        });

        days.push(
            <div
                key={day}
                className={`h-10 w-10 rounded-full flex flex-col items-center justify-center relative cursor-default transition-all duration-200 mx-auto group ${todayClass}`}
            >
                <span className="text-sm font-semibold">{day}</span>

                {sortedBills.length > 0 && (
                    <div className="flex gap-0.5 absolute bottom-2">
                        {sortedBills.slice(0, 3).map((bill) => {
                            let color = 'bg-base-300';
                            if (bill.status === 'overdue') color = 'bg-error';
                            else if (bill.status === 'pending') color = 'bg-warning';
                            else if (bill.status === 'paid') color = 'bg-success';
                            else if (bill.status === 'skipped') color = 'bg-base-300';

                            return (
                                <div
                                    key={bill.id}
                                    className={`w-1 h-1 rounded-full ${color}`}
                                    title={`${bill.name} (${bill.status})`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-fit sticky top-4">
            <div className="p-4 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="btn btn-sm btn-ghost btn-circle">
                            <ChevronLeft className="w-5 h-5 opacity-60" />
                        </button>
                        <button onClick={nextMonth} className="btn btn-sm btn-ghost btn-circle">
                            <ChevronRight className="w-5 h-5 opacity-60" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-2 text-center text-[10px] opacity-40 font-bold uppercase tracking-widest">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                    {days}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 space-y-6 px-4">
                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold opacity-60 mb-1">Bills Paid (Monthly)</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{currency}{formatMoney(totalPaidMonth)}</span>
                                <span className="text-sm opacity-40 contrast-more:text-red-500 font-medium decoration-slice">/ {currency}{formatMoney(totalDueMonth)}</span>
                            </div>
                        </div>
                        <div className="relative w-14 h-14">
                            <div
                                className="radial-progress text-base-300 absolute inset-0"
                                style={{ "--value": 100, "--size": "3.5rem" } as any}
                                role="progressbar"
                            ></div>
                            <div
                                className="radial-progress text-primary text-xs font-bold absolute inset-0"
                                style={{ "--value": totalDueMonth > 0 ? (totalPaidMonth / totalDueMonth) * 100 : 0, "--size": "3.5rem" } as any}
                                role="progressbar"
                            >
                                {Math.round(totalDueMonth > 0 ? (totalPaidMonth / totalDueMonth) * 100 : 0)}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="collapse collapse-arrow px-0 rounded-xl">
                    <input type="checkbox" />
                    <div className="collapse-title min-h-0 py-3 pl-0 flex flex-col items-start gap-1">
                        <h4 className="text-sm font-semibold opacity-60">Total Outstanding</h4>
                        <div className="text-2xl font-bold text-primary">{currency}{formatMoney(totalOutstanding)}</div>
                    </div>
                    <div className="collapse-content">
                        <div className="space-y-3 pt-2">
                            {Object.entries(currentMonthBills.reduce((acc, bill) => {
                                const amount = bill.amount || 0;
                                const paidAmt = bill.status === 'paid' ? (bill.paidAmount || amount) : 0;

                                if (amount > 0) {
                                    if (!acc[bill.category]) acc[bill.category] = { total: 0, paid: 0 };
                                    acc[bill.category].total += amount;
                                    acc[bill.category].paid += paidAmt;
                                }
                                return acc;
                            }, {} as Record<string, { total: number, paid: number }>))
                                .sort(([, a], [, b]) => b.total - a.total)
                                .map(([category, { total, paid }]) => (
                                    <div key={category} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="capitalize opacity-70">{category}</span>
                                            <span className="font-semibold">{currency}{formatMoney(paid)} / {currency}{formatMoney(total)}</span>
                                        </div>
                                        <progress
                                            className="progress progress-primary w-full h-1.5"
                                            value={paid}
                                            max={total}
                                        ></progress>
                                    </div>
                                ))}
                            {currentMonthBills.length === 0 && (
                                <div className="text-xs opacity-40 italic">No bills this month</div>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </div >
    );
};
