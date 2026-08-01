import { useState } from 'react';
import { Bill } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BillCalendarProps {
    bills: Bill[];
    currency: string;
    locale: string;
}

export const BillCalendar = ({ bills }: BillCalendarProps) => {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const getBillsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bills.filter(b => b.dueDate === dateStr);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

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
                            if (bill.type === 'income') color = 'bg-emerald-500';
                            else if (bill.status === 'overdue') color = 'bg-destructive';
                            else if (bill.status === 'pending') color = 'bg-[color:var(--warning)]';
                            else if (bill.status === 'paid') color = 'bg-[color:var(--success)]';
                            return (
                                <div key={bill.id} className={`w-1 h-1 rounded-full ${color}`} title={`${bill.name} (${bill.type === 'income' ? 'Income' : bill.status})`} />
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-fit">
            <div className="p-2 sm:p-4 rounded-3xl">
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
        </div>
    );
};
