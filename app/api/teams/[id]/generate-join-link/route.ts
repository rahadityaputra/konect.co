import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify user is team leader
        const { data: team } = await supabase
            .from("teams")
            .select("*")
            .eq("id", id)
            .single()

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
        }

        if (team.leader_id !== user.id) {
            return NextResponse.json({ error: "Only team leaders can generate join links" }, { status: 403 })
        }

        // Generate unique join token
        const joinLinkToken = randomBytes(32).toString('hex')

        // Update team with join link token using SQL
        const { error } = await supabase
            .from("teams")
            .update({ join_link_token: joinLinkToken })
            .eq("id", id)

        if (error) {
            throw error
        }

        // Generate full join URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
        const joinUrl = `${baseUrl}/join-team/${joinLinkToken}`

        return NextResponse.json({
            success: true,
            joinUrl,
            token: joinLinkToken
        })

    } catch (error) {
        console.error("Error generating team join link:", error)
        return NextResponse.json(
            { error: "Failed to generate join link" },
            { status: 500 }
        )
    }
}