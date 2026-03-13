'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Home, LogIn, LogOut, Plus, User, Shield, Menu, X } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              AL
            </div>
            <span className="text-xl font-semibold">
              Ad<span className="text-blue-600">Lanka</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            {user ? (
              <>
                {user.isAdmin ? (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                      </Button>
                    </Link>
                    <Link href="/post-ad">
                      <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        <span>Post Ad</span>
                      </Button>
                    </Link>
                  </>
                )}
                <Button variant="ghost" size="sm" className="gap-2" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav menu */}
        {mobileMenuOpen && (
          <nav className="flex flex-col gap-1 pb-3 md:hidden">
            <Link href="/" onClick={closeMobileMenu}>
              <Button variant="ghost" size="sm" className="mt-1 w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>

            {user ? (
              <>
                {user.isAdmin ? (
                  <Link href="/admin" onClick={closeMobileMenu}>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                    <Link href="/post-ad" onClick={closeMobileMenu}>
                      <Button size="sm" className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        <span>Post Ad</span>
                      </Button>
                    </Link>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    closeMobileMenu()
                    logout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={closeMobileMenu}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
