import { useState } from 'react';
import { Bill, TransactionType } from '@/types';
import { BillRow } from './BillRow';
import { AlertCircle, CalendarCheck, Calendar, Plus, ChevronDown, ChevronUp, Search, Filter, TrendingUp, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BillsListProps {
    bills: Bill[];
    currency: string;
    locale: string;
    onMarkAsPaid: (id: string) => void;
    onSkip: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: (bill: Bill) => void;
    onAddBill: (initialType?: TransactionType) => void;
    onEdit: (bill: Bill) => void;
}

const CATEGORIES = [
    'utilities', 'rent', 'insurance', 'subscription', 'internet', 'credit-card', 'loan',
    'salary', 'freelance', 'investment', 'business', 'gift', 'refund', 'other'
];

export const BillsList = ({
    bills, currency, locale,
    onMarkAsPaid, onSkip, onDelete, onViewHistory,
    onAddBill, onEdit
}: BillsListProps) => {

    const [showAllPaid, setShowAllPaid] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
    const [showFilter, setShowFilter] = useState(false);

    const filteredBills = bills.filter(b => {
        const itemType = b.type || 'expense';
        const typeMatch = filterType === 'all' || itemType === filterType;
        const catMatch = filterCategory === 'all' || b.category === filterCategory;
        const searchMatch = (
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return typeMatch && catMatch && searchMatch;
    });

    const activeBills = filteredBills.filter(b => b.status === 'pending' || b.status === 'overdue');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDiff = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return Math.ceil((d.getTime() - today.getTime()) / (86400000));
    };

    const categorizeBills = (list: Bill[]) => {
        const active = list.filter(b => b.status === 'pending' || b.status === 'overdue');
        const overdue = active.filter(b => getDiff(b.dueDate) < 0)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const thisWeek = active.filter(b => {
            const d = getDiff(b.dueDate);
            return d >= 0 && d <= 7;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const future = active.filter(b => getDiff(b.dueDate) > 7);
        const laterThisMonth = future.filter(b => {
            const d = new Date(b.dueDate);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const upcomingMonth = future.filter(b => {
            const d = new Date(b.dueDate);
            return d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear();
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        return { overdue, thisWeek, laterThisMonth, upcomingMonth };
    };

    const buckets = categorizeBills(filteredBills);
    const allBuckets = categorizeBills(bills);

    const shouldShow = (type: keyof typeof buckets) => {
        if (searchQuery || filterCategory !== 'all' || filterType !== 'all') return allBuckets[type].length > 0;
        return buckets[type].length > 0;
    };

    return (
        <div className="space-y-8 animate-fade-in pl-0 lg:pl-6">
            <div className="flex flex-col gap-4 mb-6">
                {/* Section Title & Quick Add Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Financial Overview</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Manage your income earnings and upcoming bills</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={
                            <Button
                                className="rounded-full h-10 px-5 shadow-md font-bold text-xs sm:text-sm transition-transform hover:scale-105 gap-1.5 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Add New
                                <ChevronDown className="w-4 h-4 opacity-70 ml-0.5" />
                            </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl shadow-xl border-border/30">
                            <DropdownMenuItem
                                onClick={() => onAddBill('expense')}
                                className="rounded-xl py-2.5 font-semibold text-xs sm:text-sm cursor-pointer"
                            >
                                <Receipt className="w-4 h-4 mr-2 text-muted-foreground" />
                                Add Bill / Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onAddBill('income')}
                                className="rounded-xl py-2.5 font-semibold text-xs sm:text-sm cursor-pointer"
                            >
                                <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                                Add Income Earnings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Filter Tabs & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Filter Type Pills */}
                    <div className="p-1 bg-muted/60 rounded-full flex gap-1 self-start sm:self-auto border border-border/20">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                                filterType === 'all'
                                    ? "bg-card text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('expense')}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                                filterType === 'expense'
                                    ? "bg-card text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Bills / Expenses
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('income')}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                                filterType === 'income'
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Income
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by name or category..."
                            className="pl-9 rounded-full bg-card/50 focus:bg-card transition-colors h-10 border-border/30"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative shrink-0">
                        {filterCategory !== 'all' && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background z-10" />
                        )}
                        <Button
                            onClick={() => setShowFilter(!showFilter)}
                            size="icon"
                            variant={showFilter ? 'default' : 'ghost'}
                            className="rounded-full h-10 w-10 border border-border/30"
                            title="Toggle Category Filter"
                        >
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Expanded Category Filter Bar */}
                {showFilter && (
                    <div className="p-3 bg-card border border-border/30 rounded-2xl animate-fade-in flex flex-wrap gap-1.5">
                        <Badge
                            variant={filterCategory === 'all' ? 'default' : 'outline'}
                            className="cursor-pointer capitalize px-3 py-1 text-xs"
                            onClick={() => setFilterCategory('all')}
                        >
                            All Categories
                        </Badge>
                        {CATEGORIES.map(cat => (
                            <Badge
                                key={cat}
                                variant={filterCategory === cat ? 'default' : 'outline'}
                                className="cursor-pointer capitalize px-3 py-1 text-xs"
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Overdue Section */}
            {shouldShow('overdue') && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-destructive font-bold text-base px-1">
                        <AlertCircle className="w-5 h-5" />
                        <h3>Overdue</h3>
                        <Badge variant="destructive" className="ml-auto rounded-full px-2.5">
                            {buckets.overdue.length}
                        </Badge>
                    </div>
                    {buckets.overdue.map(bill => (
                        <BillRow
                            key={bill.id}
                            bill={bill}
                            currency={currency}
                            locale={locale}
                            onMarkAsPaid={onMarkAsPaid}
                            onSkip={onSkip}
                            onDelete={onDelete}
                            onViewHistory={onViewHistory}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            {/* Due This Week Section */}
            {shouldShow('thisWeek') && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary font-bold text-base px-1">
                        <CalendarCheck className="w-5 h-5" />
                        <h3>Due Next 7 Days</h3>
                        <Badge variant="secondary" className="ml-auto rounded-full px-2.5">
                            {buckets.thisWeek.length}
                        </Badge>
                    </div>
                    {buckets.thisWeek.map(bill => (
                        <BillRow
                            key={bill.id}
                            bill={bill}
                            currency={currency}
                            locale={locale}
                            onMarkAsPaid={onMarkAsPaid}
                            onSkip={onSkip}
                            onDelete={onDelete}
                            onViewHistory={onViewHistory}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            {/* Later This Month Section */}
            {shouldShow('laterThisMonth') && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-base px-1">
                        <Calendar className="w-5 h-5" />
                        <h3>Later This Month</h3>
                        <Badge variant="outline" className="ml-auto rounded-full px-2.5">
                            {buckets.laterThisMonth.length}
                        </Badge>
                    </div>
                    {buckets.laterThisMonth.map(bill => (
                        <BillRow
                            key={bill.id}
                            bill={bill}
                            currency={currency}
                            locale={locale}
                            onMarkAsPaid={onMarkAsPaid}
                            onSkip={onSkip}
                            onDelete={onDelete}
                            onViewHistory={onViewHistory}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            {/* Upcoming Month Section */}
            {shouldShow('upcomingMonth') && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-base px-1">
                        <Calendar className="w-5 h-5" />
                        <h3>Future Billing Cycles</h3>
                        <Badge variant="outline" className="ml-auto rounded-full px-2.5">
                            {buckets.upcomingMonth.length}
                        </Badge>
                    </div>
                    {buckets.upcomingMonth.map(bill => (
                        <BillRow
                            key={bill.id}
                            bill={bill}
                            currency={currency}
                            locale={locale}
                            onMarkAsPaid={onMarkAsPaid}
                            onSkip={onSkip}
                            onDelete={onDelete}
                            onViewHistory={onViewHistory}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            {/* Completed / History Toggle Section */}
            {filteredBills.some(b => b.status === 'paid') && (
                <div className="pt-4 border-t border-border/30">
                    <button
                        type="button"
                        onClick={() => setShowAllPaid(!showAllPaid)}
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-card/40 hover:bg-card/80 transition-all font-bold text-sm text-muted-foreground hover:text-foreground border border-border/20"
                    >
                        <span>Completed Transactions ({filteredBills.filter(b => b.status === 'paid').length})</span>
                        {showAllPaid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAllPaid && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                            {filteredBills
                                .filter(b => b.status === 'paid')
                                .map(bill => (
                                    <BillRow
                                        key={bill.id}
                                        bill={bill}
                                        currency={currency}
                                        locale={locale}
                                        onMarkAsPaid={onMarkAsPaid}
                                        onSkip={onSkip}
                                        onDelete={onDelete}
                                        onViewHistory={onViewHistory}
                                        onEdit={onEdit}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {activeBills.length === 0 && (
                <div className="text-center py-16 px-4 bg-card/40 border border-border/20 rounded-3xl animate-fade-in">
                    <div className="w-16 h-16 bg-muted/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <CalendarCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">No Active Transactions Found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        {searchQuery || filterCategory !== 'all' || filterType !== 'all'
                            ? 'Try clearing your search query or filters.'
                            : 'All caught up! Add a new bill or log an income transaction to get started.'}
                    </p>
                    <div className="flex items-center justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <Button className="rounded-full font-bold px-6 h-11 shadow-md gap-2 cursor-pointer">
                                    <Plus className="w-4 h-4" /> Add New Transaction <ChevronDown className="w-4 h-4 opacity-70" />
                                </Button>
                            } />
                            <DropdownMenuContent align="center" className="w-52 p-1.5 rounded-2xl shadow-xl border-border/30">
                                <DropdownMenuItem
                                    onClick={() => onAddBill('expense')}
                                    className="rounded-xl py-2.5 font-semibold text-xs sm:text-sm cursor-pointer"
                                >
                                    <Receipt className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Add Bill / Expense
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onAddBill('income')}
                                    className="rounded-xl py-2.5 font-semibold text-xs sm:text-sm cursor-pointer"
                                >
                                    <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Add Income Earnings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
        </div>
    );
};
