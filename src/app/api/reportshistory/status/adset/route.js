import AdsetStatusUpdate from "@/services/reportshistory/adset/status";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const body = await request.json();
    const token = await client.get(`auth_token_${email}`);
    const data = await AdsetStatusUpdate(body, token);
    return Response.json(data);
}