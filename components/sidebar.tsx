"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Trophy, FileText, Settings, LogOut, BarChart3, User, Building, Search, Briefcase } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Kompetisi",
    href: "/admin/competitions",
    icon: Trophy,
  },
  {
    label: "Proyek",
    href: "/admin/projects",
    icon: FileText,
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
  },
]

const userMenuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tim Saya",
    href: "/dashboard/teams",
    icon: Building,
  },
  {
    label: "Kompetisi",
    href: "/dashboard/competitions",
    icon: Trophy,
  },
  {
    label: "Proyek Saya",
    href: "/dashboard/projects",
    icon: Briefcase,
  },
  {
    label: "Cari Tim",
    href: "/dashboard/team-finder",
    icon: Search,
  },
  {
    label: "Profil",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const role = user.app_metadata?.role || 'user'
          setUserRole(role)
        }
      } catch (error) {
        console.error('Error getting user role:', error)
        setUserRole('user') // Default to user role
      } finally {
        setIsLoading(false)
      }
    }

    getUserRole()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Determine which menu items to show based on user role
  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems
  const logoHref = userRole === 'admin' ? '/admin/dashboard' : '/dashboard'

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href={logoHref} className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
            K
          </div>
          <span className="text-sidebar-foreground">
            {userRole === 'admin' ? 'Admin Panel' : 'Konect.co'}
          </span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Role Indicator & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="px-4 py-2 text-xs text-sidebar-muted-foreground">
          {userRole === 'admin' ? '👑 Administrator' : '👤 User'}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}
