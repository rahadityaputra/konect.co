import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Building, Heart, Clock } from "lucide-react"

interface Params {
  id: string
}

export default async function UserCompetitionDetailPage({ params }: { params: Params }) {
  const supabase = await createClient()
  const {id} = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is not admin (redirect admin to admin version)
  const userRole = user.app_metadata?.role
  if (userRole === "admin") {
    redirect(`/admin/competitions/${id}`)
  }

  // Get competition details
  const { data: competition, error: competitionError } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .single()

  if (competitionError || !competition) {
    redirect("/dashboard/competitions")
  }

  // Get teams count that are interested in this competition
  const { data: interestedTeams, count: interestedTeamsCount } = await supabase
    .from("teams")
    .select("id", { count: "exact" })
    .eq("competition_id", id)

  // Get recent teams for preview (limit to 5)
  const { data: recentInterestedTeams } = await supabase
    .from("teams")
    .select("id, name, description, created_at, leader_id, profiles:leader_id(full_name)")
    .eq("competition_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Check if current user has any teams participating in this competition
  const { data: userTeamsInCompetition } = await supabase
    .from("teams")
    .select("id, name")
    .eq("leader_id", user.id)
    .eq("competition_id", id)

  // Get all user's teams to potentially join this competition
  const { data: userTeams } = await supabase
    .from("teams")
    .select("id, name, status")
    .eq("leader_id", user.id)
    .eq("status", "open")

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      open: "default",
      ongoing: "secondary",
      closed: "destructive",
      completed: "outline"
    }
    return variants[status] || "outline"
  }

  const isDeadlinePassed = new Date(competition.deadline) <= new Date()
  const daysLeft = Math.max(0, Math.ceil((new Date(competition.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/competitions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detail Kompetisi</h1>
          <p className="text-muted-foreground mt-1">Informasi lengkap kompetisi dan minat peserta</p>
        </div>
        {competition.status === "open" && !isDeadlinePassed && (
          <Button asChild>
            <Link href="/dashboard/teams/create">
              <Building className="w-4 h-4 mr-2" />
              Buat Tim untuk Kompetisi Ini
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{competition.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>Kategori: {competition.category}</span>
                    <span>•</span>
                    <Badge variant={getStatusBadge(competition.status)}>
                      {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Interest Indicator */}
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">
                      {interestedTeamsCount || 0} tim tertarik dengan kompetisi ini
                    </span>
                    {(interestedTeamsCount || 0) > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {(interestedTeamsCount || 0) > 10 ? "Sangat Populer" :
                          (interestedTeamsCount || 0) > 5 ? "Populer" : "Diminati"}
                      </Badge>
                    )}
                  </div>
                </div>
                {competition.image_url && (
                  <img
                    src={competition.image_url}
                    alt={competition.title}
                    className="w-32 h-20 object-cover rounded-lg border"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Alert for user's participation */}
                {userTeamsInCompetition && userTeamsInCompetition.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Tim Anda sudah terdaftar!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Tim "{userTeamsInCompetition[0].name}" sudah memilih kompetisi ini
                    </p>
                  </div>
                )}

                {/* Deadline warning */}
                {competition.status === "open" && daysLeft <= 7 && daysLeft > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Deadline Segera!</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Pendaftaran akan ditutup dalam {daysLeft} hari lagi
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Deskripsi</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {competition.description || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Deadline:</span>
                      <span className={isDeadlinePassed ? "text-red-600" : ""}>
                        {new Date(competition.deadline).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Max Tim:</span>
                      <span>{competition.max_team_size} anggota</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {competition.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Lokasi:</span>
                        <span>{competition.location}</span>
                      </div>
                    )}
                    {competition.prize_pool && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Hadiah:</span>
                        <span>{competition.prize_pool}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tim yang Tertarik (Preview for users) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Tim yang Tertarik ({interestedTeamsCount || 0})
              </CardTitle>
              <CardDescription>
                Lihat siapa saja yang tertarik dengan kompetisi ini
                {(interestedTeamsCount || 0) > 5 && " - Kompetisi ini cukup populer!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentInterestedTeams && recentInterestedTeams.length > 0 ? (
                <div className="space-y-4">
                  {recentInterestedTeams.map((team: any) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {team.description || "Tidak ada deskripsi"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Leader: {team.profiles?.full_name || "Unknown"}</span>
                          <span>•</span>
                          <span>Bergabung: {new Date(team.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(interestedTeamsCount || 0) > 5 && (
                    <div className="text-center py-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Dan {(interestedTeamsCount || 0) - 5} tim lainnya juga tertarik dengan kompetisi ini
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Belum ada tim yang tertarik. Jadilah yang pertama!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Competition Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tim Tertarik</span>
                <span className="font-semibold text-red-600">{interestedTeamsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hari Tersisa</span>
                <span className={`font-semibold ${daysLeft <= 3 ? "text-red-600" : "text-green-600"}`}>
                  {daysLeft}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={getStatusBadge(competition.status)}>
                  {competition.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tingkat Minat</span>
                <span className="text-sm font-medium">
                  {(interestedTeamsCount || 0) === 0 ? "Belum Ada" :
                    (interestedTeamsCount || 0) <= 3 ? "Rendah" :
                      (interestedTeamsCount || 0) <= 8 ? "Sedang" : "Tinggi"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bergabung Kompetisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competition.status === "open" && !isDeadlinePassed ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Buat tim baru untuk ikut serta dalam kompetisi ini
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/teams/create">
                      <Building className="w-4 h-4 mr-2" />
                      Buat Tim Baru
                    </Link>
                  </Button>

                  {userTeams && userTeams.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Atau pilih tim yang sudah ada:
                      </p>
                      {userTeams.slice(0, 3).map((team: any) => (
                        <Button
                          key={team.id}
                          variant="outline"
                          size="sm"
                          className="w-full mb-2"
                          asChild
                        >
                          <Link href={`/dashboard/teams/${team.id}`}>
                            {team.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isDeadlinePassed ? "Pendaftaran sudah ditutup" : "Kompetisi tidak menerima pendaftaran"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Bagikan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Ajak teman untuk bergabung dalam kompetisi ini
              </p>
              <Button variant="outline" className="w-full" onClick={() => {
                navigator.share ? navigator.share({
                  title: competition.title,
                  text: `Lihat kompetisi ${competition.title} di Konect.co`,
                  url: window.location.href
                }) : navigator.clipboard.writeText(window.location.href)
              }}>
                Bagikan Kompetisi
              </Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}
