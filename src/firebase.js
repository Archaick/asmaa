import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Auto-detect long-polling recovers fast when a browser extension (uBlock, Brave
// shields, etc.) blocks WebChannel. Without this the SDK can hang ~60s per attempt.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
})
export const storage = getStorage(app)

export let analytics = null
if (typeof window !== 'undefined') {
  analyticsSupported()
    .then((ok) => { if (ok) analytics = getAnalytics(app) })
    .catch(() => {})
}
