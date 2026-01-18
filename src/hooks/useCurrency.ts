import { useState, useEffect } from 'react';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/utils/constants';

export const useCurrency = () => {
    const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
    const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency');
        if (savedCurrency) {
            setCurrency(savedCurrency);
        }

        const savedLocale = localStorage.getItem('locale');
        if (savedLocale) {
            setLocale(savedLocale);
        }
    }, []);

    const updateCurrency = (newCurrency: string) => {
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
    };

    const updateLocale = (newLocale: string) => {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const formatAmount = (amount: number) => {
        try {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch (e) {
            return amount.toFixed(2);
        }
    };

    return {
        currency,
        locale,
        updateCurrency,
        updateLocale,
        formatAmount
    };
};
