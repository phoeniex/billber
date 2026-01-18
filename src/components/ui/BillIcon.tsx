import {
    Zap, Wifi, Home, Smartphone, Tv, CreditCard, Droplet, Car, Music,
    ShoppingBag, Shield, FileText, Trash, Thermometer, Monitor, Gamepad2,
    Cloud, Lock, Wrench, Briefcase, Landmark, Bus, Train, Bike, Plane,
    Map as MapIcon, Heart, Dumbbell, Stethoscope, Utensils, Coffee, Book,
    GraduationCap, Baby, Palette, Shirt, Watch, Gift, Scissors, Tag,
    PawPrint, Hammer, Sofa, Fuel, Ticket, Film, Coins, Banknote, Wallet,
    Package, Truck, Printer, Plug, Leaf
} from 'lucide-react';

interface BillIconProps {
    icon: string;
    className?: string;
}

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap, Wifi, Home, Smartphone, Tv, CreditCard, Droplet, Car, Music,
    ShoppingBag, Shield, FileText, Trash, Thermometer, Monitor, Gamepad2,
    Cloud, Lock, Wrench, Briefcase, Landmark, Bus, Train, Bike, Plane,
    Map: MapIcon, Heart, Dumbbell, Stethoscope, Utensils, Coffee, Book,
    GraduationCap, Baby, Palette, Shirt, Watch, Gift, Scissors, Tag,
    PawPrint, Hammer, Sofa, Fuel, Ticket, Film, Coins, Banknote, Wallet,
    Package, Truck, Printer, Plug, Leaf
};

export const BillIcon = ({ icon, className = "w-6 h-6" }: BillIconProps) => {
    const IconComponent = icons[icon] || FileText;
    return <IconComponent className={className} />;
};
