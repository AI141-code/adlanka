import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                AL
              </div>
              <span className="text-lg font-semibold">
                Ad<span className="text-blue-600">Lanka</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sri Lanka&apos;s modern classified ads platform. Post and browse ads for jobs, rooms, and personal ads.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 font-semibold">Quick Links</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/" className="block text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link href="/faq" className="block text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
              <Link href="/faq#how-to-post" className="block text-muted-foreground hover:text-foreground">
                How to Post Ad
              </Link>
              <Link href="/faq#ad-types" className="block text-muted-foreground hover:text-foreground">
                Ad Types & Prices
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-3 font-semibold">Categories</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/?category=girls-personal" className="block text-muted-foreground hover:text-foreground">
                Girls Personal
              </Link>
              <Link href="/?category=boys-personal" className="block text-muted-foreground hover:text-foreground">
                Boys Personal
              </Link>
              <Link href="/?category=relationship" className="block text-muted-foreground hover:text-foreground">
                Relationship Ads
              </Link>
              <Link href="/?category=spa" className="block text-muted-foreground hover:text-foreground">
                Spa Ads
              </Link>
              <Link href="/?category=job" className="block text-muted-foreground hover:text-foreground">
                Job Ads
              </Link>
              <Link href="/?category=room" className="block text-muted-foreground hover:text-foreground">
                Room Ads
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>For payment verification:</p>
              <p>Telegram</p>
              <p className="text-foreground">@AdLanka</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 AdLanka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
