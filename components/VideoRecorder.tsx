'use client'

import { useState, useRef, useEffect } from 'react'

export default function VideoRecorder({
    onRecordSuccess,
    onCancel
}: {
    onRecordSuccess: (file: File) => void
    onCancel: () => void
}) {
    const [isRecording, setIsRecording] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    useEffect(() => {
        async function setupCamera() {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: true
                })
                setStream(userStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = userStream
                }
            } catch (err) {
                alert('Could not access camera/microphone. Please check permissions.')
                onCancel()
            }
        }
        setupCamera()

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && isRecording) {
            stopRecording()
        }
        return () => clearInterval(timer)
    }, [isRecording, timeLeft])

    const startRecording = () => {
        if (!stream) return
        chunksRef.current = []
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' })

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data)
            }
        }

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' })
            const file = new File([blob], 'record.webm', { type: 'video/webm' })
            onRecordSuccess(file)
        }

        recorder.start()
        mediaRecorderRef.current = recorder
        setIsRecording(true)
    }

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            stopStream()
        }
    }

    const handleCancel = () => {
        stopStream()
        onCancel()
    }

    return (
        <div className="recorder-overlay">
            <div className="recorder-container">
                <video ref={videoRef} autoPlay muted playsInline className="recorder-preview" />

                {/* 9:16 Safe Area Guide for Laptop Users */}
                <div className="recorder-safe-area" aria-hidden="true" />

                <div className="recorder-controls">
                    <div className="recorder-timer" style={{ color: timeLeft <= 10 ? 'var(--red)' : 'white' }}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button className="btn btn--ghost" onClick={handleCancel} style={{ color: 'white' }}>Cancel</button>

                        {!isRecording ? (
                            <button className="record-btn record-btn--start" onClick={startRecording}>
                                <div className="record-btn__inner" />
                            </button>
                        ) : (
                            <button className="record-btn record-btn--stop" onClick={stopRecording}>
                                <div className="record-btn__stop-square" />
                            </button>
                        )}

                        <div style={{ width: '60px' }} /> {/* Spacer */}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .recorder-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.9);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .recorder-container {
          width: 100%;
          max-width: 800px;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
        }
        .recorder-preview {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }
        @media (max-width: 600px) {
          .recorder-overlay {
            padding: 0;
          }
          .recorder-container {
            height: 100vh;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .recorder-preview {
            aspect-ratio: 9/16;
          }
          .recorder-controls {
            padding: 40px 20px 60px;
          }
        }
        .recorder-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 30px;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .recorder-timer {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .record-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .record-btn:hover {
          transform: scale(1.05);
        }
        .record-btn__inner {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px solid #000;
          background: var(--red);
        }
        .record-btn--stop .record-btn__stop-square {
          width: 24px;
          height: 24px;
          background: var(--red);
          border-radius: 4px;
        }
      `}</style>
        </div>
    )
}
