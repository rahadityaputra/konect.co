"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateTeamPage() {
  const searchParams = useSearchParams()
  const competitionId = searchParams.get("competition")
  const projectId = searchParams.get("project")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_members: "5",
    competition_id: competitionId || "default_competition_id",
    project_id: projectId || "default_project_id",
  })

  const [competitions, setCompetitions] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch competitions
      const { data: comps } = await supabase.from("competitions").select("id, title, status").eq("status", "open")

      setCompetitions(comps || [])

      // Fetch user's projects
      const { data: proj } = await supabase.from("projects").select("id, title").eq("user_id", user.id)

      setProjects(proj || [])
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User tidak ditemukan")

      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: formData.name,
          description: formData.description,
          leader_id: user.id,
          max_members: Number.parseInt(formData.max_members),
          competition_id: formData.competition_id === "default_competition_id" ? null : formData.competition_id,
          project_id: formData.project_id === "default_project_id" ? null : formData.project_id,
          status: "open",
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Add creator as team member
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id,
        role: "leader",
      })

      if (memberError) throw memberError

      router.push(`/dashboard/teams/${team.id}`)
    } catch (error: unknown) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/teams">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Buat Tim Baru</h1>
          <p className="text-muted-foreground mt-1">Buat tim Anda sendiri atau untuk kompetisi</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Tim</CardTitle>
          <CardDescription>Isi detail tim yang akan Anda buat</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Tim</Label>
              <Input
                id="name"
                name="name"
                placeholder="Masukkan nama tim Anda"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi Tim</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Jelaskan visi dan misi tim Anda"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="max_members">Jumlah Anggota Maksimal</Label>
                <Input
                  id="max_members"
                  name="max_members"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_members}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="competition">Kompetisi (Opsional)</Label>
                <Select
                  value={formData.competition_id}
                  onValueChange={(value) => handleSelectChange("competition_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kompetisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_competition_id">Tidak ada</SelectItem>
                    {competitions.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project">Proyek (Opsional)</Label>
              <Select value={formData.project_id} onValueChange={(value) => handleSelectChange("project_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih proyek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_project_id">Tidak ada</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Membuat Tim..." : "Buat Tim"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/teams">Batal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
