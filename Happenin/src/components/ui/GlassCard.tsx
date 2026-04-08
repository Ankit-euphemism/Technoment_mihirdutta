import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function GlassCard({ children, className, noPadding = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm',
        !noPadding && 'p-4',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
