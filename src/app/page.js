'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Settings, 
  Download, 
  FileText, 
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

// Komponenten importieren
import { AudioRecorder } from '@/components/AudioRecorder'
import { ProcessingAnimation } from '@/components/ProcessingAnimation'
import { ProfileManager, DEFAULT_PROFILE } from '@/components/ProfileManager'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'

const WORKFLOW_STEPS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULT: 'result',
  ERROR: 'error'
}

const PROCESSING_STEPS = {
  TRANSCRIPTION: 0,
  GENERATION: 1,
  PDF: 2
}

export default function Home() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS.UPLOAD)
  const [processingStep, setProcessingStep] = useState(PROCESSING_STEPS.TRANSCRIPTION)
  const [selectedProfile, setSelectedProfile] = useState(DEFAULT_PROFILE)
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [generatedQuote, setGeneratedQuote] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [error, setError] = useState(null)

  // Audio verarbeiten - Hauptworkflow
  const handleAudioReady = async (audioBlob, fileName) => {
    setAudioFile({ blob: audioBlob, name: fileName })
    setCurrentStep(WORKFLOW_STEPS.PROCESSING)
    setProcessingStep(PROCESSING_STEPS.TRANSCRIPTION)
    setError(null)

    try {
      // Schritt 1: Transkription
      const transcriptResult = await processTranscription(audioBlob)
      
      // Schritt 2: Angebot generieren
      setProcessingStep(PROCESSING_STEPS.GENERATION)
      const quoteResult = await generateQuote(transcriptResult)
      
      // Schritt 3: PDF erstellen
      setProcessingStep(PROCESSING_STEPS.PDF)
      await generatePDF(quoteResult)

      // Entwurf für Finalisierung ablegen und weiterleiten
      try {
        sessionStorage.setItem('angebote-draft', JSON.stringify({
          markdown: quoteResult.markdown,
          quoteNumber: quoteResult.quoteNumber,
          profile: selectedProfile,
        }))
      } catch {}
      router.push('/finalize')
      
    } catch (error) {
      console.error('Verarbeitungsfehler:', error)
      setError(error.message || 'Ein unerwarteter Fehler ist aufgetreten')
      setCurrentStep(WORKFLOW_STEPS.ERROR)
    }
  }

  // Transkription mit Deepgram
  const processTranscription = async (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Transkription fehlgeschlagen')
    }

    const data = await response.json()
    setTranscript(data.transcript)
    return data.transcript
  }

  // Angebot mit GPT-4o generieren
  const generateQuote = async (transcriptText) => {
    const response = await fetch('/api/generate-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcriptText,
        profile: selectedProfile,
      }),
    })

    if (!response.ok) {
      throw new Error('Angebotserstellung fehlgeschlagen')
    }

    const data = await response.json()
    setGeneratedQuote(data)
    return data
  }

  // PDF mit Puppeteer generieren
  const generatePDF = async (quoteData) => {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown: quoteData.markdown,
        profile: selectedProfile,
      }),
    })

    if (!response.ok) {
      throw new Error('PDF-Generierung fehlgeschlagen')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)
    return url
  }

  // PDF herunterladen
  const downloadPDF = () => {
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `angebot-${generatedQuote?.quoteNumber || Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  // Workflow zurücksetzen
  const startNew = () => {
    setCurrentStep(WORKFLOW_STEPS.UPLOAD)
    setProcessingStep(PROCESSING_STEPS.TRANSCRIPTION)
    setAudioFile(null)
    setTranscript('')
    setGeneratedQuote(null)
    setPdfUrl(null)
    setError(null)
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-200/30 to-pink-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      {/* Header mit Glaseffekt */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="header-gradient sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ios-blue to-blue-600 rounded-ios flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ios-gray-900">
                  Angebote.KI
                </h1>
                <p className="text-xs text-ios-gray-600">
                  Von Sprache zu professionellem Angebot
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedProfile && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-ios-gray-900">
                    {selectedProfile.name}
                  </p>
                  <p className="text-xs text-ios-gray-600">
                    {selectedProfile.companyName}
                  </p>
                </div>
              )}
              <Button
                onClick={() => setIsProfileManagerOpen(true)}
                variant="secondary"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hauptinhalt */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Upload Schritt */}
          {currentStep === WORKFLOW_STEPS.UPLOAD && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Bereich */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-ios-blue to-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  <span>KI-powered • Sekundenschnell • Professionell</span>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl font-bold text-gray-900"
                >
                  Von Sprache zu{' '}
                  <span className="gradient-text">
                    professionellem Angebot
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-ios-gray-600 max-w-2xl mx-auto"
                >
                  Spreche einfach deine Anforderungen ein und erhalte in wenigen Minuten 
                  ein vollständiges, professionelles Angebot als PDF.
                </motion.p>
              </div>

              

              {/* Profil Warnung */}
              {!selectedProfile && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-orange-50 border border-orange-200 rounded-ios-lg p-4 mb-6"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800">
                        Kein Profil ausgewählt
                      </p>
                      <p className="text-sm text-orange-700">
                        Wähle ein Profil aus oder erstelle eines für personalisierte Angebote.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsProfileManagerOpen(true)}
                      size="sm"
                      variant="secondary"
                    >
                      Profile verwalten
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Audio Recorder Komponente */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <AudioRecorder
                  onAudioReady={handleAudioReady}
                  disabled={false}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Processing Schritt */}
          {currentStep === WORKFLOW_STEPS.PROCESSING && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <ProcessingAnimation
                currentStep={processingStep}
                onComplete={() => setCurrentStep(WORKFLOW_STEPS.RESULT)}
              />
            </motion.div>
          )}

          {/* Erfolg Schritt */}
          {currentStep === WORKFLOW_STEPS.RESULT && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-bold text-ios-gray-900">
                  Angebot erfolgreich erstellt! 🎉
                </h2>
                <p className="text-ios-gray-600">
                  Dein professionelles Angebot ist bereit zum Download.
                </p>
              </div>

              {generatedQuote && (
                <Card>
                  <CardHeader>
                    <CardTitle>Angebot Details</CardTitle>
                    <CardDescription>
                      Erstellt am {new Date(generatedQuote.generatedAt).toLocaleDateString('de-DE')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-ios-gray-700">Angebotsnummer</p>
                        <p className="text-ios-gray-900">{generatedQuote.quoteNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ios-gray-700">Profil</p>
                        <p className="text-ios-gray-900">{generatedQuote.profile}</p>
                      </div>
                    </div>
                    
                    {transcript && (
                      <div>
                        <p className="text-sm font-medium text-ios-gray-700 mb-2">
                          Ursprüngliche Anfrage
                        </p>
                        <div className="bg-ios-gray-50 rounded-ios p-3 text-sm text-ios-gray-700 max-h-32 overflow-y-auto">
                          {transcript}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={downloadPDF}
                  className="bg-green-500 hover:bg-green-600 text-lg px-8 py-4"
                  disabled={!pdfUrl}
                >
                  <Download className="w-5 h-5 mr-2" />
                  PDF herunterladen
                </Button>
                <Button
                  onClick={startNew}
                  variant="secondary"
                  className="text-lg px-8 py-4"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Neues Angebot erstellen
                </Button>
              </div>
            </motion.div>
          )}

          {/* Fehler Schritt */}
          {currentStep === WORKFLOW_STEPS.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ios-gray-900 mb-2">
                  Etwas ist schiefgelaufen
                </h2>
                <p className="text-ios-gray-600 mb-4">
                  {error || 'Ein unerwarteter Fehler ist aufgetreten'}
                </p>
                <Button onClick={startNew} className="bg-ios-blue hover:bg-blue-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut versuchen
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Manager Modal */}
      <ProfileManager
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        selectedProfile={selectedProfile}
        onProfileSelect={setSelectedProfile}
      />
    </div>
  )
}
