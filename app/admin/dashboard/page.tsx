import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Trophy, FileText, Shield, Building } from "lucide-react"

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/admin/login")
    }

    // Check if user has admin role
    const userRole = user.app_metadata?.role
    if (!userRole || userRole !== "admin") {
        redirect("/auth/admin/login")
    }

    // Get system-wide statistics
    const { data: totalUsers } = await supabase.from("profiles").select("id", { count: "exact" })
    const { data: totalTeams } = await supabase.from("teams").select("id", { count: "exact" })
    const { data: totalCompetitions } = await supabase.from("competitions").select("id", { count: "exact" })
    const { data: totalProjects } = await supabase.from("projects").select("id", { count: "exact" })

    // Get recent competitions
    const { data: recentCompetitions } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

    // Get recent users
    const { data: recentUsers } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

    // Get recent teams
    const { data: recentTeams } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

    return (
        <div className="p-6 space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold">Dashboard Administrator</h1>
                    </div>
                    <p className="text-muted-foreground mt-2">Kelola dan pantau aktivitas platform Konect.co</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/competitions">Kelola Kompetisi</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/users">Kelola Users</Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        title: "Total Users",
                        value: totalUsers?.length || 0,
                        icon: Users,
                        color: "text-blue-500",
                        href: "/admin/users"
                    },
                    {
                        title: "Total Tim",
                        value: totalTeams?.length || 0,
                        icon: Building,
                        color: "text-purple-500",
                        href: "/admin/teams"
                    },
                    {
                        title: "Total Kompetisi",
                        value: totalCompetitions?.length || 0,
                        icon: Trophy,
                        color: "text-orange-500",
                        href: "/admin/competitions"
                    },
                    {
                        title: "Total Proyek",
                        value: totalProjects?.length || 0,
                        icon: FileText,
                        color: "text-green-500",
                        href: "/admin/projects"
                    },
                ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <Link key={i} href={stat.href}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
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
                        </Link>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kompetisi Terbaru */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kompetisi Terbaru</CardTitle>
                        <CardDescription>Kompetisi yang baru dibuat di platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentCompetitions && recentCompetitions.length > 0 ? (
                                recentCompetitions.map((comp: any) => (
                                    <div
                                        key={comp.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{comp.title}</h4>
                                            <p className="text-sm text-muted-foreground">{comp.category} • {comp.status}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(comp.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/competitions/${comp.id}`}>Kelola</Link>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Belum ada kompetisi</p>
                            )}
                        </div>
                        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                            <Link href="/admin/competitions">Lihat Semua Kompetisi</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* User Terbaru */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Terbaru</CardTitle>
                        <CardDescription>Pengguna yang baru mendaftar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers && recentUsers.length > 0 ? (
                                recentUsers.map((user: any) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{user.full_name || 'User'}</h4>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            {user.role || 'user'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">Belum ada user</p>
                            )}
                        </div>
                        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                            <Link href="/admin/users">Kelola Semua User</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Tim Terbaru */}
            <Card>
                <CardHeader>
                    <CardTitle>Tim Terbaru</CardTitle>
                    <CardDescription>Tim yang baru dibuat di platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentTeams && recentTeams.length > 0 ? (
                            recentTeams.map((team: any) => (
                                <div
                                    key={team.id}
                                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">{team.name}</h4>
                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                            {team.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {team.description || 'Tidak ada deskripsi'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(team.created_at).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-muted-foreground">
                                Belum ada tim yang dibuat
                            </div>
                        )}
                    </div>
                    <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                        <Link href="/admin/teams">Kelola Semua Tim</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status Sistem</CardTitle>
                        <CardDescription>Informasi kesehatan platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Authentication</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">API Services</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600">Online</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Aktivitas Platform</CardTitle>
                        <CardDescription>Ringkasan aktivitas 24 jam terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">User Baru</span>
                                <span className="font-semibold">{recentUsers?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Tim Dibuat</span>
                                <span className="font-semibold">{recentTeams?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Kompetisi Baru</span>
                                <span className="font-semibold">{recentCompetitions?.length || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}