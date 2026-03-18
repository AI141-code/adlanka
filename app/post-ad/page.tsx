// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Header } from '@/components/header'
// import { Footer } from '@/components/footer'
// import { useAuth } from '@/lib/auth-context'
// import { createAd } from '@/lib/store'
// import { Category, AdType, CATEGORIES, AD_PRICES, AD_DURATIONS } from '@/lib/types'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { AlertCircle, Upload, X, CheckCircle, Loader2 } from 'lucide-react'
// import { toast } from 'sonner'
// import { cn } from '@/lib/utils'
// import { compressImage } from '@/lib/image-utils'

// export default function PostAdPage() {
//   const router = useRouter()
//   const { user, refreshUser } = useAuth()
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const [category, setCategory] = useState<Category | ''>('')
//   const [adType, setAdType] = useState<AdType>('normal')
//   const [title, setTitle] = useState('')
//   const [description, setDescription] = useState('')
//   const [imagePreview, setImagePreview] = useState<string | null>(null)
//   const [imageFile, setImageFile] = useState<File | null>(null)
//   const [error, setError] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isCompressing, setIsCompressing] = useState(false)
//   const [currentBalance, setCurrentBalance] = useState(0)

//   useEffect(() => {
//     if (user) setCurrentBalance(user.balance)
//   }, [user])

//   if (!user) { router.push('/login'); return null; }
//   if (user.isAdmin) { router.push('/admin'); return null; }

