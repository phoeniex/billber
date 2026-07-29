import { useState } from 'react';
import { Bill } from '@/types';
import { BillRow } from './BillRow';
import { AlertCircle, CalendarCheck, Calendar, Plus, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BillsListProps {
    bills: Bill[];
    currency: string;
    locale: string;
    onMarkAsPaid: (id: string) => void;
    onSkip: (id: string) => void;
    onDelete: (id: string) => void;
    onViewHistory: (bill: Bill) => void;
    onAddBill: () => void;
    onEdit: (bill: Bill) => void;
}

const CATEGORIES = ['utilities', 'rent', 'insurance', 'subscription', 'internet', 'credit-card', 'loan', 'other'];

export const BillsList = ({
    bills, currency, locale,
    onMarkAsPaid, onSkip, onDelete, onViewHistory,
    onAddBill, onEdit
}: BillsListProps) => {

    const [showAllPaid, setShowAllPaid] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showFilter, setShowFilter] = useState(false);

    const filteredBills = bills.filter(b =>
        (filterCategory === 'all' || b.category === filterCategory) &&
        (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
        if (searchQuery || filterCategory !== 'all') return allBuckets[type].length > 0;
        return buckets[type].length > 0;
    };

    return (
        <div className="space-y-8 animate-fade-in pl-0 lg:pl-6">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primary">Upcoming Bills</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={onAddBill}
                            className="rounded-full h-10 px-5 shadow-md font-bold text-sm transition-transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4 mr-1.5" /> Add Bill
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search bills..."
                            className="pl-9 rounded-full bg-card/50 focus:bg-card transition-colors h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        {filterCategory !== 'all' && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background z-10" />
                        )}
                        <Button
                            onClick={() => setShowFilter(!showFilter)}
                            size="icon"
                            variant={showFilter ? 'default' : 'ghost'}
                            className="rounded-full h-10 w-10"
                            title="Toggle Filter"
                        >
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {showFilter && (
                    <div className="flex flex-wrap gap-1.5 animate-fade-in mt-1">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={cn(
                                'text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200',
                                filterCategory === 'all'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={cn(
                                    'text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-all duration-200',
                                    filterCategory === cat
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                            >
                                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {bills.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    <h2 className="text-xl font-bold mb-4">No Bills Yet</h2>
                    <p className="mb-4 text-sm">Add your first bill to get started.</p>
                </div>
            ) : (
                <>
                    {activeBills.length === 0 && !searchQuery && filterCategory === 'all' && (
                        <div className="py-8 text-center text-muted-foreground">
                            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-[color:var(--success)]" />
                            <h3 className="text-xl font-bold mb-1">All Caught Up!</h3>
                            <p className="text-sm">No pending bills matching your criteria.</p>
                        </div>
                    )}

                    {shouldShow('overdue') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-destructive flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5" /> Overdue
                                <Badge variant="destructive" className="text-xs">
                                    {buckets.overdue.length}
                                </Badge>
                            </h3>
                            <div className="space-y-2">
                                {buckets.overdue.length > 0 ? buckets.overdue.map(bill => (
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
                                )) : (
                                    <div className="text-sm text-muted-foreground italic px-2">No matching overdue bills</div>
                                )}
                            </div>
                        </div>
                    )}

                    {shouldShow('thisWeek') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5" /> This week
                                {buckets.thisWeek.length > 0 && (
                                    <Badge className="text-xs">{buckets.thisWeek.length}</Badge>
                                )}
                            </h3>
                            <div className="space-y-2">
                                {buckets.thisWeek.length > 0 ? buckets.thisWeek.map(bill => (
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
                                )) : (
                                    <div className="text-sm text-muted-foreground italic px-2">No matching bills this week</div>
                                )}
                            </div>
                        </div>
                    )}

                    {shouldShow('laterThisMonth') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-muted-foreground flex items-center gap-2 mb-4">
                                <CalendarCheck className="w-5 h-5" /> Later this month
                                {buckets.laterThisMonth.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">{buckets.laterThisMonth.length}</Badge>
                                )}
                            </h3>
                            <div className="space-y-2">
                                {buckets.laterThisMonth.length > 0 ? buckets.laterThisMonth.map(bill => (
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
                                )) : (
                                    <div className="text-sm text-muted-foreground italic px-2">No matching bills later this month</div>
                                )}
                            </div>
                        </div>
                    )}

                    {shouldShow('upcomingMonth') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-muted-foreground flex items-center gap-2 mb-4">
                                <CalendarCheck className="w-5 h-5" /> Upcoming month
                                {buckets.upcomingMonth.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">{buckets.upcomingMonth.length}</Badge>
                                )}
                            </h3>
                            <div className="space-y-2">
                                {buckets.upcomingMonth.length > 0 ? buckets.upcomingMonth.map(bill => (
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
                                )) : (
                                    <div className="text-sm text-muted-foreground italic px-2">No matching bills upcoming month</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Display paid one-time bills */}
                    {filteredBills.filter(b => b.status === 'paid' && b.frequency === 'one-time').length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-border">
                            <button
                                onClick={() => setShowAllPaid(!showAllPaid)}
                                className="flex items-center justify-between w-full text-left group"
                            >
                                <h3 className="text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5" /> All Paid
                                    <Badge variant="outline" className="text-xs">
                                        {filteredBills.filter(b => b.status === 'paid' && b.frequency === 'one-time').length}
                                    </Badge>
                                </h3>
                                {showAllPaid ? (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                ) : (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                            </button>

                            {showAllPaid && (
                                <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity animate-fade-in">
                                    {filteredBills.filter(b => b.status === 'paid' && b.frequency === 'one-time')
                                        .sort((a, b) => new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime())
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
                </>
            )}
        </div>
    );
};
