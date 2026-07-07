import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// Debug: log once at module load so you can confirm env is picked up.
// Look for [Auth] boot in the browser console after refresh.
console.log('[Auth] boot — ADMIN_EMAILS:', ADMIN_EMAILS, '(from VITE_ADMIN_EMAILS)')

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
  signInGoogle: async () => {},
  signInEmail: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null)
        setRole(null)
        setLoading(false)
        return
      }

      // Resolve role from the email allowlist SYNCHRONOUSLY.
      // Do NOT await Firestore — if the network is blocked, the SDK will
      // retry silently forever and freeze the UI.
      const emailLower = (u.email || '').toLowerCase()
      const isAdminEmail = ADMIN_EMAILS.includes(emailLower)
      const clientRole = isAdminEmail ? 'admin' : 'student'

      setUser(u)
      setRole(clientRole)
      setLoading(false)

      console.log('[Auth] signed in — role from email:', clientRole, '(admin=', isAdminEmail, ')')

      // Fire-and-forget background sync with Firestore. Failures do not
      // block the app — the user is already navigated to their dashboard.
      syncProfileInBackground(u, isAdminEmail, clientRole)
    })
  }, [])

  const signInGoogle = () => signInWithPopup(auth, new GoogleAuthProvider())
  const signInEmail = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signOut = () => fbSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, role, loading, signInGoogle, signInEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Background: create-or-promote the user's Firestore profile.
// Silent failures on network issues (ad blockers, offline, etc).
async function syncProfileInBackground(u, isAdminEmail, clientRole) {
  try {
    const userRef = doc(db, 'users', u.uid)
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      const existingRole = snap.data().role || clientRole
      if (isAdminEmail && existingRole !== 'admin') {
        await setDoc(userRef, { role: 'admin' }, { merge: true })
        console.log('[Auth] promoted existing doc to admin')
      }
    } else {
      await setDoc(userRef, {
        email: u.email || null,
        displayName: u.displayName || '',
        photoURL: u.photoURL || null,
        role: clientRole,
        createdAt: serverTimestamp(),
      })
      console.log('[Auth] created user doc with role:', clientRole)
    }
  } catch (err) {
    console.warn('[Auth] Firestore profile sync failed (using email-based role):', err?.message || err)
  }
}
