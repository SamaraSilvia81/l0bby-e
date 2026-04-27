// ─────────────────────────────────────────────────────────────
//  L0bby-E — Firebase config
//  Preencha com as suas chaves do Firebase Console
//  (Project Settings → Your apps → SDK setup and configuration)
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getFirestore }  from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
