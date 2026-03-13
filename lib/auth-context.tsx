'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from './types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  requestOtp: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>
  verifyOtp: (phoneNumber: string, otpCode: string) => Promise<{ success: boolean; error?: string }>
  adminLogin: (phoneNumber: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        const json = await res.json().catch(() => ({}))
        if (!cancelled) setUser(json?.user ?? null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const refreshUser = () => {
    ;(async () => {
      const res = await fetch('/api/auth/me')
      const json = await res.json().catch(() => ({}))
      setUser(json?.user ?? null)
    })()
  }

  const requestOtp = async (phoneNumber: string) => {
    try {
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) return { success: false, error: json?.error || 'Failed to request OTP' }
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to request OTP' }
    }
  }

  const verifyOtp = async (phoneNumber: string, otpCode: string) => {
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) return { success: false, error: json?.error || 'OTP verification failed' }
      setUser(json.user)
      return { success: true }
    } catch {
      return { success: false, error: 'OTP verification failed' }
    }
  }

  const adminLogin = async (phoneNumber: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) return { success: false, error: json?.error || 'Login failed' }
      setUser(json.user)
      return { success: true }
    } catch {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    ;(async () => {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
      setUser(null)
    })()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, requestOtp, verifyOtp, adminLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
