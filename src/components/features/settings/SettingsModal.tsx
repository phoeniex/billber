import { CURRENCIES, NUMBER_FORMATS } from '@/utils/constants';
import { Settings, DollarSign, CheckCircle, Globe, Sun, Moon, Laptop } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Settings
                    </DialogTitle>
                </DialogHeader>

                {/* Theme */}
                <div className="mb-6">
                    <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                        App Theme
                    </h4>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Switch between dark, light, or system mode.
                    </p>
                    <div className="flex gap-2">
                        {(['dark', 'light', 'system'] as const).map((t) => (
                            <Button
                                key={t}
                                onClick={() => onThemeChange(t)}
                                variant={theme === t ? 'default' : 'outline'}
                                className="flex-1"
                            >
                                {t === 'dark' && <Moon className="w-4 h-4 mr-1.5" />}
                                {t === 'light' && <Sun className="w-4 h-4 mr-1.5" />}
                                {t === 'system' && <Laptop className="w-4 h-4 mr-1.5" />}
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Currency */}
                <div className="mb-6 mt-4">
                    <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Currency Symbol
                    </h4>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Choose the currency symbol to display ($ or € or ...).
                    </p>
                    <Select value={currency} onValueChange={(val) => val && onCurrencyChange(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((curr) => (
                                <SelectItem key={curr.code} value={curr.symbol}>
                                    {curr.name} ({curr.symbol}) - {curr.code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Regional Format */}
                <div className="mb-4 mt-4">
                    <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Region &amp; Number Format
                    </h4>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Select your region to format numbers (e.g. 1,000.00 vs 1.000,00).
                    </p>
                    <Select value={locale} onValueChange={(val) => val && onLocaleChange(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {NUMBER_FORMATS.map((fmt) => (
                                <SelectItem key={fmt.id} value={fmt.id}>
                                    {fmt.label} (Example: {fmt.example})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end border-t border-border pt-4">
                    <Button onClick={onClose} className="px-8">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
