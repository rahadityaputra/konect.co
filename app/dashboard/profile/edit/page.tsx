"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UniversityDisplay } from "@/components/university-display"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X, GraduationCap } from "lucide-react"

interface University {
    kode: string
    nama: string
}

interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    skills: string[]
    university_id: string | null
    university_name: string | null
}

export default function EditProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [fullName, setFullName] = useState("")
    const [bio, setBio] = useState("")
    const [skills, setSkills] = useState<string[]>([])
    const [newSkill, setNewSkill] = useState("")
    const [university, setUniversity] = useState("")
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
    const [universities, setUniversities] = useState<University[]>([])
    const [showUniversities, setShowUniversities] = useState(false)
    const [isLoadingUniversities, setIsLoadingUniversities] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    const supabase = createClient()

    useEffect(() => {
        loadProfile()
    }, [])

    // Debounce university search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (university.trim() && !selectedUniversity) {
                await searchUniversities(university.trim())
            } else if (!university.trim()) {
                setUniversities([])
                setShowUniversities(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [university, selectedUniversity])

    const loadProfile = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth/login")
                return
            }

            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (error) throw error

            setProfile(profileData)
            setFullName(profileData.full_name || "")
            setBio(profileData.bio || "")
            setSkills(profileData.skills || [])

            if (profileData.university_name) {
                setUniversity(profileData.university_name)
                setSelectedUniversity({
                    kode: profileData.university_id,
                    nama: profileData.university_name
                })
            }
        } catch (error) {
            console.error("Error loading profile:", error)
            setError("Gagal memuat data profile")
        } finally {
            setIsLoading(false)
        }
    }

    const searchUniversities = async (keyword: string) => {
        if (keyword.length < 2) return

        setIsLoadingUniversities(true)
        try {
            const response = await fetch(`http://localhost:5000/api/v1/universities/search?q=${encodeURIComponent(keyword)}`)
            if (response.ok) {
                const data = await response.json()
                const universities = data.data.data
                setUniversities(universities)
                setShowUniversities(true)
            }
        } catch (error) {
            console.error('Error fetching universities:', error)
        } finally {
            setIsLoadingUniversities(false)
        }
    }

    const handleUniversitySelect = (selectedUni: University) => {
        setSelectedUniversity(selectedUni)
        setUniversity(selectedUni.nama)
        setShowUniversities(false)
    }

    const handleUniversityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setUniversity(value)
        if (selectedUniversity && value !== selectedUniversity.nama) {
            setSelectedUniversity(null)
        }
    }

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill("")
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth/login")
                return
            }

            const updateData: any = {
                full_name: fullName.trim(),
                bio: bio.trim() || null,
                skills: skills,
            }

            // Only update university_id if one is selected
            if (selectedUniversity) {
                updateData.university_id = selectedUniversity.kode
            }

            const { error } = await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", user.id)

            if (error) throw error

            setSuccess("Profile berhasil diperbarui!")
            setTimeout(() => {
                router.push("/dashboard/profile")
            }, 1500)

        } catch (error) {
            console.error("Error saving profile:", error)
            setError(error instanceof Error ? error.message : "Gagal menyimpan profile")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/profile">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                    <p className="text-muted-foreground mt-2">Perbarui informasi profile Anda</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Dasar</CardTitle>
                        <CardDescription>Update informasi pribadi Anda</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback className="text-xl">
                                    {fullName?.charAt(0) || profile?.email?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Button type="button" variant="outline" size="sm">
                                    Ganti Foto Profile
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG atau GIF. Maksimal 2MB.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="fullName">Nama Lengkap</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Masukkan nama lengkap Anda"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={profile?.email || ""}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Email tidak dapat diubah
                                </p>
                            </div>

                            <div className="relative">
                                <Label htmlFor="university">Universitas</Label>
                                <Input
                                    id="university"
                                    placeholder="Ketik nama universitas..."
                                    value={university}
                                    onChange={handleUniversityInputChange}
                                    onFocus={() => university && setShowUniversities(true)}
                                    autoComplete="off"
                                />

                                {selectedUniversity && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>Universitas yang dipilih:</span>
                                        </div>
                                        <div className="mt-1">
                                            <UniversityDisplay
                                                universityId={selectedUniversity.id}
                                            />
                                        </div>
                                    </div>
                                )}

                                {showUniversities && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-10 mt-1">
                                        {isLoadingUniversities ? (
                                            <div className="p-3 text-sm text-gray-500">Mencari universitas...</div>
                                        ) : universities.length > 0 ? (
                                            universities.map((uni) => (
                                                <div
                                                    key={uni.id}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleUniversitySelect(uni)}
                                                >
                                                    {uni.nama}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-500">Tidak ada universitas ditemukan</div>
                                        )}
                                    </div>
                                )}
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
                        <Textarea
                            placeholder="Tulis tentang diri Anda, pengalaman, minat, atau hal lain yang ingin dibagikan..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Skills & Keahlian</CardTitle>
                        <CardDescription>Tambahkan keahlian yang Anda miliki</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Tambah skill baru..."
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            />
                            <Button type="button" onClick={addSkill} variant="outline">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">
                                Belum ada skills. Tambahkan keahlian Anda untuk menarik anggota tim.
                            </p>
                        )}
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
                    <Button type="submit" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/profile">
                            Batal
                        </Link>
                    </Button>
                </div>
            </form>
        </div>
    )
}