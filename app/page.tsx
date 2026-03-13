'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { SearchBar } from '@/components/search-bar'
import { AdCard } from '@/components/ad-card'
import { Footer } from '@/components/footer'
import { ReportDialog } from '@/components/report-dialog'
import { getApprovedAds } from '@/lib/store'
import { Ad, Category, AdType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const ADS_PER_PAGE = 15

export default function HomePage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedType, setSelectedType] = useState<AdType | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [reportAdId, setReportAdId] = useState<string | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      try {
        setAds(await getApprovedAds())
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchesSearch =
        searchQuery === '' ||
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === null || ad.category === selectedCategory
      const matchesType = selectedType === null || ad.adType === selectedType
      return matchesSearch && matchesCategory && matchesType
    })
  }, [ads, searchQuery, selectedCategory, selectedType])

  const totalPages = Math.ceil(filteredAds.length / ADS_PER_PAGE)
  const paginatedAds = filteredAds.slice(
    (currentPage - 1) * ADS_PER_PAGE,
    currentPage * ADS_PER_PAGE
  )

  const handleReport = (adId: string) => {
    setReportAdId(adId)
    setIsReportOpen(true)
  }

  const handleCategoryChange = (category: Category | null) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar (desktop) */}
          <div className="hidden lg:block lg:w-64 lg:shrink-0">
            <Sidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile filters & guide toggle */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <p className="text-sm font-medium text-muted-foreground">
                Filters &amp; How to publish ads
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFiltersOpen((open) => !open)}
              >
                {isMobileFiltersOpen ? 'Hide menu' : 'Show menu'}
              </Button>
            </div>
            {isMobileFiltersOpen && (
              <div className="mb-4 lg:hidden">
                <Sidebar
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategoryChange}
                  selectedType={selectedType}
                  onSelectType={setSelectedType}
                />
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
              />
            </div>

            {/* Ads Grid */}
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex overflow-hidden rounded-lg border border-border bg-card">
                    <Skeleton className="h-32 w-32 shrink-0 sm:h-40 sm:w-40" />
                    <div className="flex flex-1 flex-col p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="mb-2 h-4 w-10/12" />
                      <Skeleton className="mb-2 h-4 w-9/12" />
                      <Skeleton className="mt-auto h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
                <p className="text-lg font-medium text-muted-foreground">No ads found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {paginatedAds.map((ad) => (
                  <AdCard key={ad.id} ad={ad} onReport={handleReport} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <ReportDialog
        adId={reportAdId}
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
      />
    </div>
  )
}
