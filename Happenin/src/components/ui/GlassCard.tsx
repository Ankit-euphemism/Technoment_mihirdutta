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
        'relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]',
        !noPadding && 'p-4',
        className
      )}
      {...props}
    >
      {/* Subtle top glare effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  )
}
