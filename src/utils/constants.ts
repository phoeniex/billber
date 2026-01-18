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

    // Finance & Services
    { id: 'CreditCard', label: 'Card' },
    { id: 'Shield', label: 'Insurance' },
    { id: 'Lock', label: 'Security' },
    { id: 'Wrench', label: 'Service' },
    { id: 'Briefcase', label: 'Business' },
    { id: 'Landmark', label: 'Tax/Bank' },

    // Transport
    { id: 'Car', label: 'Car' },
    { id: 'Bus', label: 'Bus' },
    { id: 'Train', label: 'Train' },
    { id: 'Bike', label: 'Bike' },
    { id: 'Plane', label: 'Travel' },
    { id: 'Map', label: 'Trip' },

    // Health & Lifestyle
    { id: 'Heart', label: 'Health' },
    { id: 'Dumbbell', label: 'Gym' },
    { id: 'Stethoscope', label: 'Medical' },
    { id: 'Utensils', label: 'Food' },
    { id: 'Coffee', label: 'Cafe' },
    { id: 'ShoppingBag', label: 'Shopping' },

    // Education & Kids
    { id: 'Book', label: 'Education' },
    { id: 'GraduationCap', label: 'Tuition' },
    { id: 'Baby', label: 'Childcare' },
    { id: 'Palette', label: 'Hobbies' },

    // Clothing & Gifts
    { id: 'Shirt', label: 'Clothing' },
    { id: 'Watch', label: 'Luxury' },
    { id: 'Gift', label: 'Gift' },
    { id: 'Scissors', label: 'Salon' },

    // General
    { id: 'FileText', label: 'General' },
    { id: 'Tag', label: 'Other' },

    // Home & Living
    { id: 'PawPrint', label: 'Pets' },
    { id: 'Hammer', label: 'Repair' },
    { id: 'Sofa', label: 'Furniture' },
    { id: 'Leaf', label: 'Garden' },

    // Transport & Auto
    { id: 'Fuel', label: 'Gas' },
    { id: 'Truck', label: 'Delivery' },
    { id: 'Package', label: 'Shipping' },

    // Finance & Office
    { id: 'Coins', label: 'Savings' },
    { id: 'Banknote', label: 'Cash' },
    { id: 'Wallet', label: 'Personal' },
    { id: 'Printer', label: 'Office' },
    { id: 'Plug', label: 'Electronics' },

    // Entertainment
    { id: 'Ticket', label: 'Events' },
    { id: 'Film', label: 'Movies' },
];
