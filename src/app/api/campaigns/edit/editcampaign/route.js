import EditCampaignObject from "@/services/campaigns/campaign_edit/edit";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function PUT(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const body = await request.json();
    const data = await EditCampaignObject(body, token);
    return Response.json(data);
}