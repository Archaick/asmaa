export default function App() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-lg text-[color:var(--color-ink-soft)] mb-4">
        بسم الله الرحمن الرحيم
      </p>

      <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-tight mb-6">
        مشروع أسماء الله الحسنى
      </h1>

      <p className="max-w-xl text-xl sm:text-2xl leading-relaxed text-[color:var(--color-ink-soft)] mb-10">
        منظومة تعليمية تعينك على حفظ أسماء الله الحسنى، وفهم معانيها،
        والدعاء بها، والتعبد لله بمقتضاها.
      </p>

      <button
        type="button"
        className="text-2xl px-10 py-5 rounded-2xl bg-[color:var(--color-bouquet-4)] text-white shadow-lg hover:opacity-90 transition"
      >
        ابدأ الآن
      </button>
    </div>
  )
}
