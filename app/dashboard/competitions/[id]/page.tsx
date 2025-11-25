import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy, ArrowLeft } from "lucide-react"

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: competition } = await supabase.from("competitions").select("*").eq("id", params.id).single()

  if (!competition) {
    redirect("/dashboard/competitions")
  }

  const { data: teams } = await supabase.from("teams").select("*, team_members(*)").eq("competition_id", params.id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/competitions">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{competition.title}</h1>
          <p className="text-muted-foreground mt-1">{competition.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tentang Kompetisi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{competition.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Kompetisi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competition.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{new Date(competition.deadline).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                )}
                {competition.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lokasi</p>
                      <p className="font-semibold">{competition.location}</p>
                    </div>
                  </div>
                )}
                {competition.max_team_size && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ukuran Tim Maksimal</p>
                      <p className="font-semibold">{competition.max_team_size} anggota</p>
                    </div>
                  </div>
                )}
                {competition.prize_pool && (
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hadiah</p>
                      <p className="font-semibold">{competition.prize_pool}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardHeader>
              <CardTitle>Tim yang Terdaftar</CardTitle>
              <CardDescription>{teams?.length || 0} tim telah mendaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams && teams.length > 0 ? (
                  teams.map((team: any) => (
                    <div key={team.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{team.name}</h4>
                          <p className="text-sm text-muted-foreground">{team.team_members?.length || 0} anggota</p>
                        </div>
                        <Badge>{team.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Belum ada tim yang terdaftar</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className="w-full justify-center">{competition.status}</Badge>
              </div>
              <Button asChild className="w-full">
                <Link href={`/dashboard/teams/create?competition=${params.id}`}>Buat Tim untuk Kompetisi Ini</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href={`/dashboard/team-finder?competition=${params.id}`}>Cari Anggota Tim</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
