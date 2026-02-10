'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { RotateCcw, Loader2 } from 'lucide-react'

interface UndoActionButtonProps {
  lastAction?: {
    id: string
    last_action_type: string
    last_action_id: string
    can_undo: boolean
  } | null
  onUndoSuccess?: () => void
}

export function UndoActionButton({ lastAction, onUndoSuccess }: UndoActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!lastAction || !lastAction.can_undo) {
    return null
  }

  const handleUndo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/undo/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duplicate_id: lastAction.last_action_id,
          reason: 'User initiated undo',
        }),
      })

      if (!response.ok) {
        throw new Error('Undo failed')
      }

      setIsOpen(false)
      onUndoSuccess?.()
    } catch (error) {
      console.error('[v0] Undo error:', error)
      alert('Failed to undo action')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        Undo Last Action
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Last Action?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert the last duplicate resolution. This action cannot be undone again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUndo} disabled={isLoading}>
              {isLoading ? 'Undoing...' : 'Undo'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
