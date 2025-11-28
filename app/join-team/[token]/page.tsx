import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Briefcase } from "lucide-react"

interface JoinTeamPageProps {
    params: { token: string }
}

export default async function JoinTeamPage({ params }: JoinTeamPageProps) {
    const { token } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/login?redirect=/join-team/${token}`)
    }

    // Find team by join link token
    const { data: team, error: errorJoin } = await supabase
        .from("teams")
        .select(`
      *,
      team_members(*, profiles(*)),
      competitions(title, category),
      projects(title, category)
    `)
        .eq("join_link_token", token)
        .single()

    console.log(team);
    console.log(errorJoin);

    if (!team) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-xl font-semibold mb-2">Link Tidak Valid</h1>
                        <p className="text-muted-foreground mb-4">
                            Link bergabung tim ini sudah tidak berlaku atau tidak ditemukan.
                        </p>
                        <Button asChild>
                            <a href="/dashboard/teams">Kembali ke Tim</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Check if user is already a member
    const existingMember = team.team_members?.find((member: any) => member.user_id === user.id)

    if (existingMember) {
        redirect(`/dashboard/teams/${team.id}`)
    }

    // Check if team is full
    const isFull = team.team_members?.length >= team.max_members

    const handleJoinTeam = async () => {
        "use server"

        const supabase = await createClient()

        const { error } = await supabase
            .from("team_members")
            .insert({
                team_id: team.id,
                user_id: user.id,
                role: "member"
            })

        console.log(error);

        if (!error) {
            redirect(`/dashboard/teams/${team.id}`)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <CardTitle className="text-2xl">Bergabung dengan Tim</CardTitle>
                    <CardDescription>
                        Anda diundang untuk bergabung dengan tim berikut
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Team Info */}
                    <div className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">{team.name}</h2>
                                <p className="text-muted-foreground">{team.description}</p>
                            </div>
                            <Badge>{team.status}</Badge>
                        </div>

                        {/* Team Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="flex items-center justify-center mb-1">
                                    <Users className="w-4 h-4 mr-1" />
                                </div>
                                <p className="text-sm text-muted-foreground">Anggota</p>
                                <p className="font-semibold">{team.team_members?.length || 0}/{team.max_members}</p>
                            </div>

                            {team.competitions && (
                                <div>
                                    <div className="flex items-center justify-center mb-1">
                                        <Trophy className="w-4 h-4 mr-1" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Kompetisi</p>
                                    <p className="font-semibold text-xs">{team.competitions.title}</p>
                                </div>
                            )}

                            {team.projects && (
                                <div>
                                    <div className="flex items-center justify-center mb-1">
                                        <Briefcase className="w-4 h-4 mr-1" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Proyek</p>
                                    <p className="font-semibold text-xs">{team.projects.title}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Members */}
                    {team.team_members && team.team_members.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-3">Anggota Tim Saat Ini</h3>
                            <div className="space-y-2">
                                {team.team_members.slice(0, 3).map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.profiles?.avatar_url} />
                                            <AvatarFallback>{member.profiles?.full_name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{member.profiles?.full_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                                {team.team_members.length > 3 && (
                                    <p className="text-sm text-muted-foreground">
                                        +{team.team_members.length - 3} anggota lainnya
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {isFull ? (
                            <div className="w-full text-center py-4">
                                <p className="text-muted-foreground mb-2">Tim sudah penuh</p>
                                <Button variant="outline" disabled className="w-full">
                                    Tidak Dapat Bergabung
                                </Button>
                            </div>
                        ) : (
                            <>
                                <form action={handleJoinTeam} className="flex-1">
                                    <Button type="submit" className="w-full">
                                        Bergabung dengan Tim
                                    </Button>
                                </form>
                                <Button variant="outline" asChild>
                                    <a href="/dashboard/teams">Batal</a>
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}