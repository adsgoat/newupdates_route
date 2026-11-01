import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import RenameFolder from "@/services/creatives/renameFolder";

export async function POST(request) {
    const client = await getRedisClient();

    const body = await request.json();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const data = await RenameFolder(body, token);

    return Response.json(data);
}