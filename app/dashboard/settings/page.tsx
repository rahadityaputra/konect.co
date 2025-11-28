import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Download,
    Trash2,
    Key,
    Mail,
    Smartphone
} from "lucide-react"

export default async function SettingsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pengaturan</h1>
                    <p className="text-muted-foreground mt-2">Kelola pengaturan akun dan preferensi Anda</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 text-primary">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">Profil</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <Bell className="w-4 h-4" />
                                <span className="text-sm">Notifikasi</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm">Keamanan</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <Palette className="w-4 h-4" />
                                <span className="text-sm">Tampilan</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                <Globe className="w-4 h-4" />
                                <span className="text-sm">Bahasa & Region</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <CardTitle>Informasi Akun</CardTitle>
                            </div>
                            <CardDescription>Kelola informasi dasar akun Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Nama Lengkap</Label>
                                    <div className="mt-1 p-3 bg-muted rounded-lg">
                                        <span className="text-sm">{profile?.full_name || "Belum diisi"}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Email</Label>
                                    <div className="mt-1 p-3 bg-muted rounded-lg">
                                        <span className="text-sm">{profile?.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Role</Label>
                                    <div className="mt-1">
                                        <Badge variant={profile?.role === "admin" ? "default" : "secondary"}>
                                            {profile?.role === "admin" ? "Administrator" : "User"}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Status Akun</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className="text-green-600">
                                            Aktif
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <Button size="sm">Edit Profil</Button>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                    Ubah Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                <CardTitle>Pengaturan Notifikasi</CardTitle>
                            </div>
                            <CardDescription>Kelola bagaimana Anda ingin menerima notifikasi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <Label htmlFor="email-notifications">Notifikasi Email</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Terima notifikasi melalui email untuk aktivitas penting
                                        </p>
                                    </div>
                                    <Switch id="email-notifications" defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                                            <Label htmlFor="push-notifications">Notifikasi Push</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Terima notifikasi push di browser dan perangkat mobile
                                        </p>
                                    </div>
                                    <Switch id="push-notifications" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Tim & Undangan</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifikasi saat ada undangan tim atau aktivitas tim
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Kompetisi Baru</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Informasi tentang kompetisi dan hackathon terbaru
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Newsletter</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Tips, panduan, dan update tentang platform
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <CardTitle>Keamanan</CardTitle>
                            </div>
                            <CardDescription>Pengaturan keamanan dan privasi akun</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-muted-foreground" />
                                            <Label>Autentikasi Dua Faktor</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Tambahkan lapisan keamanan ekstra untuk akun Anda
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent">
                                        Aktifkan
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Sesi Login</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Kelola perangkat yang terhubung dengan akun Anda
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent">
                                        Kelola
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Log Aktivitas</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Lihat riwayat login dan aktivitas akun
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent">
                                        Lihat Log
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy & Data */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                <CardTitle>Privasi & Data</CardTitle>
                            </div>
                            <CardDescription>Kelola data pribadi dan preferensi privasi</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Profil Publik</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Izinkan orang lain menemukan profil Anda
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Tampilkan Email</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Tampilkan email di profil publik
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Download Data</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Unduh semua data yang kami miliki tentang Anda
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-5 h-5 text-destructive" />
                                <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
                            </div>
                            <CardDescription>Tindakan yang tidak dapat dibatalkan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                                <div className="space-y-1">
                                    <Label className="text-destructive">Hapus Akun</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Hapus akun dan semua data secara permanen. Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    Hapus Akun
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}