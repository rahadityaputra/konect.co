import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default async function AdminCompetitionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: competitions } = await supabase
    .from("competitions")
    .select("*")
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "ongoing":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "closed":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Kompetisi</h1>
          <p className="text-muted-foreground mt-2">Kelola semua kompetisi di platform</p>
        </div>
        <Button asChild>
          <Link href="/admin/competitions/create">
            <Plus className="w-4 h-4 mr-2" />
            Buat Kompetisi
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kompetisi</CardTitle>
          <CardDescription>Total {competitions?.length || 0} kompetisi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Judul</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Deadline</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {competitions && competitions.length > 0 ? (
                  competitions.map((comp: any) => (
                    <tr key={comp.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{comp.title}</td>
                      <td className="py-3 px-4">{comp.category}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(comp.status)}>{comp.status}</Badge>
                      </td>
                      <td className="py-3 px-4">{new Date(comp.deadline).toLocaleDateString("id-ID")}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/competitions/${comp.id}`}>Edit</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Tidak ada kompetisi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
