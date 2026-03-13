'use client'

import { Ad, User, Report, Transaction, AdStatus, Category, AdType } from './types'

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (json as any)?.error || `Request failed (${res.status})`
    throw new Error(message)
  }
  return json as T
}

// Users (admin)
export async function getUsers(): Promise<User[]> {
  const { users } = await apiJson<{ users: User[] }>('/api/admin/users')
  return users
}

export async function getUserByPhone(phone: string): Promise<User | undefined> {
  const { user } = await apiJson<{ user: User | null }>(`/api/admin/users/lookup?phoneNumber=${encodeURIComponent(phone)}`, {
    method: 'GET',
  })
  return user ?? undefined
}

// Ads
export async function getApprovedAds(): Promise<Ad[]> {
  const { ads } = await apiJson<{ ads: Ad[] }>('/api/ads/approved')
  return ads
}

export async function getAdsByUser(_userId: string): Promise<Ad[]> {
  const { ads } = await apiJson<{ ads: Ad[] }>('/api/ads/user')
  return ads
}

export async function getAdById(id: string): Promise<Ad | undefined> {
  try {
    const { ad } = await apiJson<{ ad: Ad }>(`/api/ads/${encodeURIComponent(id)}`)
    return ad
  } catch {
    return undefined
  }
}

export async function createAd(
  _userId: string,
  category: Category,
  adType: AdType,
  title: string,
  description: string,
  imageUrl: string | null
): Promise<Ad | null> {
  try {
    const { ad } = await apiJson<{ ad: Ad }>('/api/ads', {
      method: 'POST',
      body: JSON.stringify({ category, adType, title, description, imageUrl }),
    })
    return ad
  } catch {
    return null
  }
}

export async function updateAd(adId: string, updates: Partial<Pick<Ad, 'title' | 'description'>>): Promise<Ad | undefined> {
  const { ad } = await apiJson<{ ad: Ad }>(`/api/ads/${encodeURIComponent(adId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return ad
}

export async function deleteAd(adId: string): Promise<boolean> {
  await apiJson<{ success: true }>(`/api/ads/${encodeURIComponent(adId)}`, { method: 'DELETE' })
  return true
}

// Admin ads
export async function getPendingAds(): Promise<Ad[]> {
  const { ads } = await apiJson<{ ads: Ad[] }>('/api/admin/ads/pending')
  return ads
}

export async function getAllAdsExceptPending(): Promise<Ad[]> {
  const { ads } = await apiJson<{ ads: Ad[] }>('/api/admin/ads/all')
  return ads
}

export async function updateAdStatus(adId: string, status: AdStatus): Promise<boolean> {
  if (status !== 'approved' && status !== 'rejected') throw new Error('Invalid status')
  await apiJson<{ success: true }>(`/api/admin/ads/${encodeURIComponent(adId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return true
}

// Reports
export async function getReports(): Promise<Report[]> {
  const { reports } = await apiJson<{ reports: Report[] }>('/api/admin/reports')
  return reports
}

export async function createReport(adId: string, reason: string): Promise<Report> {
  const { report } = await apiJson<{ report: Report }>('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ adId, reason }),
  })
  return report
}

export async function deleteReport(reportId: string): Promise<boolean> {
  await apiJson<{ success: true }>('/api/admin/reports', { method: 'DELETE', body: JSON.stringify({ reportId }) })
  return true
}

// Transactions (user)
export async function getTransactions(): Promise<Transaction[]> {
  const { transactions } = await apiJson<{ transactions: Transaction[] }>('/api/transactions/me')
  return transactions
}

// Balance update (admin)
export async function updateUserByPhone(phone: string, balance: number): Promise<boolean> {
  await apiJson<{ success: true }>('/api/admin/users/balance', {
    method: 'PATCH',
    body: JSON.stringify({ phoneNumber: phone, balance }),
  })
  return true
}

// Stats
export async function getTotalRevenue(): Promise<number> {
  const users = (await getUsers()).filter((u) => !u.isAdmin)
  return users.reduce((sum, u) => sum + u.balance + u.spent, 0)
}
