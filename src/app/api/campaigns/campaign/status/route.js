import CampaignStatus from "@/services/campaigns/campaign/status";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function PUT(request) {
    const client = await getRedisClient();
    const body = await request.json();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const data = await CampaignStatus(id, body, token);
    return Response.json(data);
}