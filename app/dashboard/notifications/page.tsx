import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2, Users, Trophy, Briefcase, Info } from "lucide-react"

export default async function NotificationsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Get user notifications
    const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    // Get unread count
    const unreadCount = notifications?.filter(n => !n.read).length || 0

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "team_invite":
                return Users
            case "competition":
                return Trophy
            case "project":
                return Briefcase
            default:
                return Info
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "team_invite":
                return "text-blue-500"
            case "competition":
                return "text-orange-500"
            case "project":
                return "text-purple-500"
            default:
                return "text-gray-500"
        }
    }

    const markAsRead = async (notificationId: string) => {
        "use server"
        const supabase = await createClient()

        await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notificationId)
    }

    const markAllAsRead = async () => {
        "use server"
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", user.id)
                .eq("read", false)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        "use server"
        const supabase = await createClient()

        await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId)
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Bell className="w-8 h-8" />
                        Notifikasi
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {unreadCount > 0
                            ? `Anda memiliki ${unreadCount} notifikasi yang belum dibaca`
                            : "Semua notifikasi sudah dibaca"
                        }
                    </p>
                </div>

                {unreadCount > 0 && (
                    <form action={markAllAsRead}>
                        <Button variant="outline" size="sm" type="submit">
                            <Check className="w-4 h-4 mr-2" />
                            Tandai Semua Dibaca
                        </Button>
                    </form>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications && notifications.length > 0 ? (
                    notifications.map((notification: any) => {
                        const Icon = getNotificationIcon(notification.type)
                        const iconColor = getNotificationColor(notification.type)

                        return (
                            <Card
                                key={notification.id}
                                className={`transition-colors ${!notification.read
                                        ? "border-primary/50 bg-primary/5"
                                        : "hover:bg-muted/50"
                                    }`}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`p-2 rounded-full bg-background border flex-shrink-0`}>
                                            <Icon className={`w-5 h-5 ${iconColor}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-sm mb-1">
                                                        {notification.title}
                                                        {!notification.read && (
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                Baru
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.message}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {!notification.read && (
                                                        <form action={markAsRead.bind(null, notification.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="submit"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        </form>
                                                    )}
                                                    <form action={deleteNotification.bind(null, notification.id)}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="submit"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                            </div>

                                            {/* Timestamp */}
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(notification.created_at).toLocaleString("id-ID", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Tidak Ada Notifikasi</h3>
                            <p className="text-muted-foreground">
                                Anda akan menerima notifikasi tentang aktivitas tim, kompetisi, dan undangan di sini.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Stats */}
            {notifications && notifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Statistik Notifikasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {notifications.filter(n => n.type === 'team_invite').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Undangan Tim</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {notifications.filter(n => n.type === 'competition').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Kompetisi</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {notifications.filter(n => n.type === 'project').length}
                                </div>
                                <div className="text-xs text-muted-foreground">Proyek</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {notifications.filter(n => n.read).length}
                                </div>
                                <div className="text-xs text-muted-foreground">Dibaca</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}