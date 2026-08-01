export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'US' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: 'EU' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'JP' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'CN' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'IN' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: 'CA' },
    { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: 'AU' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: 'KR' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: 'BR' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: 'TH' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: 'VN' },
];

export const DEFAULT_CURRENCY = '$';
export const DEFAULT_LOCALE = 'en-US';

export const NUMBER_FORMATS = [
    { id: 'en-US', label: 'United States', example: '1,234.56', flag: 'US' },
    { id: 'de-DE', label: 'Germany / EU', example: '1.234,56', flag: 'DE' },
    { id: 'es-ES', label: 'Spain', example: '1.234,56', flag: 'ES' },
    { id: 'fr-FR', label: 'France', example: '1 234,56', flag: 'FR' },
    { id: 'en-IN', label: 'India', example: '1,23,456.56', flag: 'IN' },
    { id: 'id-ID', label: 'Indonesia', example: '1.234,56', flag: 'ID' },
    { id: 'th-TH', label: 'Thailand', example: '1,234.56', flag: 'TH' },
    { id: 'vn-VN', label: 'Vietnam', example: '1.234,56', flag: 'VN' },
    { id: 'pt-BR', label: 'Brazil', example: '1.234,56', flag: 'BR' },
];

export const DUE_SOON_OPTIONS = [
    { value: 0, label: 'Today (0 days)' },
    { value: 1, label: 'Tomorrow (1 day)' },
    { value: 3, label: '3 Days' },
    { value: 7, label: '1 Week' },
    { value: 14, label: '2 Weeks' },
    { value: 30, label: '1 Month' },
];

export const INCOME_CATEGORIES = [
    { value: 'salary', label: 'Salary & Wage', icon: 'Briefcase' },
    { value: 'freelance', label: 'Freelance & Side Gig', icon: 'Laptop' },
    { value: 'investment', label: 'Investment & Dividends', icon: 'TrendingUp' },
    { value: 'business', label: 'Business Income', icon: 'Landmark' },
    { value: 'gift', label: 'Gift & Bonus', icon: 'Gift' },
    { value: 'refund', label: 'Refund & Cash Back', icon: 'Coins' },
    { value: 'other', label: 'Other Income', icon: 'Banknote' },
];

export const BILL_ICONS = [
    // Utilities & Home
    { id: 'Zap', label: 'Electric' },
    { id: 'Wifi', label: 'Internet' },
    { id: 'Home', label: 'Housing' },
    { id: 'Droplet', label: 'Water' },
    { id: 'Trash', label: 'Waste' },
    { id: 'Thermometer', label: 'Heat/AC' },

    // Tech & Media
    { id: 'Smartphone', label: 'Phone' },
    { id: 'Tv', label: 'Media' },
    { id: 'Music', label: 'Music' },
    { id: 'Monitor', label: 'Software' },
    { id: 'Gamepad2', label: 'Gaming' },
    { id: 'Cloud', label: 'Storage' },

    // Finance & Income
    { id: 'Briefcase', label: 'Salary' },
    { id: 'Laptop', label: 'Freelance' },
    { id: 'TrendingUp', label: 'Investment' },
    { id: 'Landmark', label: 'Business' },
    { id: 'Gift', label: 'Bonus' },
    { id: 'Coins', label: 'Refund' },
    { id: 'Banknote', label: 'Cash In' },
    { id: 'CreditCard', label: 'Card' },
    { id: 'Shield', label: 'Insurance' },

    // Transport & Auto
    { id: 'Car', label: 'Car' },
    { id: 'Bus', label: 'Bus' },
    { id: 'Train', label: 'Train' },
    { id: 'Plane', label: 'Travel' },
    { id: 'Fuel', label: 'Gas' },

    // Lifestyle & Shopping
    { id: 'Heart', label: 'Health' },
    { id: 'Dumbbell', label: 'Gym' },
    { id: 'Utensils', label: 'Food font' },
    { id: 'Coffee', label: 'Cafe' },
    { id: 'ShoppingBag', label: 'Shopping' },

    // General
    { id: 'FileText', label: 'General' },
    { id: 'Tag', label: 'Other' },
];
