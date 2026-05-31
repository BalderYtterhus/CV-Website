"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { createEducation, updateEducation, deleteEducation } from "@/lib/actions"

type Edu = {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
  description: string | null
}

type Form = { institution: string; degree: string; field: string; startDate: string; endDate: string; description: string }
const EMPTY: Form = { institution: "", degree: "", field: "", startDate: "", endDate: "", description: "" }

export function EducationManager({
  education,
  isAdmin,
}: {
  education: Edu[]
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState<Edu | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()

  function openEdit(edu: Edu) {
    setForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate.split("T")[0],
      endDate: edu.endDate ? edu.endDate.split("T")[0] : "",
      description: edu.description ?? "",
    })
    setEditing(edu)
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
      if (editing) await updateEducation(editing.id, form)
      else await createEducation(form)
      close()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this education entry?")) return
    startTransition(async () => { await deleteEducation(id) })
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-5">
          <button onClick={openAdd} className={ADD_BTN}>+ Add Education</button>
        </div>
      )}

      {education.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No education entries yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {education.map((edu) => (
            <div key={edu.id} className="flex gap-6 items-start group">
              <div className="text-sm text-gray-400 w-28 flex-shrink-0 pt-0.5">
                {new Date(edu.startDate).getFullYear()}
                {" – "}
                {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                </p>
                <p className="text-sm text-gray-500">{edu.institution}</p>
                {edu.description && (
                  <p className="text-sm text-gray-400 mt-1">{edu.description}</p>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(edu)} className={EDIT_BTN}>Edit</button>
                  <button onClick={() => handleDelete(edu.id)} className={DEL_BTN}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(editing || adding) && (
        <Modal title={editing ? "Edit Education" : "Add Education"} onClose={close}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Institution">
              <input type="text" required value={form.institution} onChange={field("institution")} className={INPUT} />
            </Field>
            <Field label="Degree">
              <input type="text" required value={form.degree} onChange={field("degree")} className={INPUT} />
            </Field>
            <Field label="Field of Study">
              <input type="text" required value={form.field} onChange={field("field")} className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input type="date" required value={form.startDate} onChange={field("startDate")} className={INPUT} />
              </Field>
              <Field label="End Date (optional)">
                <input type="date" value={form.endDate} onChange={field("endDate")} className={INPUT} />
              </Field>
            </div>
            <Field label="Description (optional)">
              <textarea rows={2} value={form.description} onChange={field("description")} className={INPUT} />
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
