import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, appleProvider, isFirebaseConfigured } from '@/lib/firebase';

interface User {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isFirebase: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    googleLogin: () => Promise<void>;
    appleLogin: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseConfigured && auth) {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
                if (firebaseUser) {
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                        photoURL: firebaseUser.photoURL || undefined,
                    });
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            // LocalStorage Demo Fallback Mode
            const savedDemoUser = localStorage.getItem('demo_user');
            if (savedDemoUser) {
                try {
                    setUser(JSON.parse(savedDemoUser));
                } catch {
                    setUser({ id: 'demo-user', email: 'demo@billber.app', name: 'Demo User' });
                }
            } else {
                const defaultUser = { id: 'demo-user', email: 'demo@billber.app', name: 'Demo User' };
                setUser(defaultUser);
                localStorage.setItem('demo_user', JSON.stringify(defaultUser));
            }
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        if (isFirebaseConfigured && auth) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            const demoUser = {
                id: 'demo-user',
                email: email || 'demo@billber.app',
                name: email ? email.split('@')[0] : 'Demo User',
            };
            setUser(demoUser);
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        if (isFirebaseConfigured && auth) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: name
                });
                setUser(prev => prev ? { ...prev, name } : null);
            }
        } else {
            const demoUser = {
                id: 'demo-user',
                email: email || 'demo@billber.app',
                name: name || 'Demo User',
            };
            setUser(demoUser);
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
        }
    };

    const googleLogin = async () => {
        if (isFirebaseConfigured && auth) {
            await signInWithPopup(auth, googleProvider);
        } else {
            const demoUser = {
                id: 'demo-user',
                email: 'google.user@billber.app',
                name: 'Google User',
            };
            setUser(demoUser);
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
        }
    };

    const appleLogin = async () => {
        if (isFirebaseConfigured && auth) {
            await signInWithPopup(auth, appleProvider);
        } else {
            const demoUser = {
                id: 'demo-user',
                email: 'apple.user@billber.app',
                name: 'Apple User',
            };
            setUser(demoUser);
            localStorage.setItem('demo_user', JSON.stringify(demoUser));
        }
    };

    const logout = async () => {
        if (isFirebaseConfigured && auth) {
            await signOut(auth);
        } else {
            localStorage.removeItem('demo_user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                isFirebase: isFirebaseConfigured,
                login,
                signup,
                googleLogin,
                appleLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
