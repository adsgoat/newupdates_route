import CampaignHistory from "@/services/campaigns/campaign/history";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const data = await CampaignHistory(id, token);
    return Response.json(data);
}