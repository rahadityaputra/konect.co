import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Briefcase } from "lucide-react"

export default async function TeamFinderPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all profiles except the current user
  const { data: profiles } = await supabase.from("profiles").select("*").neq("id", user.id).limit(12)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tim Finder</h1>
          <p className="text-muted-foreground mt-2">Cari dan ajak talenta terbaik ke tim Anda</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 flex-wrap">
        {["Web Developer", "Designer", "AI Engineer", "Data Scientist", "Project Manager"].map((skill) => (
          <Button key={skill} variant="outline" size="sm">
            {skill}
          </Button>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles && profiles.length > 0 ? (
          profiles.map((profile: any) => (
            <Card key={profile.id} className="hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {profile.skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{profile.bio}</p>}

                  <Button asChild className="w-full mt-4">
                    <Link href={`/dashboard/team-finder/${profile.id}`}>Lihat Profil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tidak ada profil tersedia</p>
          </div>
        )}
      </div>
    </div>
  )
}
