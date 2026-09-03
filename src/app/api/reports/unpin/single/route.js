import UnPinUpdate from "@/services/reports/unpin/single";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
    console.log("hey");
    const client = await getRedisClient();
    const body = await request.json();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const data = await UnPinUpdate(body, token);

    return Response.json(data);
}