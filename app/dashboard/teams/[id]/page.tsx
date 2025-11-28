import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShareTeamButton } from "@/components/share-team-button"
import { ArrowLeft, Trash2 } from "lucide-react"

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params;

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) {
    redirect("/dashboard/teams")
  }

  const { data: members } = await supabase.from("team_members").select("*, profiles(*)").eq("team_id", id)

  const isLeader = team.leader_id === user.id

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/teams">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground mt-1">{team.description}</p>
        </div>
        <Badge>{team.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anggota Tim</CardTitle>
              <CardDescription>
                {members?.length || 0} dari {team.max_members} anggota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members && members.length > 0 ? (
                  members.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{member.profiles?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.profiles?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      {isLeader && member.role !== "leader" && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Belum ada anggota</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tim Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Tim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{team.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kapasitas Tim</p>
                  <p className="font-semibold">{team.max_members} anggota</p>
                </div>
                {team.competition_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Kompetisi</p>
                    <p className="font-semibold">Terdaftar untuk kompetisi</p>
                  </div>
                )}
                {team.project_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Proyek</p>
                    <p className="font-semibold">Terkait dengan proyek</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Aksi Tim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLeader ? (
                <>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/team-finder?team=${id}`}>Cari Anggota</Link>
                  </Button>
                  <ShareTeamButton teamId={id} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Anda adalah anggota tim</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
