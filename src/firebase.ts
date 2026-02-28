/**
 * Firebase initialization for Analytics, Firestore (feedback), and optional future services.
 * Only initializes when VITE_FIREBASE_* env vars are set.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';
import { getFirestore, type Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  type RemoteConfig,
} from 'firebase/remote-config';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function hasValidConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.measurementId,
  );
}

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let firestore: Firestore | null = null;
let remoteConfig: RemoteConfig | null = null;

export async function initFirebase(): Promise<{ app: FirebaseApp | null; analytics: Analytics | null }> {
  if (!hasValidConfig()) {
    return { app: null, analytics: null };
  }
  if (app) {
    return { app, analytics };
  }
  app = initializeApp(firebaseConfig);
  firestore = getFirestore(app);
  remoteConfig = getRemoteConfig(app);
  remoteConfig.defaultConfig = {
    ads_enabled: true,
    show_amazon: false,
  };
  const supported = await isSupported();
  if (supported) {
    analytics = getAnalytics(app);
  }
  return { app, analytics };
}

export interface RemoteConfigFlags {
  adsEnabled: boolean;
  showAmazon: boolean;
}

/** Obtiene los flags de Remote Config (banners y botón Amazon). Devuelve null si Firebase no está configurado. */
export async function getRemoteConfigFlags(): Promise<RemoteConfigFlags | null> {
  if (!app || !remoteConfig) return null;
  try {
    await fetchAndActivate(remoteConfig);
    return {
      adsEnabled: getValue(remoteConfig, 'ads_enabled').asBoolean(),
      showAmazon: getValue(remoteConfig, 'show_amazon').asBoolean(),
    };
  } catch {
    return null;
  }
}

export function getFirebaseAnalytics(): Analytics | null {
  return analytics;
}

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

export interface FeedbackPayload {
  message: string;
  rating?: number;
  author?: string;
}

const FEEDBACK_COLLECTION = 'feedback';

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  if (!firestore) {
    throw new Error('Firebase is not configured. Feedback is not available.');
  }
  const col = collection(firestore, FEEDBACK_COLLECTION);
  await addDoc(col, {
    message: payload.message.trim(),
    ...(payload.rating != null && { rating: payload.rating }),
    ...(payload.author?.trim() && { author: payload.author.trim() }),
    createdAt: serverTimestamp(),
  });
}
