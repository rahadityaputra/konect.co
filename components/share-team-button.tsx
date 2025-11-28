"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareTeamButtonProps {
    teamId: string
}

export function ShareTeamButton({ teamId }: ShareTeamButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [joinUrl, setJoinUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const generateJoinLink = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch(`/api/teams/${teamId}/generate-join-link`, {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Failed to generate join link")
            }

            const data = await response.json()
            setJoinUrl(data.joinUrl)
            toast.success("Tautan gabung tim berhasil dibuat!")
        } catch (error) {
            toast.error("Gagal membuat tautan gabung tim")
        } finally {
            setIsGenerating(false)
        }
    }

    const copyToClipboard = async () => {
        if (!joinUrl) return

        try {
            await navigator.clipboard.writeText(joinUrl)
            setCopied(true)
            toast.success("Tautan berhasil disalin!")

            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Gagal menyalin tautan")
        }
    }

    const shareViaApi = async () => {
        if (!joinUrl || !navigator.share) return

        try {
            await navigator.share({
                title: "Bergabung dengan Tim",
                text: "Anda diundang untuk bergabung dengan tim ini",
                url: joinUrl,
            })
        } catch (error) {
            // User canceled sharing or share failed
            copyToClipboard()
        }
    }

    if (!joinUrl) {
        return (
            <Button
                onClick={generateJoinLink}
                disabled={isGenerating}
                variant="outline"
                className="w-full bg-transparent"
            >
                <Share2 className="w-4 h-4 mr-2" />
                {isGenerating ? "Membuat Tautan..." : "Buat Tautan Gabung"}
            </Button>
        )
    }

    return (
        <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tautan Gabung Tim:</p>
                <p className="text-xs font-mono break-all">{joinUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                >
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? "Tersalin" : "Salin"}
                </Button>

                <Button
                    onClick={shareViaApi}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                >
                    <Share2 className="w-4 h-4 mr-1" />
                    Bagikan
                </Button>
            </div>

            <Button
                onClick={generateJoinLink}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                disabled={isGenerating}
            >
                {isGenerating ? "Membuat Ulang..." : "Buat Tautan Baru"}
            </Button>
        </div>
    )
}