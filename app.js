const { useState, useEffect } = React;

// Main App Component
function App() {
    const [bills, setBills] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: 'utilities',
        status: 'pending'
    });

    // Load bills from localStorage on mount
    useEffect(() => {
        const savedBills = localStorage.getItem('bills');
        if (savedBills) {
            setBills(JSON.parse(savedBills));
        }

        // Show welcome notification
        showNotification('Welcome to Bill Manager!', 'Track and manage your monthly bills with ease.', 'success');
    }, []);

    // Save bills to localStorage whenever they change
    useEffect(() => {
        if (bills.length > 0) {
            localStorage.setItem('bills', JSON.stringify(bills));
        }
    }, [bills]);

    // Check for upcoming bills and send notifications
    useEffect(() => {
        const checkBills = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            bills.forEach(bill => {
                if (bill.status === 'pending') {
                    const dueDate = new Date(bill.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                    if (daysUntilDue < 0) {
                        // Overdue
                        bill.status = 'overdue';
                    } else if (daysUntilDue <= 3 && daysUntilDue >= 0) {
                        // Due soon
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
    }, [bills]);

    const showNotification = (title, message, type = 'info') => {
        const id = Date.now();
        const notification = { id, title, message, type };
        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.amount || !formData.dueDate) {
            showNotification('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        const newBill = {
            id: Date.now(),
            ...formData,
            amount: parseFloat(formData.amount),
            createdAt: new Date().toISOString()
        };

        setBills(prev => [...prev, newBill]);
        showNotification('Success!', `Bill "${formData.name}" has been added.`, 'success');

        // Reset form
        setFormData({
            name: '',
            amount: '',
            dueDate: '',
            category: 'utilities',
            status: 'pending'
        });
    };

    const markAsPaid = (id) => {
        setBills(prev => prev.map(bill =>
            bill.id === id ? { ...bill, status: 'paid' } : bill
        ));
        const bill = bills.find(b => b.id === id);
        showNotification('Payment Recorded', `${bill.name} marked as paid!`, 'success');
    };

    const deleteBill = (id) => {
        const bill = bills.find(b => b.id === id);
        setBills(prev => prev.filter(bill => bill.id !== id));
        showNotification('Bill Deleted', `${bill.name} has been removed.`, 'info');
    };

    // Calculate statistics
    const stats = {
        total: bills.reduce((sum, bill) => sum + bill.amount, 0),
        paid: bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0),
        pending: bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0),
        overdue: bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + bill.amount, 0),
        count: bills.length,
        paidCount: bills.filter(b => b.status === 'paid').length,
        pendingCount: bills.filter(b => b.status === 'pending').length,
        overdueCount: bills.filter(b => b.status === 'overdue').length
    };

    return (
        <>
            <Header />
            <DashboardStats stats={stats} />
            <AddBillForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
            />
            <BillsList
                bills={bills}
                onMarkAsPaid={markAsPaid}
                onDelete={deleteBill}
            />
            <Notifications notifications={notifications} />
        </>
    );
}

// Header Component
function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">💰 Bill Manager</h1>
            <p className="app-subtitle">Track, organize, and never miss a payment</p>
        </header>
    );
}

// Dashboard Stats Component
function DashboardStats({ stats }) {
    return (
        <div className="dashboard-stats">
            <div className="stat-card">
                <div className="stat-label">Total Bills</div>
                <div className="stat-value">${stats.total.toFixed(2)}</div>
                <div className="stat-description">{stats.count} bill{stats.count !== 1 ? 's' : ''} this month</div>
            </div>
            <div className="stat-card success">
                <div className="stat-label">Paid</div>
                <div className="stat-value">${stats.paid.toFixed(2)}</div>
                <div className="stat-description">{stats.paidCount} bill{stats.paidCount !== 1 ? 's' : ''} completed</div>
            </div>
            <div className="stat-card warning">
                <div className="stat-label">Pending</div>
                <div className="stat-value">${stats.pending.toFixed(2)}</div>
                <div className="stat-description">{stats.pendingCount} bill{stats.pendingCount !== 1 ? 's' : ''} due</div>
            </div>
            <div className="stat-card danger">
                <div className="stat-label">Overdue</div>
                <div className="stat-value">${stats.overdue.toFixed(2)}</div>
                <div className="stat-description">{stats.overdueCount} bill{stats.overdueCount !== 1 ? 's' : ''} overdue</div>
            </div>
        </div>
    );
}

