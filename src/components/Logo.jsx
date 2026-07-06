export default function Logo({ size = 44 }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--color-gold-soft), var(--color-gold))',
        boxShadow: '0 2px 10px rgba(138, 110, 54, 0.25)',
      }}
      aria-label="شعار المشروع"
    >
      <span
        className="font-serif font-bold leading-none"
        style={{
          color: 'var(--color-ink)',
          fontSize: size * 0.55,
        }}
      >
        ﷲ
      </span>
    </div>
  )
}
