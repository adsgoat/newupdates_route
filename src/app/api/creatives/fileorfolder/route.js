import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import MoveFileOrFolder from "@/services/creatives/moveFileOrFolder";

export async function POST(request) {
    const client = await getRedisClient();

    const body = await request.json();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const data = await MoveFileOrFolder(body, token);

    return Response.json(data);
}