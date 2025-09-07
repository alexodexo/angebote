'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Card({ children, className, animated = true, ...props }) {
  const Component = animated ? motion.div : 'div'
  
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    whileHover: { y: -2 },
  } : {}

  return (
    <Component
      className={cn('card-ios', className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('pb-4 border-b border-ios-gray-100', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-xl font-semibold text-ios-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-ios-gray-600 mt-1', className)} {...props}>
      {children}
    </p>
  )
}
