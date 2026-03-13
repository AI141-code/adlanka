export type AdType = 'normal' | 'super' | 'vip'
export type AdStatus = 'pending' | 'approved' | 'rejected' | 'expired'
export type Category = 'girls-personal' | 'boys-personal' | 'relationship' | 'spa' | 'job' | 'room'

export interface User {
  id: string
  phone: string
  balance: number
  spent: number
  isAdmin: boolean
  createdAt: string
}

export interface Ad {
  id: string
  userId: string
  category: Category
  adType: AdType
  title: string
  description: string
  price: number
  imageUrl: string | null
  status: AdStatus
  createdAt: string
  expiresAt: string
}

export interface Report {
  id: string
  adId: string
  reason: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'topup' | 'spent'
  createdAt: string
}

export const AD_PRICES: Record<AdType, number> = {
  normal: 500,
  super: 1000,
  vip: 2000,
}

export const AD_DURATIONS: Record<AdType, number> = {
  normal: 3,
  super: 4,
  vip: 5,
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'girls-personal', label: 'Girls Personal' },
  { value: 'boys-personal', label: 'Boys Personal' },
  { value: 'relationship', label: 'Relationship Ads' },
  { value: 'spa', label: 'Spa Ads' },
  { value: 'job', label: 'Job Ads' },
  { value: 'room', label: 'Room Ads' },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  'girls-personal': 'Girls Personal',
  'boys-personal': 'Boys Personal',
  relationship: 'Relationship',
  spa: 'Spa',
  job: 'Jobs',
  room: 'Rooms',
}
