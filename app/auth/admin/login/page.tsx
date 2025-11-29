"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            console.log("Admin login attempt")

            // Attempt to sign in
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                throw authError
            }

            if (!authData.user) {
                throw new Error("Login gagal")
            }

            // Check if user has admin role in app_metadata
            const userRole = authData.user.app_metadata?.role

            if (!userRole || userRole !== "admin") {
                // Sign out the user since they're not an admin
                await supabase.auth.signOut()
                throw new Error("Akses ditolak. Anda tidak memiliki hak akses admin.")
            }

            console.log("Admin login successful")
            router.push("/admin/dashboard")
        } catch (error: unknown) {
            console.error("Admin login error:", error)
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Terjadi kesalahan saat login")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Masuk ke dashboard admin Konect.co
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Login Administrator</CardTitle>
                        <CardDescription className="text-center">
                            Hanya untuk pengguna dengan hak akses admin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <Label htmlFor="email">Email Administrator</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@konect.co"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="shrink-0">
                                            <Shield className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Memverifikasi..." : "Login sebagai Admin"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Halaman ini khusus untuk administrator.
                                <br />
                                Jika Anda pengguna biasa,{" "}
                                <a
                                    href="/auth/login"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    login di sini
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <div className="shrink-0">
                                <Shield className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Keamanan:</strong> Akses admin dilindungi dengan verifikasi role.
                                    Hanya pengguna dengan role "admin" yang dapat mengakses dashboard admin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}