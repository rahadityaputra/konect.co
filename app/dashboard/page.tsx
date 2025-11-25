import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Trophy, FileText } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: myTeams } = await supabase.from("team_members").select("teams(*)").eq("user_id", user.id)

  const { data: myProjects } = await supabase.from("projects").select("*").eq("user_id", user.id).limit(3)

  const { data: competitions } = await supabase.from("competitions").select("*").eq("status", "open").limit(3)

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Selamat Datang, {profile?.full_name || "Budi"}!</h1>
          <p className="text-muted-foreground mt-2">Lihat ringkasan aktivitas dan data Anda di sini</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teams/create">Buat Tim Baru</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Tim",
            value: myTeams?.length || 0,
            icon: Users,
            color: "text-blue-500",
          },
          {
            title: "Proyek",
            value: myProjects?.length || 0,
            icon: FileText,
            color: "text-purple-500",
          },
          {
            title: "Kompetisi Terbuka",
            value: competitions?.length || 0,
            icon: Trophy,
            color: "text-orange-500",
          },
          {
            title: "Notifikasi",
            value: 3,
            icon: Calendar,
            color: "text-green-500",
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kompetisi Terbaru */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kompetisi Terbuka</CardTitle>
              <CardDescription>Kompetisi yang sedang membuka pendaftaran</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitions && competitions.length > 0 ? (
                  competitions.map((comp: any) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{comp.title}</h4>
                        <p className="text-sm text-muted-foreground">{comp.category}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/competitions/${comp.id}`}>Lihat</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Tidak ada kompetisi terbuka saat ini</p>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/dashboard/competitions">Lihat Semua Kompetisi</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Kalender */}
        <Card>
          <CardHeader>
            <CardTitle>Agenda Hari Ini</CardTitle>
            <CardDescription>Acara yang akan datang</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium">Tidak ada acara hari ini</div>
                <div className="text-xs text-muted-foreground mt-1">Cek kompetisi untuk mendapatkan acara</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proyek Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle>Proyek Saya</CardTitle>
          <CardDescription>Proyek terbaru yang Anda buat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myProjects && myProjects.length > 0 ? (
              myProjects.map((project: any) => (
                <div
                  key={project.id}
                  className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{project.title}</h4>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{project.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.category}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                Anda belum membuat proyek.{" "}
                <Link href="/dashboard/projects/create" className="text-primary hover:underline">
                  Buat sekarang
                </Link>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
            <Link href="/dashboard/projects">Kelola Proyek</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
