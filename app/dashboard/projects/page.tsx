import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus } from "lucide-react"

export default async function ProjectsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proyek Saya</h1>
          <p className="text-muted-foreground mt-2">Kelola dan bagikan proyek Anda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/create">
            <Plus className="w-4 h-4 mr-2" />
            Buat Proyek Baru
          </Link>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project: any) => (
            <Card key={project.id} className="hover:border-primary transition-colors">
              {project.image_url && (
                <img
                  src={project.image_url || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription>{project.category}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/projects/${project.id}`}>Lihat Detail</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Anda belum membuat proyek</p>
            <Button asChild>
              <Link href="/dashboard/projects/create">Buat Proyek Pertama</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
