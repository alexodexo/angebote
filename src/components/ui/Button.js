'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'bg-transparent text-ios-gray-600 hover:bg-ios-gray-100 rounded-ios font-medium transition-all duration-200',
  destructive: 'bg-red-500 text-white rounded-ios font-medium transition-all duration-200 hover:bg-red-600',
}

const sizeVariants = {
  sm: 'text-sm',
  md: '',
  lg: 'text-lg',
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        buttonVariants[variant],
        sizeVariants[size],
        disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2 inline-block"
        />
      )}
      {children}
    </motion.button>
  )
}
