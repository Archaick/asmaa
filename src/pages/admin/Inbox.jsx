import AdminLayout from '../../components/layout/AdminLayout'

export default function AdminInbox() {
  return (
    <AdminLayout title="الرسائل" subtitle="تأمّلات الطلاب وأسئلتهم">
      <div className="max-w-2xl mx-auto text-center p-12 bg-white border border-[color:var(--color-cream-deep)] rounded-2xl">
        <div className="text-5xl mb-4">📥</div>
        <h2 className="font-display text-2xl font-bold mb-2">صندوق الوارد</h2>
        <p className="text-[color:var(--color-ink-soft)] leading-relaxed">
          سيظهر هنا كل تأمل يشاركه معك أحد الطلاب. تقرأ. تردّ. تعلّم.
          <br />قيد التطوير — نبنيه بعد إتاحة كتابة التأملات للطلاب.
        </p>
      </div>
    </AdminLayout>
  )
}
