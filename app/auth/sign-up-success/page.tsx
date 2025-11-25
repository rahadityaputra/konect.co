import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <CardTitle className="text-2xl">Daftar Berhasil!</CardTitle>
          <CardDescription>Kami telah mengirim email konfirmasi ke alamat Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Silakan periksa email Anda dan klik link konfirmasi untuk mengaktifkan akun Anda.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Kembali ke Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
