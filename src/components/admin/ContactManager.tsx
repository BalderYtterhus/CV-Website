"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { updateContactInfo } from "@/lib/actions"

type Contact = { email: string; office: string; department: string; officeHours: string; university: string; location: string }

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
    startTransition(async () => { await updateContactInfo(form); setOpen(false) })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="cv-btn-inline">Edit contact info</button>

      {open && (
        <Modal title="Edit Contact Info" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email"><input type="email" value={form.email} onChange={field("email")} className="cv-input" /></Field>
            <Field label="Office"><input type="text" value={form.office} onChange={field("office")} placeholder="Room 314" className="cv-input" /></Field>
            <Field label="Department"><input type="text" value={form.department} onChange={field("department")} placeholder="Department of Computer Science" className="cv-input" /></Field>
            <Field label="Office Hours"><input type="text" value={form.officeHours} onChange={field("officeHours")} placeholder="Tuesday & Thursday, 14:00 – 16:00" className="cv-input" /></Field>
            <Field label="University"><input type="text" value={form.university} onChange={field("university")} placeholder="University Name" className="cv-input" /></Field>
            <Field label="Location"><input type="text" value={form.location} onChange={field("location")} placeholder="City, Country" className="cv-input" /></Field>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isPending} className="cv-btn-primary">{isPending ? "Saving…" : "Save"}</button>
              <button type="button" onClick={() => setOpen(false)} className="cv-btn-secondary">Cancel</button>
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
