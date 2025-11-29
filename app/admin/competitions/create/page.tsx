"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Calendar, Users, Trophy, MapPin } from "lucide-react"

const CATEGORIES = [
    "Web Development",
    "Mobile App",
    "UI/UX Design",
    "Data Science",
    "AI/Machine Learning",
    "Game Development",
    "Cybersecurity",
    "IoT",
    "Blockchain",
    "General Programming"
]

const STATUS_OPTIONS = [
    { value: "open", label: "Open - Buka Pendaftaran" },
    { value: "ongoing", label: "Ongoing - Sedang Berlangsung" },
    { value: "closed", label: "Closed - Tutup Pendaftaran" },
    { value: "completed", label: "Completed - Selesai" }
]

export default function CreateCompetitionPage() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        deadline: "",
        maxTeamSize: 5,
        location: "",
        prizePool: "",
        imageUrl: "",
        status: "open"
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    const supabase = createClient()

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Validate required fields
            if (!formData.title.trim()) {
                throw new Error("Judul kompetisi harus diisi")
            }
            if (!formData.category) {
                throw new Error("Kategori harus dipilih")
            }
            if (!formData.deadline) {
                throw new Error("Deadline harus diisi")
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error("User tidak ditemukan")
            }

            // Check admin role
            const userRole = user.app_metadata?.role
            if (userRole !== "admin") {
                throw new Error("Hanya admin yang dapat membuat kompetisi")
            }

            // Convert deadline to ISO string
            const deadlineDate = new Date(formData.deadline)
            if (deadlineDate <= new Date()) {
                throw new Error("Deadline harus di masa depan")
            }

            // Insert competition
            const { data, error } = await supabase
                .from("competitions")
                .insert({
                    title: formData.title.trim(),
                    description: formData.description.trim() || null,
                    category: formData.category,
                    deadline: deadlineDate.toISOString(),
                    max_team_size: formData.maxTeamSize,
                    location: formData.location.trim() || null,
                    prize_pool: formData.prizePool.trim() || null,
                    image_url: formData.imageUrl.trim() || null,
                    status: formData.status,
                    created_by: user.id
                })
                .select()
                .single()

            if (error) throw error

            setSuccess("Kompetisi berhasil dibuat!")

            // Redirect after short delay
            setTimeout(() => {
                router.push(`/admin/competitions/${data.id}`)
            }, 1500)

        } catch (error) {
            console.error("Error creating competition:", error)
            setError(error instanceof Error ? error.message : "Gagal membuat kompetisi")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/competitions">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Buat Kompetisi Baru</h1>
                    <p className="text-muted-foreground mt-2">Tambahkan kompetisi baru ke platform</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Informasi Dasar
                                </CardTitle>
                                <CardDescription>Data utama kompetisi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Judul Kompetisi *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        placeholder="Masukkan judul kompetisi"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Kategori *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleInputChange("category", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori kompetisi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange("status", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        placeholder="Deskripsi kompetisi (opsional)"
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Detail Kompetisi
                                </CardTitle>
                                <CardDescription>Pengaturan waktu dan peserta</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="deadline">Deadline *</Label>
                                    <Input
                                        id="deadline"
                                        type="datetime-local"
                                        value={formData.deadline}
                                        onChange={(e) => handleInputChange("deadline", e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Tanggal dan waktu penutupan pendaftaran
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="maxTeamSize">Maksimal Anggota Tim</Label>
                                    <Input
                                        id="maxTeamSize"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.maxTeamSize}
                                        onChange={(e) => handleInputChange("maxTeamSize", parseInt(e.target.value) || 5)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="location">Lokasi</Label>
                                    <div className="flex">
                                        <div className="flex items-center justify-center px-3 border border-r-0 border-input bg-muted rounded-l-md">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            placeholder="Online / Jakarta / Bandung"
                                            className="rounded-l-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="prizePool">Hadiah</Label>
                                    <Input
                                        id="prizePool"
                                        value={formData.prizePool}
                                        onChange={(e) => handleInputChange("prizePool", e.target.value)}
                                        placeholder="Rp 10,000,000 / Sertifikat / Merchandise"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="imageUrl">URL Gambar</Label>
                                    <Input
                                        id="imageUrl"
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Link gambar poster atau banner kompetisi
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Preview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview Kompetisi</CardTitle>
                        <CardDescription>Tampilan kompetisi yang akan dibuat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border border-border rounded-lg p-6 bg-muted/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">
                                        {formData.title || "Judul Kompetisi"}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>Kategori: {formData.category || "Belum dipilih"}</span>
                                        <span>•</span>
                                        <span>Maks. {formData.maxTeamSize} anggota</span>
                                        <span>•</span>
                                        <span>Status: {STATUS_OPTIONS.find(s => s.value === formData.status)?.label}</span>
                                    </div>
                                </div>
                                {formData.imageUrl && (
                                    <div className="w-24 h-16 bg-gray-100 rounded border">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="text-sm mb-4">
                                {formData.description || "Deskripsi kompetisi akan tampil di sini..."}
                            </p>

                            <div className="flex items-center gap-6 text-sm">
                                {formData.deadline && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Deadline: {new Date(formData.deadline).toLocaleDateString('id-ID')}</span>
                                    </div>
                                )}
                                {formData.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{formData.location}</span>
                                    </div>
                                )}
                                {formData.prizePool && (
                                    <div className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        <span>{formData.prizePool}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-destructive text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700 text-sm">{success}</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Menyimpan..." : "Buat Kompetisi"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/competitions">
                            Batal
                        </Link>
                    </Button>
                </div>
            </form>
        </div>
    )
}