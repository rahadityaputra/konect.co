import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, MapPin, Trophy, Users, Building, Shield } from "lucide-react"

interface Params {
    id: string
}

export default async function AdminCompetitionDetailPage({ params }: { params: Params }) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/admin/login")
    }

    // Check admin role
    const userRole = user.app_metadata?.role
    if (userRole !== "admin") {
        redirect("/auth/admin/login")
    }

    // Get competition details
    const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", params.id)
        .single()

    if (competitionError || !competition) {
        redirect("/admin/competitions")
    }

    // Get teams that are interested in this competition
    const { data: interestedTeams } = await supabase
        .from("teams")
        .select("id, name, description, created_at, leader_id, profiles:leader_id(full_name, email)")
        .eq("competition_id", params.id)

    // Get creator info
    const { data: creator } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", competition.created_by)
        .single()

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
            open: "default",
            ongoing: "secondary",
            closed: "destructive",
            completed: "outline"
        }
        return variants[status] || "outline"
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/competitions">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h1 className="text-3xl font-bold">Detail Kompetisi (Admin)</h1>
                    </div>
                    <p className="text-muted-foreground mt-1">Kelola dan pantau kompetisi</p>
                </div>
                <Button asChild>
                    <Link href={`/admin/competitions/${params.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Kompetisi
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{competition.title}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Kategori: {competition.category}</span>
                                        <span>•</span>
                                        <Badge variant={getStatusBadge(competition.status)}>
                                            {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                                        </Badge>
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
                                            <span>{new Date(competition.deadline).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
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

                    {/* Interested Teams */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Tim yang Tertarik ({interestedTeams?.length || 0})
                            </CardTitle>
                            <CardDescription>Tim yang memilih kompetisi ini saat dibuat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {interestedTeams && interestedTeams.length > 0 ? (
                                <div className="space-y-4">
                                    {interestedTeams.map((team: any) => (
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
                                                    <span>Dibuat: {new Date(team.created_at).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/teams/${team.id}`}>
                                                    Lihat Detail
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    Belum ada tim yang tertarik dengan kompetisi ini
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Competition Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Tim Tertarik</span>
                                <span className="font-semibold">{interestedTeams?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Hari Tersisa</span>
                                <span className="font-semibold">
                                    {Math.max(0, Math.ceil((new Date(competition.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Status</span>
                                <Badge variant={getStatusBadge(competition.status)}>
                                    {competition.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dibuat Oleh</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{creator?.full_name || "Admin"}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{creator?.email}</p>
                                <p className="text-xs text-muted-foreground">
                                    Dibuat: {new Date(competition.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="outline" asChild>
                                <Link href={`/admin/competitions/${params.id}/edit`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Kompetisi
                                </Link>
                            </Button>
                            <Button className="w-full" variant="outline">
                                <Trophy className="w-4 h-4 mr-2" />
                                Kelola Pemenang
                            </Button>
                            <Button className="w-full" variant="outline">
                                <Users className="w-4 h-4 mr-2" />
                                Export Data Tim
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}