'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { createReport } from '@/lib/store'
import { toast } from 'sonner'

interface ReportDialogProps {
  adId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const REPORT_REASONS = [
  'Spam',
  'Fake ad',
  'Inappropriate content',
  'Other',
]

export function ReportDialog({ adId, open, onOpenChange }: ReportDialogProps) {
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!adId || !reason) return

    setIsSubmitting(true)
    const finalReason = reason === 'Other' ? otherReason || 'Other' : reason
    try {
      await createReport(adId, finalReason)
      toast.success('Report submitted successfully')
      setReason('')
      setOtherReason('')
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Ad</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this ad.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REPORT_REASONS.map((r) => (
              <div key={r} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={r} />
                <Label htmlFor={r}>{r}</Label>
              </div>
            ))}
          </RadioGroup>
          {reason === 'Other' && (
            <Textarea
              placeholder="Please describe the issue..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
