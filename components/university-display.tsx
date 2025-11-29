"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface UniversityDisplayProps {
    universityId: string | null
    universityName?: string
}

interface UniversityLogoResponse {
    data: {
        format: string
        logo_base64: string
    }
}

export function UniversityDisplay({ universityId, universityName }: UniversityDisplayProps) {
    const [logoBase64, setLogoBase64] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUniversityLogo = async () => {
            if (!universityId) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`http://localhost:5000/api/v1/universities/${universityId}/logo`)

                if (response.ok) {
                    const data: UniversityLogoResponse = await response.json()
                    console.log(data.data.logo_base64);

                    setLogoBase64(data.data.logo_base64)
                } else {
                    setError('Gagal memuat logo universitas')
                }
            } catch (error) {
                console.error('Error fetching university logo:', error)
                setError('Gagal memuat logo universitas')
            } finally {
                setIsLoading(false)
            }
        }

        fetchUniversityLogo()
    }, [universityId])

    if (!universityId) {
        return (
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Logo</span>
                </div>
                <span className="text-muted-foreground italic">Universitas belum diisi</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading ? (
                    <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
                ) : error ? (
                    <span className="text-gray-400 text-xs">Error</span>
                ) : logoBase64 ? (
                    <Image
                        src={`data:image/png;base64,${logoBase64}`}
                        alt={`Logo ${universityName || 'Universitas'}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-gray-400 text-xs">No Logo</span>
                )}
            </div>
            <div>
                <span className="font-medium">
                    {universityName || 'Nama universitas tidak tersedia'}
                </span>
                {isLoading && <p className="text-xs text-muted-foreground">Memuat logo...</p>}
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        </div>
    )
}