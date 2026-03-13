'use client'

import { Category, AdType, CATEGORIES } from '@/lib/types'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
  selectedType: AdType | null
  onTypeChange: (type: AdType | null) => void
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search ads by keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Desktop filters (categories + types). On mobile, filters live in the sidebar menu. */}
      <div className="hidden items-center gap-3 lg:flex">
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(value) => onCategoryChange(value === 'all' ? null : (value as Category))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedType || 'all'}
          onValueChange={(value) => onTypeChange(value === 'all' ? null : (value as AdType))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vip">VIP Ads</SelectItem>
            <SelectItem value="super">Super Ads</SelectItem>
            <SelectItem value="normal">Normal Ads</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