// Add Bill Form Component
function AddBillForm({ formData, onInputChange, onSubmit }) {
    return (
        <section className="add-bill-section">
            <h2 className="section-title">Add New Bill</h2>
            <form className="bill-form" onSubmit={onSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="bill-name">Bill Name</label>
                    <input
                        id="bill-name"
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="e.g., Electric Bill"
                        value={formData.name}
                        onChange={onInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="bill-amount">Amount ($)</label>
                    <input
                        id="bill-amount"
                        type="number"
                        name="amount"
                        className="form-input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={onInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="bill-due-date">Due Date</label>
                    <input
                        id="bill-due-date"
                        type="date"
                        name="dueDate"
                        className="form-input"
                        value={formData.dueDate}
                        onChange={onInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="bill-category">Category</label>
                    <select
                        id="bill-category"
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={onInputChange}
                    >
                        <option value="utilities">Utilities</option>
                        <option value="rent">Rent/Mortgage</option>
                        <option value="insurance">Insurance</option>
                        <option value="subscription">Subscription</option>
                        <option value="internet">Internet/Phone</option>
                        <option value="credit-card">Credit Card</option>
                        <option value="loan">Loan</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Add Bill
                    </button>
                </div>
            </form>
        </section>
    );
}

// Bills List Component
function BillsList({ bills, onMarkAsPaid, onDelete }) {
    if (bills.length === 0) {
        return (
            <section className="bills-section">
                <h2 className="section-title">Your Bills</h2>
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">No bills yet</div>
                    <p>Add your first bill to get started!</p>
                </div>
            </section>
        );
    }

    // Sort bills: overdue first, then pending, then paid
    const sortedBills = [...bills].sort((a, b) => {
        const statusOrder = { overdue: 0, pending: 1, paid: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return (
        <section className="bills-section">
            <h2 className="section-title">Your Bills</h2>
            <div className="bills-grid">
                {sortedBills.map(bill => (
                    <BillCard
                        key={bill.id}
                        bill={bill}
                        onMarkAsPaid={onMarkAsPaid}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
}

// Bill Card Component
function BillCard({ bill, onMarkAsPaid, onDelete }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysUntilDue = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const days = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        return `Due in ${days} days`;
    };

    return (
        <div className="bill-card">
            <div className="bill-header">
                <div>
                    <h3 className="bill-name">{bill.name}</h3>
                    <div className="bill-category">{bill.category}</div>
                </div>
                <span className={`bill-status status-${bill.status}`}>
                    {bill.status}
                </span>
            </div>

            <div className="bill-details">
                <div className="bill-detail-row">
                    <span className="bill-detail-label">Amount</span>
                    <span className="bill-amount">${bill.amount.toFixed(2)}</span>
                </div>
                <div className="bill-detail-row">
                    <span className="bill-detail-label">Due Date</span>
                    <span className="bill-detail-value">{formatDate(bill.dueDate)}</span>
                </div>
                {bill.status !== 'paid' && (
                    <div className="bill-detail-row">
                        <span className="bill-detail-label">Status</span>
                        <span className="bill-detail-value">{getDaysUntilDue()}</span>
                    </div>
                )}
            </div>

            <div className="bill-actions">
                {bill.status !== 'paid' && (
                    <button
                        className="btn btn-success btn-small"
                        onClick={() => onMarkAsPaid(bill.id)}
                    >
                        Mark as Paid
                    </button>
                )}
                <button
                    className="btn btn-danger btn-small"
                    onClick={() => onDelete(bill.id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

// Notifications Component
function Notifications({ notifications }) {
    if (notifications.length === 0) return null;

    return (
        <div className="notifications">
            {notifications.map(notification => (
                <div key={notification.id} className={`notification ${notification.type}`}>
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                </div>
            ))}
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
