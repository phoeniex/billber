import { Settings, Wallet, Plus } from 'lucide-react';

interface HeaderProps {
    onOpenSettings: () => void;
    onAddBill: () => void;
}

export const Header = ({ onOpenSettings, onAddBill }: HeaderProps) => {
    return (
        <header className="mb-12 py-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex-1"></div>
                <h1 className="text-6xl font-bold gradient-text flex items-center justify-center gap-4 flex-1">
                    <Wallet className="w-16 h-16" />
                    Billber
                </h1>
                <div className="flex-1 flex justify-end gap-2">
                    <button
                        onClick={onAddBill}
                        className="btn btn-primary btn-circle shadow-lg hover:scale-110 transition-transform"
                        title="Add New Bill"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onOpenSettings}
                        className="btn btn-ghost btn-circle"
                        title="Settings"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <p className="text-xl text-base-content/70 font-light text-center">
                Track, organize, and never miss a payment
            </p>
        </header>
    );
};
