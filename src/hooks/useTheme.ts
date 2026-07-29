import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
    const { user } = useAuth();
    const [theme, setTheme] = useState<Theme>('system');

    useEffect(() => {
        const loadTheme = async () => {
            let savedTheme = localStorage.getItem('theme') as Theme;

            if (user && isFirebaseConfigured && db) {
                try {
                    const docRef = doc(db, 'userSettings', user.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().theme) {
                        savedTheme = docSnap.data().theme as Theme;
                        localStorage.setItem('theme', savedTheme);
                    }
                } catch (error) {
                    console.error('Error fetching theme from Firebase:', error);
                }
            }

            if (savedTheme) {
                setTheme(savedTheme);
            }
        };

        loadTheme();
    }, [user]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (currentTheme: Theme) => {
            const root = document.documentElement;
            if (currentTheme === 'system') {
                const isDark = mediaQuery.matches;
                root.classList.toggle('dark', isDark);
            } else {
                root.classList.toggle('dark', currentTheme === 'dark');
            }
        };

        applyTheme(theme);

        const handleSystemChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);

        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [theme]);

    const toggleTheme = async (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (user && isFirebaseConfigured && db) {
            try {
                const docRef = doc(db, 'userSettings', user.id);
                await setDoc(docRef, { theme: newTheme }, { merge: true });
            } catch (error) {
                console.error('Error saving theme to Firebase:', error);
            }
        }
    };

    return {
        theme,
        toggleTheme
    };
};
