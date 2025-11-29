import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const role = user.app_metadata?.role
    
    if (role === 'admin') {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                K
              </div>
              <span className="font-bold text-lg hidden sm:inline">Konect.co</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-pretty">
              Temukan Tim Terbaik untuk Kompetisi Anda
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-pretty">
              Platform yang tepat untuk menemukan talenta, membentuk tim, dan bersama-sama meraih kesuksesan dalam
              setiap kompetisi dan proyek kolaboratif
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/auth/sign-up">Mulai Sekarang</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="#features">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fitur Utama Konect</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk membangun tim impian dan sukses dalam kompetisi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Tim Finder",
                description: "Temukan anggota tim dengan skill yang Anda butuhkan dari database talenta kami",
              },
              {
                title: "Portofolio",
                description: "Tampilkan proyek dan pencapaian Anda untuk menarik tim yang tepat",
              },
              {
                title: "Event Hub",
                description: "Akses semua kompetisi, hackathon, dan peluang kolaborasi dalam satu tempat",
              },
              {
                title: "Premium",
                description: "Dapatkan fitur eksklusif untuk meningkatkan visibility dan peluang Anda",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-border bg-background hover:border-primary transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4 flex items-center justify-center">
                  {i === 0 && "👥"}
                  {i === 1 && "📁"}
                  {i === 2 && "🎯"}
                  {i === 3 && "⭐"}
                </div>
                <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Pengguna Aktif" },
              { number: "50+", label: "Kompetisi" },
              { number: "100+", label: "Tim Dibentuk" },
              { number: "1000+", label: "Proyek" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Siap Memulai?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Bergabunglah dengan ribuan pengguna yang telah menemukan tim sempurna mereka melalui Konect.co
          </p>
          <Button size="lg" asChild className="text-base">
            <Link href="/auth/sign-up">Buat Akun Gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Tentang</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tim Kami
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Karir
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Tim Finder
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Event Hub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Premium
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Dokumentasi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cookie
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Konect.co. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
