import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetUserFiles from "@/services/creatives/getUserFiles";

export async function GET(request) {
    const client = await getRedisClient();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");
    const folder = searchParams.get("folder");

    // Validate required query parameters
    if (!username || !folder) {
        return Response.json(
            { error: "Username and folder are required." },
            { status: 400 }
        );
    }

    try {
        const data = await GetUserFiles(
            {
                username,
                folder,
            },
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error("Error fetching user files:", error);

        return Response.json(
            { error: "Failed to fetch user files." },
            { status: 500 }
        );
    }
}