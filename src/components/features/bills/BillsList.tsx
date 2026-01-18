import { useState } from 'react';
import { Bill } from '@/types';
import { BillRow } from './BillRow';
import { AlertCircle, CalendarCheck, Calendar, Plus, Settings, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

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
    onOpenSettings: () => void;
}

export const BillsList = ({
    bills, currency, locale,
    onMarkAsPaid, onSkip, onDelete, onViewHistory,
    onAddBill, onEdit, onOpenSettings
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
                        <button
                            onClick={onAddBill}
                            className="btn btn-primary btn-sm rounded-full px-4 shadow-md font-bold text-white transition-transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Bill
                        </button>
                        <button
                            onClick={onOpenSettings}
                            className="btn btn-circle btn-ghost btn-sm"
                            title="Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                        <input
                            type="text"
                            placeholder="Search bills..."
                            className="input input-sm input-bordered w-full pl-9 rounded-full bg-base-100/50 focus:bg-base-100 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="indicator">
                        {filterCategory !== 'all' && (
                            <span className="indicator-item badge badge-primary badge-xs border-2 border-base-100"></span>
                        )}
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`btn btn-sm btn-circle ${showFilter ? 'btn-primary text-white shadow-md' : 'btn-ghost bg-base-100/50'}`}
                            title="Toggle Filter Categories"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {showFilter && (
                    <div className="filter flex flex-wrap gap-1 animate-fade-in mt-1">
                        <input
                            type="radio"
                            name="category-filter"
                            className="btn btn-xs filter-reset"
                            aria-label="All Categories"
                            checked={filterCategory === 'all'}
                            onChange={() => setFilterCategory('all')}
                        />
                        {['utilities', 'rent', 'insurance', 'subscription', 'internet', 'credit-card', 'loan', 'other'].map(cat => (
                            <input
                                key={cat}
                                type="radio"
                                name="category-filter"
                                className="btn btn-xs"
                                aria-label={cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                checked={filterCategory === cat}
                                onChange={() => setFilterCategory(cat)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {bills.length === 0 ? (
                <div className="py-12 text-center opacity-50">
                    <h2 className="text-xl font-bold mb-4">No Bills Yet</h2>
                    <p className="mb-4 text-sm">Add your first bill to get started.</p>
                </div>
            ) : (
                <>
                    {activeBills.length === 0 && !searchQuery && filterCategory === 'all' && (
                        <div className="py-8 text-center opacity-60">
                            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-success" />
                            <h3 className="text-xl font-bold mb-1">All Caught Up!</h3>
                            <p className="text-sm">No pending bills matching your criteria.</p>
                        </div>
                    )}

                    {shouldShow('overdue') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-error flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5" /> Overdue
                                <span className={`badge badge-sm text-white ${buckets.overdue.length > 0 ? 'badge-error' : 'badge-ghost opacity-50'}`}>{buckets.overdue.length}</span>
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
                                    <div className="text-sm opacity-30 italic px-2">No matching overdue bills</div>
                                )}
                            </div>
                        </div>
                    )}

                    {shouldShow('thisWeek') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5" /> This week
                                <span className={`badge badge-sm ${buckets.thisWeek.length > 0 ? 'badge-primary' : 'badge-ghost opacity-50 hidden'}`}>{buckets.thisWeek.length}</span>
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
                                    <div className="text-sm opacity-30 italic px-2">No matching bills this week</div>
                                )}
                            </div>
                        </div>
                    )}

                    {shouldShow('laterThisMonth') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold opacity-60 flex items-center gap-2 mb-4">
                                <CalendarCheck className="w-5 h-5" /> Later this month
                                <span className={`badge badge-sm ${buckets.laterThisMonth.length > 0 ? 'badge-ghost' : 'badge-ghost opacity-30 hidden'}`}>{buckets.laterThisMonth.length}</span>
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
                                    <div className="text-sm opacity-30 italic px-2">No matching bills later this month</div>
                                )}
                            </div>
                        </div>
                    )}

                    {shouldShow('upcomingMonth') && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold opacity-60 flex items-center gap-2 mb-4">
                                <CalendarCheck className="w-5 h-5" /> Upcoming month
                                <span className={`badge badge-sm ${buckets.upcomingMonth.length > 0 ? 'badge-ghost' : 'badge-ghost opacity-30 hidden'}`}>{buckets.upcomingMonth.length}</span>
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
                                    <div className="text-sm opacity-30 italic px-2">No matching bills upcoming month</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Display paid one-time bills */}
                    {filteredBills.filter(b => b.status === 'paid' && b.frequency === 'one-time').length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-base-200">
                            <button
                                onClick={() => setShowAllPaid(!showAllPaid)}
                                className="flex items-center justify-between w-full text-left group"
                            >
                                <h3 className="text-lg font-bold opacity-40 group-hover:opacity-60 transition-opacity flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5" /> All Paid
                                    <span className="badge badge-ghost badge-sm">
                                        {filteredBills.filter(b => b.status === 'paid' && b.frequency === 'one-time').length}
                                    </span>
                                </h3>
                                {showAllPaid ? (
                                    <ChevronDown className="w-5 h-5 opacity-40 group-hover:opacity-60 transition-opacity" />
                                ) : (
                                    <ChevronUp className="w-5 h-5 opacity-40 group-hover:opacity-60 transition-opacity" />
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
