import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  className?: string
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-purple-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900',
    neon: 'bg-primary text-white shadow-md hover:shadow-lg hover:bg-purple-700'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl font-medium'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
