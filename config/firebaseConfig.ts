import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, 
  // @ts-ignore
  getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBiehpifgEGvlfixfsic8lKFw8UaQbakFQ",
  authDomain: "solid-groove-450016-i4.firebaseapp.com",
  projectId: "solid-groove-450016-i4",
  storageBucket: "solid-groove-450016-i4.firebasestorage.app",
  messagingSenderId: "771873321322",
  appId: "1:771873321322:web:8b52c2ccbdcfa68e50b513"
};

// Initialize Firebase only if it hasn't been initialized already
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage persistence
// This ensures users stay logged in when they close and reopen the app
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, just get it
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
