'use client'

import { useState } from 'react'
import { Category, AdType, CATEGORIES } from '@/lib/types'
import { ChevronDown, HelpCircle, Users, Heart, Sparkles, Briefcase, Home, List, Venus, Mars } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  selectedCategory: Category | null
  onSelectCategory: (category: Category | null) => void
  selectedType: AdType | null
  onSelectType: (type: AdType | null) => void
}

const CATEGORY_ICONS: Record<Category | 'all', React.ReactNode> = {
  all: <List className="h-4 w-4" />,
  'girls-personal': <Venus className="h-4 w-4" />,
  'boys-personal': <Mars className="h-4 w-4" />,
  relationship: <Heart className="h-4 w-4" />,
  spa: <Sparkles className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  room: <Home className="h-4 w-4" />,
}

export function Sidebar({ selectedCategory, onSelectCategory, selectedType, onSelectType }: SidebarProps) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* How to Publish Ads */}
      <div className="mb-4 rounded-lg border border-border bg-card">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">How to Publish Ads?</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              showGuide && 'rotate-180'
            )}
          />
        </button>
        {showGuide && (
          <div className="border-t border-border px-4 pb-4 pt-2">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <p>
                  Start <a href="https://t.me/adlanka_otp_bot" target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">@adlanka_otp_bot</a> on Telegram
                </p>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <p>Send your number to the bot and login here with OTP</p>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <p>Transfer money & send receipt to <span className="font-medium text-foreground">@AdLanka</span> on Telegram</p>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <p>Click "Post Ad" once your balance is updated</p>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">5.</span>
                <p>Admin will review and your ad will be live!</p>
              </li>
            </ol>
          </div>
        )}
        {/* {showGuide && (
          <div className="border-t border-border px-4 pb-4 pt-2">
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">1.</span>
                Register using your phone number
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">2.</span>
                Login using OTP
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">3.</span>
                Top up account balance and send receipt
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">4.</span>
                Post your ad
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">5.</span>
                Admin reviews the ad
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-blue-600">6.</span>
                Ad becomes live
              </li>
            </ol>
          </div>
        )} */}
      </div>

      {/* Categories */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              selectedCategory === null
                ? 'bg-blue-50 text-blue-600'
                : 'text-foreground hover:bg-muted'
            )}
          >
            {CATEGORY_ICONS.all}
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                selectedCategory === cat.value
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {CATEGORY_ICONS[cat.value]}
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Types (mobile filters inside toggle menu). Hidden on large screens where type filter lives in the search bar. */}
      <div className="mt-4 rounded-lg border border-border bg-card p-4 lg:hidden">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Types
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectType(null)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              selectedType === null ? 'bg-blue-50 text-blue-600' : 'text-foreground hover:bg-muted'
            )}
          >
            <span>All Types</span>
          </button>
          <button
            onClick={() => onSelectType('vip')}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              selectedType === 'vip' ? 'bg-blue-50 text-blue-600' : 'text-foreground hover:bg-muted'
            )}
          >
            <span>VIP Ads</span>
          </button>
          <button
            onClick={() => onSelectType('super')}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              selectedType === 'super' ? 'bg-blue-50 text-blue-600' : 'text-foreground hover:bg-muted'
            )}
          >
            <span>Super Ads</span>
          </button>
          <button
            onClick={() => onSelectType('normal')}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
              selectedType === 'normal' ? 'bg-blue-50 text-blue-600' : 'text-foreground hover:bg-muted'
            )}
          >
            <span>Normal Ads</span>
          </button>
        </nav>
      </div>
    </aside>
  )
}
