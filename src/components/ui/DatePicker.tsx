import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    required?: boolean;
}

export const DatePicker = ({ value, onChange, label = "Date", required = false }: DatePickerProps) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setViewDate(date);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setViewDate(new Date(year, month - 1, 1));
    };

    const nextMonth = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        const yearStr = date.getFullYear();
        const monthStr = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        onChange(`${yearStr}-${monthStr}-${dayStr}`);
        setShowCalendar(false);
    };

    const isSelected = (day: number) => {
        if (!value) return false;
        const [vYear, vMonth, vDay] = value.split('-').map(Number);
        return vYear === year && vMonth === (month + 1) && vDay === day;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="invisible h-8 w-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const selected = isSelected(day);
        const today = isToday(day);

        days.push(
            <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 mx-auto text-sm',
                    selected && 'bg-primary text-primary-foreground shadow-md font-bold',
                    !selected && today && 'border border-primary text-primary font-bold',
                    !selected && !today && 'hover:bg-primary/20 hover:text-primary'
                )}
            >
                {day}
            </div>
        );
    }

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-').map(Number);
        const localDate = new Date(y, m - 1, d);
        return localDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="max-w-full relative space-y-1.5" ref={containerRef}>
            <Label>{label}</Label>
            <div
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer',
                    'ring-offset-background transition-colors',
                    'hover:bg-muted/30',
                    showCalendar && 'ring-2 ring-ring ring-offset-2'
                )}
                onClick={() => setShowCalendar(!showCalendar)}
            >
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                    {value ? formatDateDisplay(value) : 'Select date...'}
                </span>
                <CalendarIcon className="w-5 h-5 text-primary" />
            </div>

            {showCalendar && (
                <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-popover rounded-xl shadow-xl border border-border w-full min-w-[300px] animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex gap-1">
                            <Button onClick={prevMonth} type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button onClick={nextMonth} type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-2 text-center text-xs text-muted-foreground font-bold uppercase">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                        {days}
                    </div>
                </div>
            )}

            <input
                type="text"
                className="sr-only"
                value={value}
                required={required}
                onChange={() => { }}
                tabIndex={-1}
            />
        </div>
    );
};
