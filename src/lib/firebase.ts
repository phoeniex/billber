import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Check if a valid API key was provided in environment variables
export const isFirebaseConfigured = Boolean(
    apiKey &&
    apiKey.length > 5 &&
    !apiKey.includes('your_') &&
    apiKey !== 'undefined'
);

const firebaseConfig = {
    apiKey: apiKey || 'AIzaSyDemoDummyKeyToPreventFormatCrash12345',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo12345'
};

let app: any = null;
let auth: Auth = null as any;
let db: Firestore = null as any;

if (isFirebaseConfigured) {
    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.warn("Firebase initialization failed, falling back to LocalStorage demo mode:", e);
    }
}

export { app, auth, db };
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export default app;
