import { createClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Briefcase, Calendar, Users } from "lucide-react"

interface ProfilePageProps {
    params: { id: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Prevent users from viewing their own profile through team finder
    if (user.id === id) {
        redirect("/dashboard/profile")
    }

    // Get profile data
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !profile) {
        notFound()
    }

    // Get user's projects
    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", id)
        .limit(3)

    // Get user's teams
    const { data: teamMemberships } = await supabase
        .from("team_members")
        .select(`
            role,
            teams (
                id,
                name,
                status,
                max_members
            )
        `)
        .eq("user_id", id)
        .limit(3)

    const teams = teamMemberships?.map(tm => ({ ...tm.teams, role: tm.role })) || []

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/team-finder">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Link>
                </Button>
            </div>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <Avatar className="h-24 w-24 mx-auto md:mx-0">
                                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback className="text-2xl">
                                    {profile.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
                                <Mail className="w-4 h-4" />
                                <span>{profile.email}</span>
                            </div>

                            {/* Role Badge */}
                            <Badge variant="outline" className="mb-4">
                                {profile.role === 'admin' ? 'Administrator' : 'Member'}
                            </Badge>

                            {/* Bio */}
                            {profile.bio && (
                                <p className="text-muted-foreground leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Join Date */}
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-4">
                                <Calendar className="w-4 h-4" />
                                <span>Bergabung pada {new Date(profile.created_at).toLocaleDateString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Keahlian</CardTitle>
                        <CardDescription>Skill dan kemampuan yang dimiliki</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill: string) => (
                                <Badge key={skill} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Projects & Teams Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Projects Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Proyek Terbaru
                        </CardTitle>
                        <CardDescription>
                            {projects?.length || 0} proyek yang telah dibuat
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {projects && projects.length > 0 ? (
                            <div className="space-y-3">
                                {projects.map((project: any) => (
                                    <div
                                        key={project.id}
                                        className="p-3 border border-border rounded-lg"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-medium line-clamp-1">{project.title}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {project.status}
                                            </Badge>
                                        </div>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                        {project.category && (
                                            <div className="mt-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {project.category}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">
                                Belum ada proyek yang dibuat
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Teams Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Tim yang Diikuti
                        </CardTitle>
                        <CardDescription>
                            {teams.length} tim yang aktif diikuti
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {teams && teams.length > 0 ? (
                            <div className="space-y-3">
                                {teams.map((team: any) => (
                                    <div
                                        key={team.id}
                                        className="p-3 border border-border rounded-lg"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="font-medium line-clamp-1">{team.name}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {team.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {team.role}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                Max {team.max_members} anggota
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">
                                Belum bergabung dengan tim apapun
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 justify-center">
                        <Button asChild>
                            <Link href={`mailto:${profile.email}`}>
                                <Mail className="w-4 h-4 mr-2" />
                                Hubungi via Email
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/teams/create">
                                <Users className="w-4 h-4 mr-2" />
                                Ajak ke Tim
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}