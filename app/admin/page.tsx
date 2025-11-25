import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, FileText, BarChart3 } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: profiles } = await supabase.from("profiles").select("id").limit(1)

  const { data: competitions } = await supabase.from("competitions").select("id")

  const { data: projects } = await supabase.from("projects").select("id")

  const { data: teams } = await supabase.from("teams").select("id")

  const stats = [
    {
      title: "Total Users",
      value: profiles?.length || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Kompetisi",
      value: competitions?.length || 0,
      icon: Trophy,
      color: "text-orange-500",
    },
    {
      title: "Proyek",
      value: projects?.length || 0,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Tim",
      value: teams?.length || 0,
      icon: BarChart3,
      color: "text-green-500",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Kelola platform Konect.co</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Aktivitas pengguna terkini di platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">Tidak ada aktivitas terbaru</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengguna Baru</CardTitle>
            <CardDescription>Pengguna yang baru mendaftar minggu ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">Tidak ada pengguna baru</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
