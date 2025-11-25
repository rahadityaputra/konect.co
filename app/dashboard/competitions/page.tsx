import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"

export default async function CompetitionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: competitions } = await supabase
    .from("competitions")
    .select("*")
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "ongoing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "closed":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kompetisi</h1>
          <p className="text-muted-foreground mt-2">Jelajahi dan daftar untuk kompetisi terbaru</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/competitions/create">+ Buat Kompetisi</Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "open", "ongoing", "closed"].map((status) => (
          <Button key={status} variant={status === "all" ? "default" : "outline"} size="sm">
            {status === "all" ? "Semua" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions && competitions.length > 0 ? (
          competitions.map((comp: any) => (
            <Card key={comp.id} className="hover:border-primary transition-colors overflow-hidden">
              {comp.image_url && (
                <img src={comp.image_url || "/placeholder.svg"} alt={comp.title} className="w-full h-40 object-cover" />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="line-clamp-1">{comp.title}</CardTitle>
                    <CardDescription>{comp.category}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(comp.status)}>{comp.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{comp.description}</p>
                  <div className="space-y-2">
                    {comp.deadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(comp.deadline).toLocaleDateString("id-ID")}</span>
                      </div>
                    )}
                    {comp.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{comp.location}</span>
                      </div>
                    )}
                    {comp.max_team_size && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Max {comp.max_team_size} anggota</span>
                      </div>
                    )}
                    {comp.prize_pool && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span>{comp.prize_pool}</span>
                      </div>
                    )}
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link href={`/dashboard/competitions/${comp.id}`}>Lihat Detail</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada kompetisi tersedia</p>
          </div>
        )}
      </div>
    </div>
  )
}
