import CommentsUpdate from "@/services/reportshistory/comment/createandupdate";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const body = await request.json();
    const token = await client.get(`auth_token_${email}`);
    const data = await CommentsUpdate(body, token);
    return Response.json(data);
}