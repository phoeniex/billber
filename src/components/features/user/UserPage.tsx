import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CURRENCIES, NUMBER_FORMATS } from '@/utils/constants';
import { User, LogOut, LogIn, DollarSign, Globe, Sun, Moon, Laptop, ShieldCheck, Database, Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface UserPageProps {
    isOpen: boolean;
    onClose: () => void;
    currency: string;
    locale: string;
    theme: 'light' | 'dark' | 'system';
    onCurrencyChange: (currency: string) => void;
    onLocaleChange: (locale: string) => void;
    onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
    onOpenAuthModal: () => void;
    totalBillsCount: number;
}

export const UserPage = ({
    isOpen,
    onClose,
    currency,
    locale,
    theme,
    onCurrencyChange,
    onLocaleChange,
    onThemeChange,
    onOpenAuthModal,
    totalBillsCount
}: UserPageProps) => {
    const { user, isAuthenticated, isFirebase, logout } = useAuth();
    const [savedNotice, setSavedNotice] = useState(false);

    const triggerNotice = () => {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    const activeCurrencyObj = CURRENCIES.find(c => c.symbol === currency || c.code === currency) || CURRENCIES[0];
    const activeLocaleObj = NUMBER_FORMATS.find(f => f.id === locale) || NUMBER_FORMATS[0];

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent>
                {/* Fixed Sticky Header */}
                <SheetHeader className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/20 px-6 lg:px-10 py-5 flex flex-row items-center justify-between shrink-0 mb-0">
                    <div>
                        <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Account &amp; Settings
                        </SheetTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage your profile, storage preferences, and visual display options.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {savedNotice && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-fade-in gap-1.5 px-3 py-1 shrink-0">
                                <Check className="w-3.5 h-3.5" /> Settings Saved
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full w-10 h-10 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center border border-border/30 shadow-xs cursor-pointer"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </SheetHeader>

                {/* Scrollable Body Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Profile Overview Card */}
                        <div className="bg-card/90 backdrop-blur-md border border-border/30 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-md" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-xl font-bold">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={30} />}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold tracking-tight">
                                                {isAuthenticated ? user?.name : 'Guest User'}
                                            </h3>
                                            <Badge variant={isFirebase ? 'default' : 'secondary'} className="capitalize text-xs">
                                                {isFirebase ? 'Cloud Synced' : 'Local Mode'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {isAuthenticated ? user?.email : 'Sign in to sync your bills across devices'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {isAuthenticated ? (
                                        <Button
                                            variant="destructive"
                                            onClick={logout}
                                            className="gap-2 w-full sm:w-auto rounded-xl text-xs h-10"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                onClose();
                                                onOpenAuthModal();
                                            }}
                                            className="gap-2 w-full sm:w-auto rounded-xl shadow-md text-xs h-10"
                                        >
                                            <LogIn className="w-4 h-4" /> Sign In / Sign Up
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/30">
                                <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/20">
                                    <p className="text-[11px] text-muted-foreground mb-0.5">Tracked Bills</p>
                                    <p className="text-base font-bold">{totalBillsCount} Bills</p>
                                </div>
                                <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/20">
                                    <p className="text-[11px] text-muted-foreground mb-0.5">Active Currency</p>
                                    <p className="text-base font-bold">{activeCurrencyObj.symbol} ({activeCurrencyObj.code})</p>
                                </div>
                                <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/20 col-span-2 sm:col-span-1">
                                    <p className="text-[11px] text-muted-foreground mb-0.5">Storage Mode</p>
                                    <p className="text-base font-bold">{isFirebase ? 'Firestore Cloud' : 'Browser Storage'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Application Settings Card */}
                        <div className="bg-card/90 backdrop-blur-md border border-border/30 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Preferences &amp; Settings</h3>
                                    <p className="text-xs text-muted-foreground">Customize your app theme, currency formatting, and regional display settings.</p>
                                </div>
                            </div>

                            <Separator />

                            {/* App Theme */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
                                <div className="md:w-1/2 lg:w-5/12">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : theme === 'light' ? <Sun className="w-4 h-4 text-primary" /> : <Laptop className="w-4 h-4 text-primary" />}
                                        App Theme
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Select dark, light, or automatic system appearance.
                                    </p>
                                </div>

                                <div className="md:w-1/2 lg:w-7/12 grid grid-cols-3 gap-3">
                                    {(['dark', 'light', 'system'] as const).map((t) => (
                                        <Button
                                            key={t}
                                            onClick={() => { onThemeChange(t); triggerNotice(); }}
                                            variant={theme === t ? 'default' : 'outline'}
                                            className={cn(
                                                "h-16 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300",
                                                theme === t ? "shadow-md scale-[1.02]" : "hover:bg-muted/50"
                                            )}
                                        >
                                            {t === 'dark' && <Moon className="w-4 h-4" />}
                                            {t === 'light' && <Sun className="w-4 h-4" />}
                                            {t === 'system' && <Laptop className="w-4 h-4" />}
                                            <span className="text-xs font-medium capitalize">{t}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Currency Symbol */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
                                <div className="md:w-1/2 lg:w-5/12">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        Currency Symbol
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Choose the currency symbol used to display all bill amounts.
                                    </p>
                                </div>

                                <div className="md:w-1/2 lg:w-7/12">
                                    <Select
                                        value={activeCurrencyObj.code}
                                        onValueChange={(codeVal) => {
                                            const found = CURRENCIES.find(c => c.code === codeVal);
                                            if (found) {
                                                onCurrencyChange(found.symbol);
                                                triggerNotice();
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-12 w-full rounded-2xl bg-muted/40 border-border/40 px-4 text-sm font-medium">
                                            <SelectValue>
                                                <span className="font-semibold mr-1.5">{activeCurrencyObj.symbol}</span> — {activeCurrencyObj.name} ({activeCurrencyObj.code})
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-64 w-[var(--anchor-width)] min-w-[300px]">
                                            {CURRENCIES.map((curr) => (
                                                <SelectItem key={curr.code} value={curr.code} className="py-2.5 px-3 text-xs">
                                                    <div className="flex items-center justify-between w-full gap-4">
                                                        <span className="font-medium">{curr.name}</span>
                                                        <span className="text-muted-foreground font-mono">{curr.symbol} ({curr.code})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            {/* Regional Number Format */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
                                <div className="md:w-1/2 lg:w-5/12">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" />
                                        Regional Format &amp; Numbers
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Select your preferred region for number and decimal formatting.
                                    </p>
                                </div>

                                <div className="md:w-1/2 lg:w-7/12">
                                    <Select
                                        value={activeLocaleObj.id}
                                        onValueChange={(val) => {
                                            if (val) {
                                                onLocaleChange(val);
                                                triggerNotice();
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-12 w-full rounded-2xl bg-muted/40 border-border/40 px-4 text-sm font-medium">
                                            <SelectValue>
                                                <span className="font-semibold mr-1.5">{activeLocaleObj.label}</span> ({activeLocaleObj.id})
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-64 w-[var(--anchor-width)] min-w-[300px]">
                                            {NUMBER_FORMATS.map((fmt) => (
                                                <SelectItem key={fmt.id} value={fmt.id} className="py-2.5 px-3 text-xs">
                                                    <div className="flex items-center justify-between w-full gap-4">
                                                        <span className="font-medium">{fmt.label} ({fmt.id})</span>
                                                        <span className="text-muted-foreground font-mono">Ex: {fmt.example}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            {/* Security & Data Storage Info */}
                            <div className="p-4 bg-muted/30 rounded-2xl border border-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium">Data Storage Security</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {isFirebase ? 'Your data is secured in your Firebase Cloud Firestore collection.' : 'Your data is saved locally in browser storage.'}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="shrink-0 gap-1 text-[11px]">
                                    <Database className="w-3 h-3" /> {isFirebase ? 'Firestore Active' : 'LocalStorage Active'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
