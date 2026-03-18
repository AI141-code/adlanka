'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { createAd } from '@/lib/store'
import { Category, AdType, CATEGORIES, AD_PRICES, AD_DURATIONS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertCircle, Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { compressImage } from '@/lib/image-utils'

export default function PostAdPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState<Category | ''>('')
  const [adType, setAdType] = useState<AdType>('normal')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false) // New State
  const [currentBalance, setCurrentBalance] = useState(0)

  useEffect(() => {
    if (user) {
      setCurrentBalance(user.balance)
    }
  }, [user])

  if (!user) { router.push('/login'); return null; }
  if (user.isAdmin) { router.push('/admin'); return null; }

  const price = AD_PRICES[adType]
  const duration = AD_DURATIONS[adType]
  const hasInsufficientBalance = currentBalance < price

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setError('')
        setIsCompressing(true)
        
        // 1. Compress
        const compressed = await compressImage(file)
        setImageFile(compressed)
  
        // 2. Preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
          setIsCompressing(false)
        }
        reader.readAsDataURL(compressed)
      } catch (err) {
        setError('Failed to process image.')
        setIsCompressing(false)
      }
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!category || !title.trim() || !description.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. PRE-CHECK BALANCE (Server Side)
      const checkRes = await fetch('/api/ads/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adType }),
      })
      const checkJson = await checkRes.json()
      
      if (!checkRes.ok) {
        throw new Error(checkJson.error || 'Insufficient available balance.')
      }
      
      // 2. UPLOAD IMAGE (Only if balance is okay)
      let uploadedUrl: string | null = null
      if (imageFile) {
        const form = new FormData()
        form.append('file', imageFile)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'Failed to upload image')
        uploadedUrl = json.url as string
      }

      // 3. CREATE AD
      const newAd = await createAd(
        user.id,
        category as Category,
        adType,
        title.trim(),
        description.trim(),
        uploadedUrl
      )

      if (newAd) {
        refreshUser()
        toast.success('Ad submitted successfully!')
        router.push('/dashboard')
      } else {
        throw new Error('Failed to create ad. Please try again.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Post New Ad</CardTitle>
              <CardDescription>Ads will be reviewed before going live.</CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Balance:</span>
                  <span className={cn("font-semibold", hasInsufficientBalance ? "text-destructive" : "text-green-600")}>
                    Rs {currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category & Ad Type UI remains same... */}
                {/* [Title and Description fields remain same...] */}

                {/* Updated Image Upload UI */}
                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-40 w-40 rounded-lg object-cover" />
                      <button type="button" onClick={removeImage} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => !isCompressing && fileInputRef.current?.click()}
                      className={cn(
                        "flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-all",
                        isCompressing ? "opacity-50 cursor-wait bg-muted" : "hover:border-primary hover:bg-muted"
                      )}
                    >
                      {isCompressing ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <span className="mt-2 text-xs font-medium">Compressing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="mt-2 text-sm text-muted-foreground">Upload Image</span>
                        </>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isCompressing} />
                  <p className="text-xs text-muted-foreground">Images are automatically optimized to save data.</p>
                </div>

                {/* Summary Section remains same... */}

                <Button
                  type="submit"
                  disabled={isSubmitting || isCompressing || hasInsufficientBalance}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : isCompressing ? (
                    'Processing Image...'
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Ad for Review
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}