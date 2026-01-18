import { CURRENCIES, NUMBER_FORMATS } from '@/utils/constants';
import { Settings, X, DollarSign, CheckCircle, Globe, Sun, Moon, Laptop } from 'lucide-react';


interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    currency: string;
    locale: string;
    theme: 'light' | 'dark' | 'system';
    onCurrencyChange: (currency: string) => void;
    onLocaleChange: (locale: string) => void;
    onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const SettingsModal = ({
    show, onClose, currency, locale, theme,
    onCurrencyChange, onLocaleChange, onThemeChange
}: SettingsModalProps) => {
    if (!show) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-base-100 z-10 py-2">
                    <h3 className="font-bold text-3xl flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Settings
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-circle"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Section 0: Theme */}
                <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                        App Theme
                    </h4>
                    <p className="text-base-content/60 mb-4">
                        Switch between dark, light, or system mode.
                    </p>

                    <div className="join w-full">
                        <button
                            onClick={() => onThemeChange('dark')}
                            className={`btn join-item flex-1 ${theme === 'dark' ? 'btn-primary' : 'btn-outline border-base-300'}`}
                        >
                            <Moon className="w-4 h-4 mr-1" /> Dark
                        </button>
                        <button
                            onClick={() => onThemeChange('light')}
                            className={`btn join-item flex-1 ${theme === 'light' ? 'btn-primary' : 'btn-outline border-base-300'}`}
                        >
                            <Sun className="w-4 h-4 mr-1" /> Light
                        </button>
                        <button
                            onClick={() => onThemeChange('system')}
                            className={`btn join-item flex-1 ${theme === 'system' ? 'btn-primary' : 'btn-outline border-base-300'}`}
                        >
                            <Laptop className="w-4 h-4 mr-1" /> System
                        </button>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Section 1: Currency Symbol */}
                <div className="mb-8">
                    <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Currency Symbol
                    </h4>
                    <p className="text-base-content/60 mb-4">
                        Choose the currency symbol to display ($ or € or ...).
                    </p>

                    <select
                        className="select select-bordered w-full"
                        value={currency}
                        onChange={(e) => onCurrencyChange(e.target.value)}
                    >
                        {CURRENCIES.map((curr) => (
                            <option key={curr.code} value={curr.symbol}>
                                {curr.name} ({curr.symbol}) - {curr.code}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="divider"></div>

                {/* Section 2: Regional Format */}
                <div className="mb-6">
                    <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Region & Number Format
                    </h4>
                    <p className="text-base-content/60 mb-4">
                        Select your region to format numbers (e.g. 1,000.00 vs 1.000,00).
                    </p>

                    <select
                        className="select select-bordered w-full"
                        value={locale}
                        onChange={(e) => onLocaleChange(e.target.value)}
                    >
                        {NUMBER_FORMATS.map((fmt) => (
                            <option key={fmt.id} value={fmt.id}>
                                {fmt.label} (Example: {fmt.example})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="modal-action border-t border-base-300 pt-4 sticky bottom-0 bg-base-100 pb-2">
                    <button onClick={onClose} className="btn btn-primary px-8">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Done
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div >
    );
};
