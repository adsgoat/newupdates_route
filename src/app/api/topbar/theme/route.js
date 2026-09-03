import { NextResponse } from "next/server";
import getRedisClient from "@/lib/redis";

export async function PUT(request) {
    try {
        const { email, theme } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        if (theme !== "light" && theme !== "dark") {
            return NextResponse.json(
                { error: "Invalid theme" },
                { status: 400 }
            );
        }

        const client = await getRedisClient();

        await client.set(`theme_${email}`, theme);

        return NextResponse.json({
            success: true,
            theme,
        });
    } catch (error) {
        console.error("Theme API error:", error);

        return NextResponse.json(
            { error: "Failed to update theme" },
            { status: 500 }
        );
    }
}