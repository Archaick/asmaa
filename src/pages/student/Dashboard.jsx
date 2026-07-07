import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const { user, signOut } = useAuth()
  const name = user?.displayName || user?.email

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] flex flex-col">
      <header className="border-b border-[color:var(--color-cream-deep)] bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-[color:var(--color-cream-deep)] shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/asmaa.jpeg" alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold">الوسيلة</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[color:var(--color-ink-soft)]">{name}</span>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[color:var(--color-cream-deep)] hover:border-[color:var(--color-gold)] transition"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="font-display text-3xl font-bold mb-3">أهلاً بك</h1>
          <p className="text-[color:var(--color-ink-soft)] leading-relaxed">
            ستكون الوسيلة التفاعلية لحفظ الأسماء التسع والتسعين هنا قريبًا — مع تتبّع تقدّمك، والدعاء بأسماء الله، والتأمل في معانيها.
          </p>
        </div>
      </main>
    </div>
  )
}
