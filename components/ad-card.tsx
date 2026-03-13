'use client'

import { Ad, AdType, AdStatus, CATEGORY_LABELS } from '@/lib/types'
import { Flag, ImageIcon, Clock, Edit, Trash2, Check, X, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface AdCardProps {
  ad: Ad
  onReport?: (adId: string) => void
  showReportButton?: boolean
}

interface AdminAdCardProps {
  ad: Ad
  onEdit?: (ad: Ad) => void
  onDelete?: (adId: string) => void
  onApprove?: (adId: string) => void
  onReject?: (adId: string) => void
  showStatus?: boolean
  variant?: 'admin-pending' | 'admin-all' | 'user-dashboard'
}

const AD_TYPE_STYLES: Record<AdType, { border: string; label: string; labelBg: string }> = {
  vip: {
    border: 'border-green-500 border-2',
    label: 'VIP Ad',
    labelBg: 'bg-green-500',
  },
  super: {
    border: 'border-yellow-500 border-2',
    label: 'Super Ad',
    labelBg: 'bg-yellow-500',
  },
  normal: {
    border: 'border-border',
    label: '',
    labelBg: '',
  },
}

const STATUS_CONFIG: Record<AdStatus, { icon: typeof Clock; label: string; class: string }> = {
  pending: { icon: Clock, label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
  approved: { icon: CheckCircle, label: 'Approved', class: 'bg-green-100 text-green-800' },
  rejected: { icon: XCircle, label: 'Rejected', class: 'bg-red-100 text-red-800' },
  expired: { icon: Clock, label: 'Expired', class: 'bg-gray-100 text-gray-800' },
}

export function AdCard({ ad, onReport, showReportButton = true }: AdCardProps) {
  const styles = AD_TYPE_STYLES[ad.adType]
  const relativeTime = getRelativeTime(ad.createdAt)

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onReport?.(ad.id)
  }

  return (
    <Link
      href={`/ad/${ad.id}`}
      className={cn(
        'group relative flex overflow-hidden rounded-lg bg-card transition-shadow hover:shadow-md cursor-pointer',
        styles.border
      )}
    >
      {/* Image */}
      <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {/* Ad Type Label */}
        {styles.label && (
          <span
            className={cn(
              'absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-semibold text-white',
              styles.labelBg
            )}
          >
            {styles.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="inline-block rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {CATEGORY_LABELS[ad.category]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {relativeTime}
          </span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-blue-600">
          {ad.title}
        </h3>

        <p className="mb-2 line-clamp-3 flex-1 text-xs text-muted-foreground">
          {ad.description}
        </p>

        {showReportButton && onReport && (
          <button
            onClick={handleReportClick}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Flag className="h-3 w-3" />
            Report
          </button>
        )}
      </div>
    </Link>
  )
}

export function AdminAdCard({ 
  ad, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject, 
  showStatus = false,
  variant = 'admin-all'
}: AdminAdCardProps) {
  const styles = AD_TYPE_STYLES[ad.adType]
  const relativeTime = getRelativeTime(ad.createdAt)
  const statusConfig = STATUS_CONFIG[ad.status]
  const StatusIcon = statusConfig.icon

  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    callback?.()
  }

  return (
    <Link
      href={`/ad/${ad.id}`}
      className={cn(
        'group relative flex overflow-hidden rounded-lg bg-card transition-shadow hover:shadow-md cursor-pointer',
        styles.border
      )}
    >
      {/* Image */}
      <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {/* Ad Type Label */}
        {styles.label && (
          <span
            className={cn(
              'absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-semibold text-white',
              styles.labelBg
            )}
          >
            {styles.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex flex-wrap items-center gap-1">
          <span className="inline-block rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {CATEGORY_LABELS[ad.category]}
          </span>
          {showStatus && (
            <Badge className={cn('text-xs', statusConfig.class)}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          )}
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {relativeTime}
          </span>
        </div>

        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-blue-600">
          {ad.title}
        </h3>

        <p className="mb-2 line-clamp-3 flex-1 text-xs text-muted-foreground">
          {ad.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-wrap gap-2">
          {variant === 'admin-pending' && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleButtonClick(e, () => onEdit(ad))}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
              {onApprove && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => handleButtonClick(e, () => onApprove(ad.id))}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => handleButtonClick(e, () => onReject(ad.id))}
                >
                  <X className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              )}
            </>
          )}
          
          {variant === 'admin-all' && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleButtonClick(e, () => onEdit(ad))}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleButtonClick(e, () => onDelete(ad.id))}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              )}
            </>
          )}
          
          {variant === 'user-dashboard' && (
            <>
              {ad.status === 'pending' && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleButtonClick(e, () => onEdit(ad))}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleButtonClick(e, () => onDelete(ad.id))}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
