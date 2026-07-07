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
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null)
        setRole(null)
        setLoading(false)
        return
      }
      // Fetch or create user profile
      let userRole = 'student'
      try {
        const userRef = doc(db, 'users', u.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          userRole = snap.data().role || 'student'
        } else {
          const emailLower = (u.email || '').toLowerCase()
          userRole = ADMIN_EMAILS.includes(emailLower) ? 'admin' : 'student'
          await setDoc(userRef, {
            email: u.email || null,
            displayName: u.displayName || '',
            photoURL: u.photoURL || null,
            role: userRole,
            createdAt: serverTimestamp(),
          })
        }
      } catch (err) {
        // If Firestore isn't reachable, fall back to email-based role
        console.error('Auth profile fetch failed:', err)
        const emailLower = (u.email || '').toLowerCase()
        userRole = ADMIN_EMAILS.includes(emailLower) ? 'admin' : 'student'
      }
      setUser(u)
      setRole(userRole)
      setLoading(false)
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
