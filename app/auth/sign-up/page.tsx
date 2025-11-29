"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

interface University {
  id: string
  nama: string
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [university, setUniversity] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [showUniversities, setShowUniversities] = useState(false)
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const universityInputRef = useRef<HTMLInputElement>(null)
  const universitiesListRef = useRef<HTMLDivElement>(null)

  // Debounce hook for university search
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

  // Handle clicks outside university dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        universityInputRef.current &&
        universitiesListRef.current &&
        !universityInputRef.current.contains(event.target as Node) &&
        !universitiesListRef.current.contains(event.target as Node)
      ) {
        setShowUniversities(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchUniversities = async (keyword: string) => {
    if (keyword.length < 2) return

    setIsLoadingUniversities(true)
    try {
      const response = await fetch(`http://localhost:5000/api/v1/universities/search?q=${encodeURIComponent(keyword)}`)
      if (response.ok) {
        const data = await response.json()
        const universities = data.data.data;
        console.log(data.data.data);
        setUniversities(universities);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (!selectedUniversity) {
      setError("Silakan pilih universitas dari daftar yang tersedia")
      setIsLoading(false)
      return
    }

    try {
      console.log("mencoba untuk mendaftar pengguna baru");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            university_id: selectedUniversity.id,
          },
        },
      })
      if (error) {
        console.log(error.code + ": " + error.message);
        throw error;
      }
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>Bergabunglah dengan Konect.co sekarang</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  placeholder="Nama Anda"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anda@contoh.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="university">Universitas</Label>
                <Input
                  ref={universityInputRef}
                  id="university"
                  placeholder="Ketik nama universitas..."
                  required
                  value={university}
                  onChange={handleUniversityInputChange}
                  onFocus={() => university && setShowUniversities(true)}
                  autoComplete="off"
                />
                {showUniversities && (
                  <div
                    ref={universitiesListRef}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-10"
                  >
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
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Ulangi Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sedang Mendaftar..." : "Daftar"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
