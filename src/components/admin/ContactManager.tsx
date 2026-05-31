"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { updateContactInfo } from "@/lib/actions"

type Contact = {
  email: string
  office: string
  department: string
  officeHours: string
  university: string
  location: string
}

export function ContactManager({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Contact>(contact)
  const [isPending, startTransition] = useTransition()

  function field(key: keyof Contact) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateContactInfo(form)
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition rounded-lg px-3 py-1.5"
      >
        Edit contact info
      </button>

      {open && (
        <Modal title="Edit Contact Info" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <input type="email" value={form.email} onChange={field("email")} className={INPUT} />
            </Field>
            <Field label="Office (room number)">
              <input type="text" value={form.office} onChange={field("office")} placeholder="Room 314" className={INPUT} />
            </Field>
            <Field label="Department">
              <input type="text" value={form.department} onChange={field("department")} placeholder="Department of Computer Science" className={INPUT} />
            </Field>
            <Field label="Office Hours">
              <input type="text" value={form.officeHours} onChange={field("officeHours")} placeholder="Tuesday & Thursday, 14:00 – 16:00" className={INPUT} />
            </Field>
            <Field label="University">
              <input type="text" value={form.university} onChange={field("university")} placeholder="University Name" className={INPUT} />
            </Field>
            <Field label="Location">
              <input type="text" value={form.location} onChange={field("location")} placeholder="City, Country" className={INPUT} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
                {isPending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className={BTN_SECONDARY}>
                Cancel
              </button>
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
const BTN_PRIMARY = "flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
const BTN_SECONDARY = "flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
