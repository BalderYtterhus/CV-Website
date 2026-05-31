"use client"

import { useState, useTransition } from "react"
import { Modal } from "./Modal"
import { updateSiteSettings, resetSiteImages } from "@/lib/actions"

type ImageState =
  | { type: "keep" }
  | { type: "clear" }
  | { type: "new"; data: string } // base64 data URL

type Props = {
  settings: {
    name: string
    role: string
    bio: string
    hasProfileImage: boolean
    hasBackgroundImage: boolean
  }
}

export function SiteSettingsManager({ settings }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(settings.name)
  const [role, setRole] = useState(settings.role)
  const [bio, setBio] = useState(settings.bio)
  const [profileImg, setProfileImg] = useState<ImageState>({ type: "keep" })
  const [bgImg, setBgImg] = useState<ImageState>({ type: "keep" })
  const [isPending, startTransition] = useTransition()

  function openModal() {
    setName(settings.name)
    setRole(settings.role)
    setBio(settings.bio)
    setProfileImg({ type: "keep" })
    setBgImg({ type: "keep" })
    setOpen(true)
  }

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (s: ImageState) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8 MB")
      e.target.value = ""
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setter({ type: "new", data: reader.result as string })
    reader.readAsDataURL(file)
  }

  function imagePayload(img: ImageState): string | null | "keep" {
    if (img.type === "keep") return "keep"
    if (img.type === "clear") return null
    return img.data
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateSiteSettings({
        name,
        role,
        bio,
        profileImage: imagePayload(profileImg),
        backgroundImage: imagePayload(bgImg),
      })
      setOpen(false)
    })
  }

  function handleReset() {
    if (!confirm("Remove both uploaded images and revert to the default template?")) return
    startTransition(async () => {
      await resetSiteImages()
      setProfileImg({ type: "clear" })
      setBgImg({ type: "clear" })
      setOpen(false)
    })
  }

  // Preview src for an image field
  function previewSrc(img: ImageState, apiPath: string): string | null {
    if (img.type === "new") return img.data
    if (img.type === "keep") return apiPath
    return null // cleared
  }

  const profileSrc = previewSrc(
    profileImg,
    settings.hasProfileImage ? "/api/images/profile" : ""
  )
  const bgSrc = previewSrc(
    bgImg,
    settings.hasBackgroundImage ? "/api/images/background" : ""
  )

  return (
    <>
      <button
        onClick={openModal}
        className="text-xs border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition rounded-lg px-3 py-1.5"
      >
        Edit site info
      </button>

      {open && (
        <Modal title="Edit Site Info" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Text fields */}
            <Field label="Name">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Role / Title">
              <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} className={INPUT} />
            </Field>
            <Field label="Bio">
              <textarea rows={3} required value={bio} onChange={(e) => setBio(e.target.value)} className={INPUT} />
            </Field>

            <hr className="border-gray-100" />

            {/* Profile picture */}
            <Field label="Profile Picture">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex-shrink-0">
                  {profileSrc ? (
                    <img
                      src={profileSrc}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <label className="inline-block cursor-pointer mb-2">
                    <span className="text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition rounded-lg px-3 py-1.5">
                      Choose image
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleFile(e, setProfileImg)}
                    />
                  </label>
                  <p className="text-xs text-gray-400 leading-relaxed mb-1">
                    JPEG, PNG, WebP, GIF or SVG · max 8 MB
                  </p>
                  {(profileSrc || profileImg.type === "new") && (
                    <button
                      type="button"
                      onClick={() => setProfileImg({ type: "clear" })}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </Field>

            {/* Background image */}
            <Field label="Page Background">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex-shrink-0">
                  {bgSrc ? (
                    <img
                      src={bgSrc}
                      alt="Background preview"
                      className="w-16 h-10 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-10 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-300 text-xs">
                      None
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <label className="inline-block cursor-pointer mb-2">
                    <span className="text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition rounded-lg px-3 py-1.5">
                      Choose image
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFile(e, setBgImg)}
                    />
                  </label>
                  <p className="text-xs text-gray-400 leading-relaxed mb-1">
                    JPEG, PNG, WebP or GIF · max 8 MB
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    Shown across all pages
                  </p>
                  {(bgSrc || bgImg.type === "new") && (
                    <button
                      type="button"
                      onClick={() => setBgImg({ type: "clear" })}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Remove background
                    </button>
                  )}
                </div>
              </div>
            </Field>

            <hr className="border-gray-100" />

            <div className="flex gap-3">
              <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
                {isPending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className={BTN_SECONDARY}>
                Cancel
              </button>
            </div>

            {/* Reset images */}
            {(settings.hasProfileImage || settings.hasBackgroundImage) && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-600 transition text-center disabled:opacity-50"
              >
                Reset images to default template
              </button>
            )}

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
