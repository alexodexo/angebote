'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        'border-2 border-ios-blue border-t-transparent rounded-full',
        sizeClasses[size],
        className
      )}
    />
  )
}

export function PulsingDots({ className }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-2 h-2 bg-ios-blue rounded-full"
        />
      ))}
    </div>
  )
}

export function WaveLoader({ className }) {
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className="w-1 h-8 bg-gradient-to-t from-ios-blue to-blue-400 rounded-full"
        />
      ))}
    </div>
  )
}