//   const price = AD_PRICES[adType]
//   const duration = AD_DURATIONS[adType]
//   const hasInsufficientBalance = currentBalance < price

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       try {
//         setError('')
//         setIsCompressing(true)
//         const compressed = await compressImage(file)
//         setImageFile(compressed)
//         const reader = new FileReader()
//         reader.onloadend = () => {
//           setImagePreview(reader.result as string)
//           setIsCompressing(false)
//         }
//         reader.readAsDataURL(compressed)
//       } catch (err) {
//         setError('Failed to process image.')
//         setIsCompressing(false)
//       }
//     }
//   }

//   const removeImage = () => {
//     setImagePreview(null)
//     setImageFile(null)
//     if (fileInputRef.current) fileInputRef.current.value = ''
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')

//     if (!category || !title.trim() || !description.trim()) {
//       setError('Please fill in all required fields.')
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       // --- STEP 1: PRE-CHECK BALANCE ---
//       const checkRes = await fetch('/api/ads/check-balance', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ adType }),
//       })
//       const checkJson = await checkRes.json()
      
//       if (!checkRes.ok) {
//         // STOP EVERYTHING HERE
//         setError(checkJson.error || 'Insufficient available balance.')
//         setIsSubmitting(false)
//         return 
//       }
      
//       // --- STEP 2: UPLOAD IMAGE (Only runs if Step 1 passed) ---
//       let uploadedUrl: string | null = null
//       if (imageFile) {
//         const form = new FormData()
//         form.append('file', imageFile)
//         const res = await fetch('/api/upload', { method: 'POST', body: form })
//         const json = await res.json().catch(() => ({}))
//         if (!res.ok) {
//            throw new Error(json?.error || 'Failed to upload image')
//         }
//         uploadedUrl = json.url as string
//       }

//       // --- STEP 3: CREATE AD ---
//       const newAd = await createAd(
//         user.id,
//         category as Category,
//         adType,
//         title.trim(),
//         description.trim(),
//         uploadedUrl
//       )

//       if (newAd) {
//         refreshUser()
//         toast.success('Ad submitted successfully!')
//         router.push('/dashboard')
//       }
//     } catch (e: any) {
//       setError(e.message || 'An error occurred.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="flex min-h-screen flex-col">
//       <Header />
//       <main className="container mx-auto flex-1 px-4 py-6">
//         <div className="mx-auto max-w-2xl">
//           <Card>
//             <CardHeader>
//               <CardTitle>Post New Ad</CardTitle>
//               <CardDescription>Ads will be reviewed before going live.</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {error && (
//                 <Alert variant="destructive" className="mb-6">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <div className="mb-6 rounded-lg bg-muted p-4 flex justify-between">
//                 <span className="text-sm">Balance:</span>
//                 <span className={cn("font-bold", hasInsufficientBalance ? "text-destructive" : "text-green-600")}>
//                   Rs {currentBalance.toLocaleString()}
//                 </span>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label>Category *</Label>
//                   <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
//                     <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
//                     <SelectContent>
//                       {CATEGORIES.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-3">
//                   <Label>Ad Type *</Label>
//                   <RadioGroup value={adType} onValueChange={(v) => setAdType(v as AdType)} className="grid gap-3 sm:grid-cols-3">
//                     {(['normal', 'super', 'vip'] as AdType[]).map((type) => (
//                       <label key={type} className={cn('flex cursor-pointer flex-col rounded-lg border-2 p-4', adType === type ? 'border-primary bg-primary/5' : 'border-border')}>
//                         <div className="flex items-center gap-2"><RadioGroupItem value={type} id={type} /> <span className="font-medium capitalize">{type}</span></div>
//                         <div className="mt-2 text-xs text-muted-foreground">Rs {AD_PRICES[type].toLocaleString()}</div>
//                       </label>
//                     ))}
//                   </RadioGroup>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Title *</Label>
//                   <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Description *</Label>
//                   <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." rows={4} />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Photo (Optional)</Label>
//                   {imagePreview ? (
//                     <div className="relative w-40 h-40">
//                       <img src={imagePreview} className="w-full h-full rounded-lg object-cover" />
//                       <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="h-4 w-4"/></button>
//                     </div>
//                   ) : (
//                     <div onClick={() => !isCompressing && fileInputRef.current?.click()} className="h-40 w-40 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer rounded-lg hover:bg-muted">
//                       {isCompressing ? <Loader2 className="animate-spin" /> : <Upload />}
//                       <span className="text-xs mt-2">{isCompressing ? "Processing..." : "Upload"}</span>
//                     </div>
//                   )}
//                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                 </div>

//                 <Button type="submit" disabled={isSubmitting || isCompressing || hasInsufficientBalance} className="w-full">
//                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Ad"}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }
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
import { AlertCircle, Upload, X, CheckCircle } from 'lucide-react'
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
  const [currentBalance, setCurrentBalance] = useState(0)

  useEffect(() => {
    if (user) {
      setCurrentBalance(user.balance)
    }
  }, [user])

  // Redirect if not logged in or is admin
  if (!user) {
    router.push('/login')
    return null
  }

  if (user.isAdmin) {
    router.push('/admin')
    return null
  }

  const price = AD_PRICES[adType]
  const duration = AD_DURATIONS[adType]
  const hasInsufficientBalance = currentBalance < price

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       setError('Image size must be less than 5MB')
  //       return
  //     }
  //     setImageFile(file)
  //     const reader = new FileReader()
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result as string)
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // }
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Show a "Processing..." toast or state if you want
      try {
        setError('')
        
        // 2. Compress the image before saving it to state
        const compressed = await compressImage(file)
        
        setImageFile(compressed)
  
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(compressed)
      } catch (err) {
        setError('Failed to process image. Try a different one.')
      }
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!category) {
      setError('Please select a category')
      return
    }

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!description.trim()) {
      setError('Please enter a description')
      return
    }

    if (hasInsufficientBalance) {
      setError('Insufficient balance. Please top up your account.')
      return
    }

    setIsSubmitting(true)

    
    try {
      let uploadedUrl: string | null = null
      if (imageFile) {
        const form = new FormData()
        form.append('file', imageFile)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'Failed to upload image')
        uploadedUrl = json.url as string
      }

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
        toast.success('Ad submitted successfully! It will be reviewed by admin.')
        router.push('/dashboard')
      } else {
        setError('Failed to create ad. Please try again.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred. Please try again.')
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
              <CardDescription>
                Fill in the details below to post your ad. Ads will be reviewed before going live.
              </CardDescription>
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
                  <span className={cn(
                    "font-semibold",
                    hasInsufficientBalance ? "text-destructive" : "text-green-600"
                  )}>
                    Rs {currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ad Type */}
                <div className="space-y-3">
                  <Label>Ad Type *</Label>
                  <RadioGroup
                    value={adType}
                    onValueChange={(v) => setAdType(v as AdType)}
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    {(['normal', 'super', 'vip'] as AdType[]).map((type) => (
                      <label
                        key={type}
                        className={cn(
                          'flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-colors',
                          adType === type
                            ? type === 'vip'
                              ? 'border-green-500 bg-green-50'
                              : type === 'super'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-blue-500 bg-blue-50'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value={type} id={type} />
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Rs {AD_PRICES[type].toLocaleString()}</p>
                          <p>{AD_DURATIONS[type]} days</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter ad title"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{title.length}/100</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your ad in detail..."
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{description.length}/1000</p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 w-40 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-muted"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">Upload Image</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">Max 5MB. JPG, PNG, or GIF.</p>
                </div>

                {/* Summary */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-3 font-semibold">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ad Type:</span>
                      <span className="capitalize">{adType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{duration} days</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-semibold">Rs {price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {hasInsufficientBalance && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance. You need Rs {(price - currentBalance).toLocaleString()} more.
                      Please top up your account via Telegram.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || hasInsufficientBalance}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    'Submitting...'
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
