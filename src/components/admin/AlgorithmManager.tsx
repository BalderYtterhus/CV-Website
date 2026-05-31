"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { createAlgorithm, updateAlgorithm, deleteAlgorithm } from "@/lib/actions"

type Algorithm = { id: string; title: string; description: string; startDate: string; endDate: string | null; status: string; tags: string[]; url: string | null }
type Form = { title: string; description: string; startDate: string; endDate: string; status: string; tags: string; url: string }
const EMPTY: Form = { title: "", description: "", startDate: "", endDate: "", status: "ongoing", tags: "", url: "" }

export function AlgorithmManager({ algorithms, isAdmin }: { algorithms: Algorithm[]; isAdmin: boolean }) {
  const [editing, setEditing] = useState<Algorithm | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()

  function openEdit(a: Algorithm) {
    setForm({ title: a.title, description: a.description, startDate: a.startDate.split("T")[0], endDate: a.endDate ? a.endDate.split("T")[0] : "", status: a.status, tags: a.tags.join(", "), url: a.url ?? "" })
    setEditing(a)
  }

  function openAdd() { setForm(EMPTY); setAdding(true) }
  function close() { setEditing(null); setAdding(false) }
  function field(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (editing) await updateAlgorithm(editing.id, form)
      else await createAlgorithm(form)
      close()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this algorithm?")) return
    startTransition(async () => { await deleteAlgorithm(id) })
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-6">
          <button onClick={openAdd} className="cv-btn-add">+ Add Algorithm</button>
        </div>
      )}

      {algorithms.length === 0 ? (
        <div className="cv-empty-card">No algorithms added yet.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {algorithms.map((a) => (
            <div key={a.id} className="cv-display-card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--cv-accent)" }}>
                    Algorithm
                  </span>
                  <h2 className="cv-card-title">{a.title}</h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={a.status === "ongoing" ? "cv-badge-ongoing" : "cv-badge-completed"}>
                    {a.status === "ongoing" ? "Ongoing" : "Completed"}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(a)} className="cv-btn-edit">Edit</button>
                      <button onClick={() => handleDelete(a.id)} className="cv-btn-delete">Delete</button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm mb-3" style={{ color: "var(--cv-meta)" }}>
                {new Date(a.startDate).getFullYear()}
                {" – "}
                {a.endDate ? new Date(a.endDate).getFullYear() : "Present"}
              </p>

              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--cv-body)" }}>{a.description}</p>

              {a.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {a.tags.map((tag) => <span key={tag} className="cv-tag">{tag}</span>)}
                </div>
              )}

              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--cv-accent)" }}>
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {(editing || adding) && (
        <Modal title={editing ? "Edit Algorithm" : "Add Algorithm"} onClose={close}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Title"><input type="text" required value={form.title} onChange={field("title")} className="cv-input" /></Field>
            <Field label="Description"><textarea rows={3} required value={form.description} onChange={field("description")} className="cv-input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date"><input type="date" required value={form.startDate} onChange={field("startDate")} className="cv-input" /></Field>
              <Field label="End Date (optional)"><input type="date" value={form.endDate} onChange={field("endDate")} className="cv-input" /></Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={field("status")} className="cv-input">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <Field label="Tags (comma-separated)"><input type="text" value={form.tags} onChange={field("tags")} placeholder="e.g. Sorting, Graph Theory, NP-Hard" className="cv-input" /></Field>
            <Field label="URL (optional)"><input type="url" value={form.url} onChange={field("url")} className="cv-input" /></Field>
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
