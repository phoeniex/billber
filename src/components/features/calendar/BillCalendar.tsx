import { useState } from 'react';
import { Bill } from '@/types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BillCalendarProps {
    bills: Bill[];
    currency: string;
    locale: string;
}

/** Circular progress ring (replaces DaisyUI radial-progress) */
const RadialProgress = ({ value, size = 56 }: { value: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={4} className="text-border" />
            <circle
                cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={4}
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
            />
        </svg>
    );
};

export const BillCalendar = ({ bills, currency, locale }: BillCalendarProps) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [showBreakdown, setShowBreakdown] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const getBillsForMonth = () => bills.filter(b => {
        const d = new Date(b.dueDate);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const currentMonthBills = getBillsForMonth();

    const getBillsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bills.filter(b => b.dueDate === dateStr);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

    const totalPaidMonth = currentMonthBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.paidAmount || b.amount || 0), 0);
    const totalDueMonth = currentMonthBills.filter(b => b.status !== 'skipped').reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalOutstanding = bills.filter(b => b.status === 'pending' || b.status === 'overdue').reduce((sum, b) => sum + (b.amount || 0), 0);

    const paidPct = totalDueMonth > 0 ? Math.round((totalPaidMonth / totalDueMonth) * 100) : 0;

    const formatMoney = (amount: number) => new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    // Calendar grid
    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="invisible h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayBills = getBillsForDay(day);
        const sortedBills = [...dayBills].sort((a, b) => {
            const score = (s: string) => s === 'overdue' ? 3 : s === 'pending' ? 2 : 1;
            return score(b.status) - score(a.status);
        });

        days.push(
            <div
                key={day}
                className={cn(
                    'h-10 w-10 rounded-full flex flex-col items-center justify-center relative cursor-default transition-all duration-200 mx-auto group',
                    isToday(day)
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-muted'
                )}
            >
                <span className="text-sm font-semibold">{day}</span>
                {sortedBills.length > 0 && (
                    <div className="flex gap-0.5 absolute bottom-2">
                        {sortedBills.slice(0, 3).map((bill) => {
                            let color = 'bg-muted-foreground';
                            if (bill.status === 'overdue') color = 'bg-destructive';
                            else if (bill.status === 'pending') color = 'bg-[color:var(--warning)]';
                            else if (bill.status === 'paid') color = 'bg-[color:var(--success)]';
                            return (
                                <div key={bill.id} className={`w-1 h-1 rounded-full ${color}`} title={`${bill.name} (${bill.status})`} />
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
                {/* Month header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="rounded-full" onClick={prevMonth}>
                            <ChevronLeft className="w-5 h-5 opacity-60" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full" onClick={nextMonth}>
                            <ChevronRight className="w-5 h-5 opacity-60" />
                        </Button>
                    </div>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-2 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                    {days}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 space-y-6 px-4">
                {/* Paid this month */}
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-1">Bills Paid (Monthly)</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{currency}{formatMoney(totalPaidMonth)}</span>
                            <span className="text-sm text-muted-foreground font-medium">/ {currency}{formatMoney(totalDueMonth)}</span>
                        </div>
                    </div>
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <RadialProgress value={paidPct} size={56} />
                        <span className="absolute text-xs font-bold">{paidPct}%</span>
                    </div>
                </div>

                {/* Outstanding accordion */}
                <div>
                    <button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="flex items-start justify-between w-full text-left group"
                    >
                        <div className="flex flex-col">
                            <h4 className="text-sm font-semibold text-muted-foreground">Total Outstanding</h4>
                            <div className="text-2xl font-bold text-primary">{currency}{formatMoney(totalOutstanding)}</div>
                        </div>
                        <ChevronDown className={cn('w-4 h-4 mt-3 text-muted-foreground transition-transform duration-200', showBreakdown && 'rotate-180')} />
                    </button>

                    {showBreakdown && (
                        <div className="space-y-3 pt-3 animate-fade-in">
                            {Object.entries(currentMonthBills.reduce((acc, bill) => {
                                const amount = bill.amount || 0;
                                const paidAmt = bill.status === 'paid' ? (bill.paidAmount || amount) : 0;
                                if (amount > 0) {
                                    if (!acc[bill.category]) acc[bill.category] = { total: 0, paid: 0 };
                                    acc[bill.category].total += amount;
                                    acc[bill.category].paid += paidAmt;
                                }
                                return acc;
                            }, {} as Record<string, { total: number; paid: number }>))
                                .sort(([, a], [, b]) => b.total - a.total)
                                .map(([category, { total, paid }]) => (
                                    <div key={category} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="capitalize text-muted-foreground">{category}</span>
                                            <span className="font-semibold">{currency}{formatMoney(paid)} / {currency}{formatMoney(total)}</span>
                                        </div>
                                        <Progress value={total > 0 ? (paid / total) * 100 : 0} className="h-1.5" />
                                    </div>
                                ))}
                            {currentMonthBills.length === 0 && (
                                <div className="text-xs text-muted-foreground italic">No bills this month</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
