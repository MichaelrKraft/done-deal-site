'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface PropertyPhotoProps {
  transactionId: string
  photoUrl: string | null
}

export default function PropertyPhoto({ transactionId, photoUrl }: PropertyPhotoProps) {
  const [photo, setPhoto] = useState(photoUrl)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) return // 10MB max

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/transactions/${transactionId}/photo`, {
        method: 'POST',
        body: fd,
      })
      if (res.ok) {
        const data = await res.json() as { photo_url: string }
        setPhoto(data.photo_url)
      }
    } catch {
      // silently fail — photo is non-critical
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleUpload(f)
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e8e2d9] bg-[#faf8f5] transition-colors hover:border-[#84c9d1] group"
      >
        {photo ? (
          <Image
            src={photo}
            alt="Property"
            fill
            className="object-cover rounded-xl"
            sizes="80px"
          />
        ) : uploading ? (
          <svg className="h-5 w-5 animate-spin text-[#84c9d1]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <svg className="h-5 w-5 text-[#b0a698] group-hover:text-[#84c9d1] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <span className="text-[8px] text-[#b0a698] group-hover:text-[#84c9d1] transition-colors">Photo</span>
          </div>
        )}
        {photo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </button>
    </>
  )
}
