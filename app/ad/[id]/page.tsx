'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ReportDialog } from '@/components/report-dialog'
import { Ad, CATEGORY_LABELS, AdType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, Flag, ImageIcon, User } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const AD_TYPE_STYLES: Record<AdType, { border: string; label: string; labelBg: string }> = {
  vip: {
    border: 'border-green-500 border-2',
    label: 'VIP Ad',
    labelBg: 'bg-green-500 text-white',
  },
  super: {
    border: 'border-yellow-500 border-2',
    label: 'Super Ad',
    labelBg: 'bg-yellow-500 text-white',
  },
  normal: {
    border: 'border-border',
    label: 'Normal Ad',
    labelBg: 'bg-muted text-muted-foreground',
  },
}

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ad, setAd] = useState<Ad | null>(null)
  const [posterPhone, setPosterPhone] = useState<string | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setNotFound(false)
    ;(async () => {
      try {
        const res = await fetch(`/api/ads/${encodeURIComponent(id)}`)
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok && json?.ad) {
          setAd(json.ad as Ad)
          setPosterPhone(json.posterPhone ?? null)
          setNotFound(false)
        } else {
          setAd(null)
          setPosterPhone(null)
          setNotFound(true)
        }
      } catch {
        if (!cancelled) {
          setAd(null)
          setPosterPhone(null)
          setNotFound(true)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-6">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="mx-auto max-w-2xl space-y-6">
            <Card className="overflow-hidden">
              <AspectRatio ratio={16 / 9} className="bg-muted">
                <Skeleton className="h-full w-full" />
              </AspectRatio>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 w-3/4" />

              <Card>
                <CardContent className="p-4">
                  <Skeleton className="mb-3 h-5 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-11/12" />
                  <Skeleton className="mt-2 h-4 w-10/12" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-64 sm:col-span-2" />
                </CardContent>
              </Card>

              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !ad) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">Ad Not Found</h1>
            <p className="mb-4 text-muted-foreground">This ad may have been removed or expired.</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const styles = AD_TYPE_STYLES[ad.adType]
  const createdDate = new Date(ad.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const expiresDate = new Date(ad.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Image - Fixed 16:9 aspect ratio */}
          <Card className={cn('overflow-hidden', styles.border)}>
            <AspectRatio ratio={16 / 9} className="bg-muted">
              {ad.imageUrl ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </AspectRatio>
          </Card>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{CATEGORY_LABELS[ad.category]}</Badge>
              <Badge className={styles.labelBg}>{styles.label}</Badge>
              {ad.status === 'pending' && (
                <Badge variant="secondary">Pending Approval</Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">{ad.title}</h1>

            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{ad.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Posted:</span>
                  <span>{createdDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{expiresDate}</span>
                </div>
                {posterPhone && (
                  <div className="flex items-center gap-2 text-sm sm:col-span-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Posted by {posterPhone.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, '$1$2XXXXX$4')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setIsReportOpen(true)}
            >
              <Flag className="mr-2 h-4 w-4" />
              Report Ad
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      <ReportDialog
        adId={ad.id}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </div>
  )
}
