import DetailsForCloneCampaignAndCampaignData from "@/services/campaigns/campaign/clone";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const accountNumber = searchParams.get("account");
    const campaignObjectID = searchParams.get("id");
    const data = await DetailsForCloneCampaignAndCampaignData(token, accountNumber, campaignObjectID);
    return Response.json(data);
}