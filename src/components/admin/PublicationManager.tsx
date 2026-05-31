"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { createPublication, updatePublication, deletePublication } from "@/lib/actions"

type Pub = {
  id: string
  title: string
  authors: string
  date: string
  description: string
  url: string
}

type Form = { title: string; authors: string; date: string; description: string; url: string }
const EMPTY: Form = { title: "", authors: "", date: "", description: "", url: "" }

export function PublicationManager({
  publications,
  isAdmin,
}: {
  publications: Pub[]
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState<Pub | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()

  function openEdit(pub: Pub) {
    setForm({ title: pub.title, authors: pub.authors, date: pub.date.split("T")[0], description: pub.description, url: pub.url })
    setEditing(pub)
  }

  function openAdd() {
    setForm(EMPTY)
    setAdding(true)
  }

  function close() {
    setEditing(null)
    setAdding(false)
  }

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
          <button onClick={openAdd} className={ADD_BTN}>
            + Add Publication
          </button>
        </div>
      )}

      {publications.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400">No publications added yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {publications.map((pub) => (
            <div key={pub.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition mb-1">
                    {pub.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">{pub.authors}</p>
                  <p className="text-sm text-gray-400 mb-3">
                    {new Date(pub.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                  {pub.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">{pub.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition">
                    View →
                  </a>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(pub)} className={EDIT_BTN}>Edit</button>
                      <button onClick={() => handleDelete(pub.id)} className={DEL_BTN}>Delete</button>
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
            <Field label="Title">
              <input type="text" required value={form.title} onChange={field("title")} className={INPUT} />
            </Field>
            <Field label="Authors">
              <input type="text" required value={form.authors} onChange={field("authors")} className={INPUT} />
            </Field>
            <Field label="Date">
              <input type="date" required value={form.date} onChange={field("date")} className={INPUT} />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={field("description")} className={INPUT} />
            </Field>
            <Field label="URL">
              <input type="url" required value={form.url} onChange={field("url")} className={INPUT} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
                {isPending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={close} className={BTN_SECONDARY}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
const ADD_BTN = "text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition rounded-lg px-4 py-2"
const EDIT_BTN = "text-xs border border-gray-200 px-2.5 py-1 rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-700 transition"
const DEL_BTN = "text-xs border border-red-100 px-2.5 py-1 rounded-lg text-red-400 hover:border-red-300 hover:text-red-600 transition"
const BTN_PRIMARY = "flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
const BTN_SECONDARY = "flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
