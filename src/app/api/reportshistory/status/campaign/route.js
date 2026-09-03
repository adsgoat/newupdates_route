import CampaignStatusUpdate from "@/services/reportshistory/campaign/status";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const body = await request.json();
    const token = await client.get(`auth_token_${email}`);
    const data = await CampaignStatusUpdate(body, token);
    return Response.json(data);
}