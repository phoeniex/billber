import { Bill } from '@/types';
import { BillIcon } from '@/components/ui/BillIcon';
import { getDaysUntilDue, formatDate } from '@/utils/billUtils';
import { MoreVertical, CheckCircle, FastForward, Trash2, History, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BillRowProps {
    bill: Bill;
    currency: string;
    locale: string;
    onMarkAsPaid: (id: string) => void;
    onSkip: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: (bill: Bill) => void;
    onEdit: (bill: Bill) => void;
}

export const BillRow = ({
    bill, currency, locale,
    onMarkAsPaid, onSkip, onDelete, onViewHistory, onEdit
}: BillRowProps) => {
    const formattedAmount = bill.amount !== undefined ? new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(bill.amount) : '--';

    const isOverdue = bill.status === 'overdue';
    const isIncome = bill.type === 'income';
    const dueStatus = getDaysUntilDue(bill.dueDate);

    return (
        <div className={cn(
            "group flex items-center gap-4 p-4 bg-card hover:bg-muted/50 rounded-2xl transition-all duration-200 cursor-default border shadow-xs hover:shadow-md mb-3",
            isIncome ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10" : "border-transparent hover:border-border"
        )}>
            {/* Icon */}
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-xs shrink-0",
                isIncome
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "text-primary bg-muted/80 group-hover:bg-card"
            )}>
                <BillIcon icon={bill.icon || (isIncome ? 'Briefcase' : 'FileText')} className="w-6 h-6" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0" onClick={() => onViewHistory(bill)}>
                <div className="flex items-center mb-1 gap-2 flex-wrap">
                    <h4 className="font-bold text-base truncate cursor-pointer hover:text-primary transition-colors">
                        {bill.name}
                    </h4>
                    <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-semibold capitalize",
                        isIncome
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {bill.category}
                    </span>
                </div>
                <div className={cn('text-sm font-medium', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                    {dueStatus} <span className="opacity-40 font-normal mx-1">•</span> {formatDate(bill.dueDate)}
                </div>
            </div>

            {/* Amount & Actions */}
            <div className="text-right flex items-center gap-4">
                <div className="text-right mr-2">
                    <div className={cn(
                        "font-extrabold text-lg",
                        isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/90"
                    )}>
                        {isIncome ? '+' : ''}{currency}{formattedAmount}
                    </div>
                    {bill.frequency && bill.frequency !== 'one-time' && (
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {bill.frequency}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsPaid(bill.id);
                            }}
                            className="rounded-full h-9.5 px-4.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-105 transition-all"
                            title={isIncome ? "Log Income Received" : "Mark as Paid"}
                        >
                            <CheckCircle className="w-4 h-4 mr-1.5" /> {isIncome ? 'Receive' : 'Pay'}
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {(bill.status === 'pending' || bill.status === 'overdue') && (
                                <DropdownMenuItem onClick={() => onSkip(bill.id)}>
                                    <FastForward className="w-4 h-4 mr-2" /> Skip
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onViewHistory(bill)}>
                                <History className="w-4 h-4 mr-2" /> History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(bill)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(bill.id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
