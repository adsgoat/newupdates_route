import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetCreativeProxy from "@/services/creatives/creativeProxy";

export async function GET(request) {
    
    const client = await getRedisClient();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    const response = await GetCreativeProxy({ url }, token);

    return new Response(response.data, {
        headers: {
            "Content-Type":
                response.headers["content-type"] || "application/octet-stream",
        },
    });
}