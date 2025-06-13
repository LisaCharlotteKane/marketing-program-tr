import { useState, useEffect } from 'react'
import { CheckCircle, Clock, ArrowClockwise } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface BudgetSaveIndicatorProps {
  className?: string
  lastSaved: Date | null
  isSaving: boolean
}

export function BudgetSaveIndicator({
  className,
  lastSaved,
  isSaving
}: BudgetSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)
  
  // Show "Saved" message briefly when lastSaved changes
  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved, isSaving])
  
  // Format relative time (e.g., "2 minutes ago")
  const getRelativeTimeString = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    
    if (diffSec < 10) return 'just now'
    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin === 1) return '1 minute ago'
    if (diffMin < 60) return `${diffMin} minutes ago`
    
    return date.toLocaleTimeString(undefined, { 
      hour: 'numeric', 
      minute: 'numeric'
    })
  }
  
  if (isSaving) {
    return (
      <div className={cn("flex items-center text-xs text-muted-foreground", className)}>
        <ArrowClockwise className="h-3 w-3 mr-1 animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }
  
  if (showSaved) {
    return (
      <div className={cn("flex items-center text-xs text-primary", className)}>
        <CheckCircle className="h-3 w-3 mr-1" />
        <span>Saved</span>
      </div>
    )
  }
  
  if (lastSaved) {
    return (
      <div className={cn("flex items-center text-xs text-muted-foreground", className)}>
        <Clock className="h-3 w-3 mr-1" />
        <span>Last saved {getRelativeTimeString(lastSaved)}</span>
      </div>
    )
  }
  
  return null
}