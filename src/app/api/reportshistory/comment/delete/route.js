import CommentsDelete from "@/services/reportshistory/comment/delete";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const body = await request.json();
    const token = await client.get(`auth_token_${email}`);
    const data = await CommentsDelete(body, token);
    return Response.json(data);
}