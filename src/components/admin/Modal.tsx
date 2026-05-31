"use client"

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        style={{ background: "var(--cv-card)", border: "1px solid var(--cv-border)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--cv-border)" }}
        >
          <h2 className="font-semibold" style={{ color: "var(--cv-ink)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="text-xl leading-none transition-opacity hover:opacity-60"
            style={{ color: "var(--cv-meta)" }}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
