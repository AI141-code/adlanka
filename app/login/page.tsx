'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, Key, AlertCircle, MessageCircle, Shield, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { requestOtp, verifyOtp, adminLogin, user } = useAuth()
  const [step, setStep] = useState<'phone' | 'otp' | 'admin'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Redirect if already logged in (must be in effect, not render)
  useEffect(() => {
    if (!user) return
    router.push(user.isAdmin ? '/admin' : '/dashboard')
  }, [router, user])

  if (user) return null

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '')
    return digits.slice(0, 9)
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (phone.length !== 9) {
      setError('Please enter exactly 9 digits after +94')
      return
    }

    const fullPhone = `+94${phone}`
    
    // Check if admin phone
    if (fullPhone === '+94771234567') {
      setStep('admin')
    } else {
      setIsLoading(true)
      const result = await requestOtp(fullPhone)
      setIsLoading(false)
      if (!result.success) {
        setError(result.error || 'Failed to send OTP')
        return
      }
      setStep('otp')
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const fullPhone = `+94${phone}`
    const result = await verifyOtp(fullPhone, otp)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const fullPhone = `+94${phone}`
    const result = await adminLogin(fullPhone, password)

    if (result.success) {
      router.push('/admin')
    } else {
      setError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              {step === 'admin' ? (
                <Shield className="h-6 w-6 text-blue-600" />
              ) : (
                <Phone className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <CardTitle>
              {step === 'phone' && 'Login/Register to AdLanka'}
              {step === 'otp' && 'Enter OTP Code'}
              {step === 'admin' && 'Admin Login'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' && 'Enter your Sri Lankan phone number to continue'}
              {step === 'otp' && 'We sent a code to your Telegram'}
              {step === 'admin' && 'Enter your admin password'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex h-10 w-16 items-center justify-center rounded-md border border-input bg-muted text-sm">
                      +94
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="771234567"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      className="flex-1"
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter 9 digits (e.g., 771234567)
                  </p>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? 'Sending...' : 'Continue'}
                </Button>
              </form>
            )} */}

            {step === 'phone' && (
              <div className="space-y-6">
              {/* Toggle Button */}
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <span>How to Login or Register?</span>
                  </div>
                  {showInstructions ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {/* Collapsible Instruction Box */}
                {showInstructions && (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-3">
                      <p className="font-semibold text-slate-900">New Users (Registration):</p>
                      <ul className="mt-2 space-y-2">
                        <li className="flex gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>Search and start <a href="https://t.me/adlanka_otp_bot" target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">@adlanka_otp_bot</a> on Telegram</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>Click the <strong>"Share My Number"</strong> button in the bot</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t pt-3">
                      <p className="font-semibold text-slate-900">Returning Users:</p>
                      <p className="mt-1 text-slate-600 italic">
                        Just enter your number below to receive your OTP via Telegram.
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone Input Form */}
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="flex h-10 w-16 items-center justify-center rounded-md border border-input bg-muted text-sm">
                        +94
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="771234567"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        className="flex-1"
                        maxLength={9}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter 9 digits (e.g., 771234567)
                    </p>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isLoading ? 'Sending...' : 'Continue'}
                  </Button>
                </form>
              </div>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Check your Telegram app</strong>
                    <br />
                    We just sent a 6-digit verification code to you via the 
                    <span className="font-semibold"> @adlanka_otp_bot</span>.
                  </AlertDescription>
                  {/* <AlertDescription className="text-blue-800">
                    <strong>Testing mode enabled.</strong>
                    <br />
                    Enter OTP: <code className="rounded bg-blue-100 px-1 font-mono">123456</code>
                  </AlertDescription> */}
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('phone')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={otp.length !== 6 || isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  You must have Telegram installed to receive OTP codes.
                </p>
              </form>
            )}

            {step === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('phone')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!password || isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
            )}

            {/* <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Register with your phone
              </Link>
            </div> */}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
