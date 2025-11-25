import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus } from "lucide-react"

export default async function TeamsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: teamMembers } = await supabase.from("team_members").select("teams(*)").eq("user_id", user.id)

  const teams = teamMembers?.map((tm: any) => tm.teams).filter(Boolean) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "closed":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tim Saya</h1>
          <p className="text-muted-foreground mt-2">Kelola dan monitor tim Anda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teams/create">
            <Plus className="w-4 h-4 mr-2" />
            Buat Tim Baru
          </Link>
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams && teams.length > 0 ? (
          teams.map((team: any) => (
            <Card key={team.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="line-clamp-1">{team.name}</CardTitle>
                    <CardDescription>Tim dengan {team.max_members} anggota</CardDescription>
                  </div>
                  <Badge className={getStatusColor(team.status)}>{team.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{team.description}</p>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/teams/${team.id}`}>Lihat Detail</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Anda belum bergabung dengan tim apapun</p>
            <Button asChild>
              <Link href="/dashboard/teams/create">Buat Tim Pertama</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
