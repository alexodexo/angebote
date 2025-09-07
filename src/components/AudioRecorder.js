'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square, Play, Pause, Upload, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDuration, formatFileSize } from '@/lib/utils'

export function AudioRecorder({ onAudioReady, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])

  // Aufnahme starten
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        
        // Stream stoppen
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      setRecordingTime(0)
      
      // Timer starten
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Fehler beim Starten der Aufnahme:', error)
      alert('Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff und versuche es erneut.')
    }
  }

  // Aufnahme stoppen
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      clearInterval(intervalRef.current)
    }
  }

  // Aufnahme pausieren/fortsetzen
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        clearInterval(intervalRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  // Audio abspielen/pausieren
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Aufnahme löschen
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setRecordingTime(0)
  }

  // Datei-Upload
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      setAudioBlob(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.webm', '.ogg']
    },
    maxFiles: 1,
    disabled: disabled || isRecording
  })

  // Audio verwenden
  const handleUseAudio = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, uploadedFile?.name || `recording-${Date.now()}.webm`)
    }
  }

  // Auto-Start nach Recording
  useEffect(() => {
    if (audioBlob && !uploadedFile) {
      // Kurze Verzögerung für bessere UX, dann automatisch starten
      const timer = setTimeout(() => {
        if (audioBlob) {
          onAudioReady(audioBlob, `recording-${Date.now()}.webm`)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [audioBlob, uploadedFile, onAudioReady])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return (
    <div className="space-y-6">
      {/* Aufnahme-Bereich zuerst */}
      <Card className="text-center">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-ios-gray-900">
            Direkt aufnehmen
          </h3>

          {/* Aufnahme-Visualisierung */}
          <div className="flex justify-center">
            <motion.div
              className="relative"
              animate={isRecording && !isPaused ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                isRecording 
                  ? 'bg-red-500 text-white' 
                  : 'bg-ios-blue text-white'
              } shadow-ios`}>
                {isRecording ? (
                  <Mic className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </div>
              
              {/* Pulsierender Ring während Aufnahme */}
              <AnimatePresence>
                {isRecording && !isPaused && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-500 opacity-30"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Aufnahme-Zeit */}
          <AnimatePresence>
            {(isRecording || recordingTime > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-mono text-ios-gray-900"
              >
                {formatDuration(recordingTime)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aufnahme-Steuerung */}
          <div className="flex justify-center space-x-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                disabled={disabled}
                className="bg-ios-blue hover:bg-blue-600"
              >
                <Mic className="w-5 h-5 mr-2" />
                Aufnahme starten
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={togglePause}
                  variant="secondary"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Fortsetzen
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pausieren
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stoppen
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Oder-Trenner */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ios-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-ios-gray-500">oder</span>
        </div>
      </div>

      {/* Upload-Bereich danach */}
      <Card className="relative">
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-ios-lg transition-all cursor-pointer ${
            isDragActive 
              ? 'border-ios-blue bg-blue-50' 
              : 'border-ios-gray-300 hover:border-ios-gray-400'
          } ${disabled || isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload className="w-12 h-12 text-ios-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ios-gray-900 mb-2">
              Audio-Datei hochladen
            </h3>
            <p className="text-ios-gray-600">
              {isDragActive 
                ? 'Datei hier ablegen...' 
                : 'Ziehe eine Audio-Datei hierher oder klicke zum Auswählen'
              }
            </p>
            <p className="text-sm text-ios-gray-500 mt-2">
              Unterstützt: MP3, WAV, M4A, WebM, OGG
            </p>
          </div>
        </div>
      </Card>

      {/* Audio-Vorschau */}
      <AnimatePresence>
        {(audioBlob || uploadedFile) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-ios-gray-900">
                    {uploadedFile ? 'Hochgeladene Datei' : 'Aufgenommenes Audio'}
                  </h4>
                  <Button
                    onClick={deleteRecording}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {uploadedFile && (
                  <div className="text-sm text-ios-gray-600">
                    <p>{uploadedFile.name}</p>
                    <p>{formatFileSize(uploadedFile.size)}</p>
                  </div>
                )}

                {audioUrl && (
                  <div className="space-y-3">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />

                    <div className="flex justify-center space-x-3">
                      <Button
                        onClick={togglePlayback}
                        variant="secondary"
                        size="sm"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausieren
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Abspielen
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleUseAudio}
                        disabled={disabled}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Audio verwenden
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
