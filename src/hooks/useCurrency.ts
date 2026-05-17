import { useState, useEffect } from 'react';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useCurrency = () => {
    const { user } = useAuth();
    const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
    const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);

    // Load settings from localStorage and Firebase on mount or user change
    useEffect(() => {
        const loadSettings = async () => {
            let savedCurrency = localStorage.getItem('currency');
            let savedLocale = localStorage.getItem('locale');

            if (user) {
                try {
                    const docRef = doc(db, 'userSettings', user.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.currency) {
                            savedCurrency = data.currency;
                            localStorage.setItem('currency', data.currency);
                        }
                        if (data.locale) {
                            savedLocale = data.locale;
                            localStorage.setItem('locale', data.locale);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching currency settings from Firebase:', error);
                }
            }

            if (savedCurrency) setCurrency(savedCurrency);
            if (savedLocale) setLocale(savedLocale);
        };

        loadSettings();
    }, [user]);

    const updateCurrency = async (newCurrency: string) => {
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
        if (user) {
            try {
                const docRef = doc(db, 'userSettings', user.id);
                await setDoc(docRef, { currency: newCurrency }, { merge: true });
            } catch (error) {
                console.error('Error saving currency to Firebase:', error);
            }
        }
    };

    const updateLocale = async (newLocale: string) => {
        setLocale(newLocale);
        localStorage.setItem('locale', newLocale);
        if (user) {
            try {
                const docRef = doc(db, 'userSettings', user.id);
                await setDoc(docRef, { locale: newLocale }, { merge: true });
            } catch (error) {
                console.error('Error saving locale to Firebase:', error);
            }
        }
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
