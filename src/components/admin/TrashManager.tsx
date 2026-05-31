"use client"

import { useTransition } from "react"
import {
  restorePublication, restoreEducation, restoreSkill, restoreResearch, restoreAlgorithm,
  permanentlyDelete,
} from "@/lib/actions"

type TrashedItem = {
  id: string
  type: string
  label: string
  subtitle?: string
  deletedAt: string
}

type Props = {
  publications: TrashedItem[]
  education: TrashedItem[]
  skills: TrashedItem[]
  research: TrashedItem[]
  algorithms: TrashedItem[]
}

const RESTORE_ACTIONS: Record<string, (id: string) => Promise<void>> = {
  publication: restorePublication,
  education: restoreEducation,
  skill: restoreSkill,
  research: restoreResearch,
  algorithm: restoreAlgorithm,
}

const TYPE_LABELS: Record<string, string> = {
  publication: "Publication",
  education: "Education",
  skill: "Skill",
  research: "Research",
  algorithm: "Algorithm",
}

function TrashedRow({ item }: { item: TrashedItem }) {
  const [isPending, startTransition] = useTransition()

  function handleRestore() {
    startTransition(async () => {
      await RESTORE_ACTIONS[item.type](item.id)
    })
  }

  function handleDelete() {
    if (!confirm(`Permanently delete "${item.label}"? This cannot be undone.`)) return
    startTransition(async () => {
      await permanentlyDelete(item.type, item.id)
    })
  }

  const deletedDate = new Date(item.deletedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  })

  return (
    <div className="cv-display-card flex items-center justify-between gap-4"
      style={{ opacity: isPending ? 0.5 : 1 }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--cv-accent)" }}>
            {TYPE_LABELS[item.type]}
          </span>
        </div>
        <p className="font-medium truncate" style={{ color: "var(--cv-ink)" }}>{item.label}</p>
        {item.subtitle && (
          <p className="text-sm truncate" style={{ color: "var(--cv-muted)" }}>{item.subtitle}</p>
        )}
        <p className="text-xs mt-1" style={{ color: "var(--cv-meta)" }}>Deleted {deletedDate}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={handleRestore} disabled={isPending} className="cv-btn-edit">
          Restore
        </button>
        <button onClick={handleDelete} disabled={isPending} className="cv-btn-delete">
          Delete forever
        </button>
      </div>
    </div>
  )
}

export function TrashManager({ publications, education, skills, research, algorithms }: Props) {
  const all = [...publications, ...education, ...skills, ...research, ...algorithms]
    .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime())

  if (all.length === 0) {
    return <div className="cv-empty-card">The trash is empty.</div>
  }

  return (
    <div className="flex flex-col gap-4">
      {all.map((item) => (
        <TrashedRow key={item.id} item={item} />
      ))}
    </div>
  )
}
