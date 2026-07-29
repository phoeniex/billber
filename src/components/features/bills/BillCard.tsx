import { Bill } from '@/types';
import { formatDate, getDaysUntilDue } from '@/utils/billUtils';
import { BillIcon } from '@/components/ui/BillIcon';
import { CheckCircle, Trash2, Repeat, FastForward, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BillCardProps {
    bill: Bill;
    currency: string;
    locale: string;
    onMarkAsPaid: (id: string) => void;
    onSkip: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: (bill: Bill) => void;
}

export const BillCard = ({ bill, currency, locale, onMarkAsPaid, onSkip, onDelete, onViewHistory }: BillCardProps) => {
    const getBorderColor = () => {
        switch (bill.status) {
            case 'paid': return 'border-t-[color:var(--success)]';
            case 'pending': return 'border-t-[color:var(--warning)]';
            case 'overdue': return 'border-t-destructive';
            case 'skipped': return 'border-t-border';
            default: return 'border-t-primary';
        }
    };

    const getStatusColor = () => {
        switch (bill.status) {
            case 'paid': return 'bg-[color:var(--success)] text-[color:var(--success-foreground)]';
            case 'pending': return 'bg-[color:var(--warning)] text-[color:var(--warning-foreground)]';
            case 'overdue': return 'bg-destructive text-destructive-foreground';
            case 'skipped': return 'bg-muted text-muted-foreground';
            default: return 'bg-primary text-primary-foreground';
        }
    };

    const formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(bill.amount || 0);

    return (
        <div className={cn(
            'bg-card shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-t-4 rounded-2xl animate-slide-in-up group',
            getBorderColor()
        )}>
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-4 rounded-2xl bg-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <BillIcon icon={bill.icon || 'FileText'} className="w-8 h-8" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold truncate" title={bill.name}>{bill.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{bill.category}</span>
                                    {bill.frequency && bill.frequency !== 'one-time' && (
                                        <span className={cn(
                                            'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full capitalize',
                                            'bg-muted text-muted-foreground'
                                        )}>
                                            <Repeat className="w-3 h-3" />
                                            {bill.frequency}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize', getStatusColor())}>
                                {bill.status}
                            </span>
                        </div>

                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <div className="text-sm text-muted-foreground font-medium">Amount Due</div>
                                <div
                                    className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => onViewHistory(bill)}
                                    title="View History"
                                >
                                    {currency}{formattedAmount}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-muted-foreground font-medium">Due Date</div>
                                <div className="font-semibold">{formatDate(bill.dueDate)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {bill.status !== 'paid' && bill.status !== 'skipped' && (
                    <div className="mt-2 text-sm font-medium text-right flex justify-end">
                        <span className={bill.status === 'overdue' ? 'text-destructive' : 'text-[color:var(--warning)]'}>
                            {getDaysUntilDue(bill.dueDate)}
                        </span>
                    </div>
                )}

                <div className="flex justify-end mt-4 pt-4 border-t border-border gap-3">
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                        <>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={() => onSkip(bill.id)}
                                    >
                                        <FastForward className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Skip Payment</TooltipContent>
                            </Tooltip>
                            <Button
                                size="sm"
                                className="rounded-full px-6 bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:opacity-90 hover:scale-105 transition-transform shadow-md border-none"
                                onClick={() => onMarkAsPaid(bill.id)}
                            >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Pay
                            </Button>
                        </>
                    )}

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full"
                                onClick={() => onViewHistory(bill)}
                            >
                                <History className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>History</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(bill.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Bill</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};
