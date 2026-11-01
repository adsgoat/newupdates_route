import { NextResponse } from "next/server";
import GetVideoThumbnails from "@/services/campaigns/facebook/thumbnailurl";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const videoid = searchParams.get("videoid");
        const token = searchParams.get("token");

        if (!videoid || !token) {
            return NextResponse.json(
                { error: "Video ID and token are required" },
                { status: 400 }
            );
        }

        const data = await GetVideoThumbnails(videoid, token);

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error.response?.data?.error?.message ||
                    error.message ||
                    "Failed to fetch video thumbnails",
            },
            {
                status: error.response?.status || 500,
            }
        );
    }
}