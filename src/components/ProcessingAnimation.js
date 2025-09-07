'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Mic, FileText, Sparkles, Download } from 'lucide-react'

const processingSteps = [
  {
    id: 'transcription',
    title: 'Audio wird transkribiert',
    description: 'Deine Sprache wird in Text umgewandelt...',
    icon: Mic,
    color: 'from-blue-500 to-blue-600',
    duration: 8000,
  },
  {
    id: 'generation',
    title: 'Angebot wird erstellt',
    description: 'KI erstellt dein professionelles Angebot...',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    duration: 12000,
  },
  {
    id: 'formatting',
    title: 'PDF wird generiert',
    description: 'Dein Angebot wird formatiert...',
    icon: FileText,
    color: 'from-green-500 to-green-600',
    duration: 5000,
  },
]

export function ProcessingAnimation({ currentStep = 0, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  useEffect(() => {
    if (currentStep >= processingSteps.length) {
      onComplete?.()
      return
    }

    const step = processingSteps[currentStep]
    let startTime = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const stepProg = Math.min(elapsed / step.duration, 1)
      setStepProgress(stepProg)
      
      const totalProgress = (currentStep + stepProg) / processingSteps.length
      setProgress(totalProgress)

      if (stepProg < 1) {
        requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
  }, [currentStep, onComplete])

  const currentStepData = processingSteps[currentStep] || processingSteps[processingSteps.length - 1]
  const Icon = currentStepData.icon

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      {/* Hauptanimation */}
      <div className="relative mb-8">
        <motion.div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-2xl`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          }}
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>
        
        {/* Pulsierender Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-current opacity-20"
          animate={{
            scale: [1, 1.5],
            opacity: [0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ color: currentStepData.color.split(' ')[1] }}
        />
      </div>

      {/* Schritt-Informationen */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-semibold text-ios-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-ios-gray-600">
            {currentStepData.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Fortschrittsbalken */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-ios-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${currentStepData.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-ios-gray-500">
          <span>Schritt {currentStep + 1} von {processingSteps.length}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
      </div>

      {/* Schritt-Indikatoren */}
      <div className="flex space-x-4">
        {processingSteps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <motion.div
              key={step.id}
              className={`flex flex-col items-center space-y-2 ${
                isActive ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'
              }`}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? `bg-gradient-to-br ${step.color} text-white`
                    : 'bg-ios-gray-200 text-ios-gray-500'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white"
                  >
                    ✓
                  </motion.div>
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs text-center max-w-16">
                {step.title.split(' ')[0]}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Motivierende Nachrichten */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-ios-gray-500 italic">
          {currentStep === 0 && "Wir verwenden modernste KI-Technologie für beste Ergebnisse..."}
          {currentStep === 1 && "Dein Angebot wird individuell und professionell erstellt..."}
          {currentStep === 2 && "Gleich ist dein perfektes Angebot fertig!"}
        </p>
      </motion.div>
    </div>
  )
}
