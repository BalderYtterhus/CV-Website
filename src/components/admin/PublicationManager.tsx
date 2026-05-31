"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { createPublication, updatePublication, deletePublication } from "@/lib/actions"

type Pub = { id: string; title: string; authors: string; date: string; description: string; url: string }
type Form = { title: string; authors: string; date: string; description: string; url: string }
const EMPTY: Form = { title: "", authors: "", date: "", description: "", url: "" }

export function PublicationManager({ publications, isAdmin }: { publications: Pub[]; isAdmin: boolean }) {
  const [editing, setEditing] = useState<Pub | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()

  function openEdit(pub: Pub) {
    setForm({ title: pub.title, authors: pub.authors, date: pub.date.split("T")[0], description: pub.description, url: pub.url })
    setEditing(pub)
  }

  function openAdd() { setForm(EMPTY); setAdding(true) }
  function close() { setEditing(null); setAdding(false) }
  function field(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (editing) await updatePublication(editing.id, form)
      else await createPublication(form)
      close()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this publication?")) return
    startTransition(async () => { await deletePublication(id) })
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-6">
          <button onClick={openAdd} className="cv-btn-add">+ Add Publication</button>
        </div>
      )}

      {publications.length === 0 ? (
        <div className="cv-empty-card">No publications added yet.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {publications.map((pub) => (
            <div key={pub.id} className="cv-display-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="cv-card-title text-lg mb-1">{pub.title}</h2>
                  <p className="text-sm mb-1" style={{ color: "var(--cv-muted)" }}>{pub.authors}</p>
                  <p className="text-sm mb-3" style={{ color: "var(--cv-meta)" }}>
                    {new Date(pub.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                  {pub.description && (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--cv-body)" }}>{pub.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ border: "1px solid var(--cv-border)", color: "var(--cv-muted)" }}
                  >
                    View →
                  </a>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(pub)} className="cv-btn-edit">Edit</button>
                      <button onClick={() => handleDelete(pub.id)} className="cv-btn-delete">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || adding) && (
        <Modal title={editing ? "Edit Publication" : "Add Publication"} onClose={close}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Title"><input type="text" required value={form.title} onChange={field("title")} className="cv-input" /></Field>
            <Field label="Authors"><input type="text" required value={form.authors} onChange={field("authors")} className="cv-input" /></Field>
            <Field label="Date"><input type="date" required value={form.date} onChange={field("date")} className="cv-input" /></Field>
            <Field label="Description"><textarea rows={3} value={form.description} onChange={field("description")} className="cv-input" /></Field>
            <Field label="URL"><input type="url" required value={form.url} onChange={field("url")} className="cv-input" /></Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending} className="cv-btn-primary">{isPending ? "Saving…" : "Save"}</button>
              <button type="button" onClick={close} className="cv-btn-secondary">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="cv-field-label">{label}</label>{children}</div>
}
