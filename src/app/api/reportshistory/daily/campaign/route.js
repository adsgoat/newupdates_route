import CampaignData from "@/services/reportshistory/campaign/daily";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);
    const CampaignId = searchParams.get("CampaignId");
    const network = searchParams.get("network");
    const timezone = searchParams.get("timezone");
    const accountNumber = searchParams.get("accountNumber");
    const data = await CampaignData(CampaignId, network, timezone, accountNumber, token);
    return Response.json(data);
}