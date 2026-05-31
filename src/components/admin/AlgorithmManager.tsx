"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { createAlgorithm, updateAlgorithm, deleteAlgorithm } from "@/lib/actions"

type Algorithm = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string | null
  status: string
  tags: string[]
  url: string | null
}

type Form = { title: string; description: string; startDate: string; endDate: string; status: string; tags: string; url: string }
const EMPTY: Form = { title: "", description: "", startDate: "", endDate: "", status: "ongoing", tags: "", url: "" }

export function AlgorithmManager({
  algorithms,
  isAdmin,
}: {
  algorithms: Algorithm[]
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState<Algorithm | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()

  function openEdit(a: Algorithm) {
    setForm({
      title: a.title,
      description: a.description,
      startDate: a.startDate.split("T")[0],
      endDate: a.endDate ? a.endDate.split("T")[0] : "",
      status: a.status,
      tags: a.tags.join(", "),
      url: a.url ?? "",
    })
    setEditing(a)
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
          <button onClick={openAdd} className={ADD_BTN}>+ Add Algorithm</button>
        </div>
      )}

      {algorithms.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-400">No algorithms added yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {algorithms.map((a) => (
            <div key={a.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
                    Algorithm
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition">
                    {a.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    a.status === "ongoing"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}>
                    {a.status === "ongoing" ? "Ongoing" : "Completed"}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(a)} className={EDIT_BTN}>Edit</button>
                      <button onClick={() => handleDelete(a.id)} className={DEL_BTN}>Delete</button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-3">
                {new Date(a.startDate).getFullYear()}
                {" – "}
                {a.endDate ? new Date(a.endDate).getFullYear() : "Present"}
              </p>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">{a.description}</p>

              {a.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {a.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
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
            <Field label="Title">
              <input type="text" required value={form.title} onChange={field("title")} className={INPUT} />
            </Field>
            <Field label="Description">
              <textarea rows={3} required value={form.description} onChange={field("description")} className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input type="date" required value={form.startDate} onChange={field("startDate")} className={INPUT} />
              </Field>
              <Field label="End Date (optional)">
                <input type="date" value={form.endDate} onChange={field("endDate")} className={INPUT} />
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={field("status")} className={INPUT}>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <Field label="Tags (comma-separated)">
              <input type="text" value={form.tags} onChange={field("tags")} placeholder="e.g. Sorting, Graph Theory, NP-Hard" className={INPUT} />
            </Field>
            <Field label="URL (optional)">
              <input type="url" value={form.url} onChange={field("url")} className={INPUT} />
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
