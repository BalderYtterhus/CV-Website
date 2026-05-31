"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { createSkill, updateSkill, deleteSkill } from "@/lib/actions"

type Skill = {
  id: string
  name: string
  category: string | null
  level: string | null
}

type Form = { name: string; category: string; level: string }
const EMPTY: Form = { name: "", category: "", level: "" }

export function SkillManager({
  skills,
  isAdmin,
}: {
  skills: Skill[]
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState<Skill | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()

  const byCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? "General"
    acc[cat] = acc[cat] ? [...acc[cat], skill] : [skill]
    return acc
  }, {})

  function openEdit(skill: Skill) {
    setForm({ name: skill.name, category: skill.category ?? "", level: skill.level ?? "" })
    setEditing(skill)
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
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      if (editing) await updateSkill(editing.id, form)
      else await createSkill(form)
      close()
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this skill?")) return
    startTransition(async () => { await deleteSkill(id) })
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-4">
          <button onClick={openAdd} className={ADD_BTN}>+ Add Skill</button>
        </div>
      )}

      {skills.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No skills added yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <div key={skill.id} className="relative group/skill flex items-center">
                    <span className={`border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 font-medium hover:border-blue-300 hover:text-blue-700 transition${isAdmin ? " pr-14 cursor-pointer" : ""}`}
                      onClick={isAdmin ? () => openEdit(skill) : undefined}
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="ml-1.5 text-xs text-gray-400">· {skill.level}</span>
                      )}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition text-xs font-bold leading-none"
                        title="Delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || adding) && (
        <Modal title={editing ? "Edit Skill" : "Add Skill"} onClose={close}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Name">
              <input type="text" required value={form.name} onChange={field("name")} className={INPUT} />
            </Field>
            <Field label="Category (optional)">
              <input type="text" value={form.category} onChange={field("category")} placeholder="e.g. Programming, Languages" className={INPUT} />
            </Field>
            <Field label="Level (optional)">
              <input type="text" value={form.level} onChange={field("level")} placeholder="e.g. Advanced, Intermediate" className={INPUT} />
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
const BTN_PRIMARY = "flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
const BTN_SECONDARY = "flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
