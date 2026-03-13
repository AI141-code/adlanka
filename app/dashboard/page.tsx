'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { getAdsByUser, deleteAd, getTransactions, updateAd } from '@/lib/store'
import { Ad, Transaction } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Wallet,
  Plus,
  Clock,
  CheckCircle,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AdminAdCard } from '@/components/ad-card'

export default function DashboardPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [spent, setSpent] = useState(0)
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Edit ad state
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    if (!user) return
    setBalance(user.balance)
    setSpent(user.spent)
    ;(async () => {
      setIsLoading(true)
      try {
        const [ads, tx] = await Promise.all([getAdsByUser(user.id), getTransactions()])
        setAds(ads)
        setTransactions(tx)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [user])

  if (!user) {
    router.push('/login')
    return null
  }

  if (user.isAdmin) {
    router.push('/admin')
    return null
  }

  const activeAds = ads.filter(a => a.status === 'approved' && new Date(a.expiresAt) > new Date())
  const pendingAds = ads.filter(a => a.status === 'pending')
  const allAdsExceptExpired = ads.filter(a => a.status !== 'expired')

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setEditTitle(ad.title)
    setEditDescription(ad.description)
  }

  const handleSaveEdit = async () => {
    if (!editingAd) return
    await updateAd(editingAd.id, { title: editTitle, description: editDescription })
    setAds(await getAdsByUser(user.id))
    toast.success('Ad updated successfully')
    setEditingAd(null)
  }

  const handleDelete = async (adId: string) => {
    await deleteAd(adId)
    setAds(await getAdsByUser(user.id))
    refreshUser()
    toast.success('Ad deleted successfully')
    setDeleteAdId(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your ads and account</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-5 w-16 rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Balance</p>
                    <p className="text-2xl font-bold">Rs {balance.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Ads</p>
                    <p className="text-2xl font-bold">{activeAds.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Ads</p>
                    <p className="text-2xl font-bold">{pendingAds.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">Rs {spent.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Top Up Info */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Top Up Your Account</p>
                <p className="text-sm text-blue-700">
                  Transfer money to our bank account and send receipt via Telegram to @AdLanka
                </p>
              </div>
            </div>
            <Link href="/post-ad">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Post New Ad
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="my-ads">
          <TabsList className="mb-4">
            <TabsTrigger value="my-ads">My Ads</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="my-ads">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="space-y-3 p-4">
                      <div className="h-5 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-full rounded bg-muted" />
                      <div className="h-4 w-5/6 rounded bg-muted" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-8 w-20 rounded bg-muted" />
                        <div className="h-8 w-20 rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allAdsExceptExpired.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-muted-foreground">You haven&apos;t posted any ads yet</p>
                  <Link href="/post-ad">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Ad
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {allAdsExceptExpired.map((ad) => (
                  <AdminAdCard 
                    key={ad.id} 
                    ad={ad} 
                    variant="user-dashboard"
                    showStatus={true}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteAdId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your account top-ups and ad spending</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="space-y-2">
                          <div className="h-4 w-24 rounded bg-muted" />
                          <div className="h-3 w-32 rounded bg-muted" />
                        </div>
                        <div className="h-5 w-16 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'font-semibold',
                            tx.type === 'topup' ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {tx.type === 'topup' ? '+' : '-'}Rs {tx.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Edit Ad Dialog */}
      <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
            <DialogDescription>Update the ad title and description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAd(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAdId} onOpenChange={() => setDeleteAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAdId && handleDelete(deleteAdId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
