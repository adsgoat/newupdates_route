import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetTrashFiles from "@/services/creatives/getTrashFiles";

export async function GET(request) {
    const client = await getRedisClient();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");
    const folder = searchParams.get("folder");

    const data = await GetTrashFiles(
        {
            username,
            folder,
        },
        token
    );

    return Response.json(data);
}