'use client'

import { useState, useRef } from 'react'
import VideoRecorder from './VideoRecorder'

export default function VideoUploader({
  onUploadSuccess
}: {
  onUploadSuccess: (url: string, thumbnailUrl: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (MP4, MOV).')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('Video must be smaller than 50MB.')
      return
    }

    // Verify duration <= 60s
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      if (video.duration > 61) { // 1s buffer for precision
        alert('Video must be 60 seconds or less.')
        setUploading(false)
        return
      }
      startActualUpload(file)
    }
    video.src = URL.createObjectURL(file)
  }

  const startActualUpload = async (file: File) => {
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'groundfloor_pitches')

    try {
      // Direct unsigned upload to Cloudinary
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText)
          setUploadedFileName(file.name)
          setUploading(false)

          // Auto-generate thumbnail URL from Cloudinary by swapping extension
          const thumbnailUrl = res.secure_url.replace(/\.[^/.]+$/, '.jpg')
          onUploadSuccess(res.secure_url, thumbnailUrl)
        } else {
          throw new Error('Upload failed')
        }
      }

      xhr.onerror = () => {
        throw new Error('Network error during upload')
      }

      xhr.send(formData)

    } catch (err) {
      alert('Video upload failed. Check your connection and try again.')
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  if (uploadedFileName) {
    return (
      <div className="upload-zone" style={{ borderColor: 'var(--green)', background: 'var(--green-light)', borderStyle: 'solid' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)' }}>{uploadedFileName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Ready to go</div>
        </div>
      </div>
    )
  }

  if (uploading) {
    return (
      <div className="upload-zone" style={{ borderColor: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Uploading...</div>
          <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--text-primary)', transition: 'width 0.2s' }}></div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>{progress}%</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <button
          className="btn btn--secondary"
          style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', height: 'auto', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowRecorder(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Record Video</span>
        </button>
        <button
          className="btn btn--secondary"
          style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', height: 'auto', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Video</span>
        </button>
      </div>

      <div
        className="upload-zone"
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ padding: '32px 20px', borderStyle: 'dashed' }}
      >
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag & drop or click to choose file · MP4, MOV · Max 60 seconds</div>
        </div>
      </div>

      {showRecorder && (
        <VideoRecorder
          onCancel={() => setShowRecorder(false)}
          onRecordSuccess={(file) => {
            setShowRecorder(false)
            startActualUpload(file)
          }}
        />
      )}
    </>
  )
}
