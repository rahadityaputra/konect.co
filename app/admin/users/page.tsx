import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kelola Pengguna</h1>
        <p className="text-muted-foreground mt-2">Lihat dan kelola semua pengguna di platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Total {profiles?.length || 0} pengguna</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Pengguna</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {profiles && profiles.length > 0 ? (
                  profiles.map((profile: any) => (
                    <tr key={profile.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{profile.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{profile.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={profile.role === "admin" ? "default" : "secondary"}>{profile.role}</Badge>
                      </td>
                      <td className="py-3 px-4">{new Date(profile.created_at).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      Tidak ada pengguna
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
