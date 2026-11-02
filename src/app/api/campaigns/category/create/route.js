import CategoryCreate from "@/services/campaigns/category/create";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function POST(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const body = await request.json();
    const data = await CategoryCreate(body, token);
    return Response.json(data);
}