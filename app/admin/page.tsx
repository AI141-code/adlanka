'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import {
  getUsers,
  getPendingAds,
  getAllAdsExceptPending,
  getReports,
  getTotalRevenue,
  updateAdStatus,
  updateAd,
  deleteAd,
  deleteReport,
  updateUserByPhone,
  getUserByPhone,
} from '@/lib/store'
import { Ad, User, Report } from '@/lib/types'
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
  DollarSign,
  Users,
  AlertTriangle,
  Trash2,
  Edit,
  Clock,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminAdCard } from '@/components/ad-card'

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [pendingAds, setPendingAds] = useState<Ad[]>([])
  const [allAds, setAllAds] = useState<Ad[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Balance update
  const [balancePhone, setBalancePhone] = useState('')
  const [balanceAmount, setBalanceAmount] = useState('')
  const [currentUserBalance, setCurrentUserBalance] = useState<number | null>(null)
  const [foundUser, setFoundUser] = useState<User | null>(null)
  
  // Edit ad
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  
  // Delete confirmation
  const [deleteAdId, setDeleteAdId] = useState<string | null>(null)

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const [pending, all, users, reports, revenue] = await Promise.all([
        getPendingAds(),
        getAllAdsExceptPending(),
        getUsers(),
        getReports(),
        getTotalRevenue(),
      ])
      setPendingAds(pending)
      setAllAds(all)
      setUsers(users.filter((u) => !u.isAdmin))
      setReports(reports)
      setTotalRevenue(revenue)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await refreshData()
    })()
  }, [])

  // Phone number lookup
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (balancePhone.length !== 9) {
        if (!cancelled) {
          setFoundUser(null)
          setCurrentUserBalance(null)
        }
        return
      }
      const fullPhone = `+94${balancePhone}`
      const u = await getUserByPhone(fullPhone)
      if (cancelled) return
      if (u && !u.isAdmin) {
        setFoundUser(u)
        setCurrentUserBalance(u.balance)
      } else {
        setFoundUser(null)
        setCurrentUserBalance(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [balancePhone])

  if (!user || !user.isAdmin) {
    router.push('/login')
    return null
  }

  const handleApprove = async (adId: string) => {
    try {
      await updateAdStatus(adId, 'approved')
      await refreshData()
      toast.success('Ad approved successfully')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve ad')
    }
  }

  const handleReject = async (adId: string) => {
    try {
      await updateAdStatus(adId, 'rejected')
      await refreshData()
      toast.success('Ad rejected')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reject ad')
    }
  }

  const handleDelete = async (adId: string) => {
    await deleteAd(adId)
    await refreshData()
    toast.success('Ad deleted')
    setDeleteAdId(null)
  }

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setEditTitle(ad.title)
    setEditDescription(ad.description)
  }

  const handleSaveEdit = async () => {
    if (!editingAd) return
    await updateAd(editingAd.id, { title: editTitle, description: editDescription })
    await refreshData()
    toast.success('Ad updated successfully')
    setEditingAd(null)
  }

  const handleUpdateBalance = async () => {
    if (!foundUser || !balanceAmount) return
    const newBalance = parseFloat(balanceAmount)
    if (isNaN(newBalance) || newBalance < 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    await updateUserByPhone(`+94${balancePhone}`, newBalance)
    await refreshData()
    setCurrentUserBalance(newBalance)
    setBalanceAmount('')
    toast.success('Balance updated successfully')
  }

  const handleDismissReport = async (reportId: string) => {
    await deleteReport(reportId)
    await refreshData()
    toast.success('Report dismissed')
  }

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 9)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage ads, users, and reports</p>
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
                  <div className="rounded-full bg-green-100 p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">Rs {totalRevenue.toLocaleString()}</p>
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
                  <div className="rounded-full bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reports</p>
                    <p className="text-2xl font-bold">{reports.length}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="pending">Pending Ads ({pendingAds.length})</TabsTrigger>
            <TabsTrigger value="all-ads">All Ads ({allAds.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="balance">Update Balance</TabsTrigger>
          </TabsList>

          {/* Pending Ads */}
          <TabsContent value="pending">
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
            ) : pendingAds.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending ads to review
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingAds.map((ad) => (
                  <AdminAdCard 
                    key={ad.id} 
                    ad={ad} 
                    variant="admin-pending"
                    onEdit={handleEdit}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Ads */}
          <TabsContent value="all-ads">
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
            ) : allAds.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No ads found
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {allAds.map((ad) => (
                  <AdminAdCard 
                    key={ad.id} 
                    ad={ad} 
                    variant="admin-all"
                    showStatus={true}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteAdId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="h-5 w-2/3 rounded bg-muted" />
                      <div className="h-4 w-full rounded bg-muted" />
                      <div className="flex justify-end gap-2 pt-2">
                        <div className="h-8 w-24 rounded bg-muted" />
                        <div className="h-8 w-24 rounded bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No reports
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const ad = getAdById(report.adId)
                  return (
                    <Card key={report.id}>
                      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={ad ? `/ad/${ad.id}` : '#'} className={ad ? 'hover:text-blue-600' : ''}>
                          <p className="font-medium">
                            Ad: {ad ? ad.title : 'Deleted Ad'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Reason: {report.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </Link>
                        <div className="flex gap-2">
                          {ad && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteAdId(ad.id)}
                            >
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete Ad
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissReport(report.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>All non-admin users</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="space-y-2">
                          <div className="h-4 w-28 rounded bg-muted" />
                          <div className="h-3 w-36 rounded bg-muted" />
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-4 w-32 rounded bg-muted" />
                          <div className="h-3 w-28 rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground">No users registered</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium">{u.phone}</p>
                          <p className="text-sm text-muted-foreground">
                            Registered: {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Balance: Rs {u.balance.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Spent: Rs {u.spent.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Update Balance */}
          <TabsContent value="balance">
            <Card>
              <CardHeader>
                <CardTitle>Update User Balance</CardTitle>
                <CardDescription>
                  Enter phone number to find user and update their balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="balance-phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex h-10 w-16 items-center justify-center rounded-md border border-input bg-muted text-sm">
                      +94
                    </div>
                    <Input
                      id="balance-phone"
                      type="tel"
                      placeholder="771234567"
                      value={balancePhone}
                      onChange={(e) => setBalancePhone(formatPhoneNumber(e.target.value))}
                      className="flex-1"
                      maxLength={9}
                    />
                  </div>
                </div>

                {foundUser ? (
                  <>
                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="font-medium text-green-800">User Found</p>
                      <p className="text-sm text-green-700">Phone: {foundUser.phone}</p>
                      <p className="text-sm text-green-700">
                        Current Balance: Rs {currentUserBalance?.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-700">
                        Total Spent: Rs {foundUser.spent.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="balance-amount">New Balance Amount (Rs)</Label>
                      <Input
                        id="balance-amount"
                        type="number"
                        placeholder="Enter new balance"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(e.target.value)}
                        min="0"
                      />
                    </div>

                    <Button onClick={handleUpdateBalance} className="bg-blue-600 hover:bg-blue-700">
                      Update Balance
                    </Button>
                  </>
                ) : balancePhone.length === 9 ? (
                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-red-800">User not found with this phone number</p>
                  </div>
                ) : null}
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
            {editingAd?.status === 'pending' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleSaveEdit()
                  if (editingAd) handleApprove(editingAd.id)
                }}
              >
                Save & Approve
              </Button>
            )}
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
