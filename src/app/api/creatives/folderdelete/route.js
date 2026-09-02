import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import DeleteFolder from "@/services/creatives/deleteFolder";

export async function DELETE(request) {

    const client = await getRedisClient();

    const body = await request.json();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const data = await DeleteFolder(body, token);

    return Response.json(data);
}