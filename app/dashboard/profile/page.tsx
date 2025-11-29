import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UniversityDisplay } from "@/components/university-display"
import { User, Mail, Calendar, MapPin, Edit, GraduationCap } from "lucide-react"

export default async function ProfilePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }


    
    
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    
    const { data: myTeams } = await supabase
    .from("team_members")
    .select("teams(*)")
    .eq("user_id", user.id)
    
    const { data: myProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    
    const res = await fetch(`http://localhost:5000/api/v1/universities/${profile?.university_id}`)
    const universityData = await res.json()
    console.log(universityData);
    const universityName = universityData.nama || "Tidak Diketahui"

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Profil Saya</h1>
                    <p className="text-muted-foreground mt-2">Kelola informasi profil Anda</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/profile/edit">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profil
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Data pribadi dan kontak Anda</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                                    <AvatarFallback className="text-2xl">
                                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-muted-foreground">Nama Lengkap</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{profile?.full_name || "Belum diisi"}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground">Email</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{profile?.email}</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm text-muted-foreground">Universitas</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                                <UniversityDisplay
                                                    universityId={profile?.university_id}
                                                    universityName={universityName}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground">Role</label>
                                            <div className="mt-1">
                                                <Badge variant={profile?.role === "admin" ? "default" : "secondary"}>
                                                    {profile?.role === "admin" ? "Administrator" : "User"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground">Bergabung</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID") : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bio</CardTitle>
                            <CardDescription>Ceritakan tentang diri Anda</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed">
                                {profile?.bio || (
                                    <span className="text-muted-foreground italic">
                                        Belum ada bio. Tambahkan deskripsi tentang diri Anda untuk membantu orang lain mengenal Anda lebih baik.
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Keahlian & Skills</CardTitle>
                            <CardDescription>Kemampuan dan keahlian yang Anda miliki</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile?.skills && profile.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill: string, index: number) => (
                                        <Badge key={index} variant="outline">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm italic">
                                    Belum ada skills yang ditambahkan. Tambahkan keahlian Anda untuk menarik anggota tim.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Summary */}
                <div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Aktivitas</CardTitle>
                                <CardDescription>Ringkasan aktivitas Anda</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Tim Bergabung</span>
                                    <span className="font-semibold">{myTeams?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Proyek Dibuat</span>
                                    <span className="font-semibold">{myProjects?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Kompetisi Diikuti</span>
                                    <span className="font-semibold">0</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tim Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {myTeams && myTeams.length > 0 ? (
                                    <div className="space-y-3">
                                        {myTeams.slice(0, 3).map((teamMember: any) => (
                                            <div key={teamMember.teams.id} className="p-3 border border-border rounded-lg">
                                                <h4 className="font-medium text-sm">{teamMember.teams.name}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {teamMember.teams.description || "Tidak ada deskripsi"}
                                                </p>
                                            </div>
                                        ))}
                                        {myTeams.length > 3 && (
                                            <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                                                <Link href="/dashboard/teams">Lihat Semua Tim</Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm text-center py-4">
                                        Anda belum bergabung dengan tim apapun
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Proyek Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {myProjects && myProjects.length > 0 ? (
                                    <div className="space-y-3">
                                        {myProjects.slice(0, 3).map((project: any) => (
                                            <div key={project.id} className="p-3 border border-border rounded-lg">
                                                <h4 className="font-medium text-sm">{project.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">{project.category}</p>
                                                <Badge variant="outline" className="mt-2 text-xs">
                                                    {project.status}
                                                </Badge>
                                            </div>
                                        ))}
                                        {myProjects.length > 3 && (
                                            <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                                                <Link href="/dashboard/projects">Lihat Semua Proyek</Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm text-center py-4">
                                        Anda belum membuat proyek apapun
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}