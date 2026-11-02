import CampaignsList from "@/services/campaigns/campaignlist";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const accountNumber = searchParams.get("account");
    const network = searchParams.get("network");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const data = await CampaignsList(token, accountNumber, network, startDate, endDate, search);
    return Response.json(data);
}