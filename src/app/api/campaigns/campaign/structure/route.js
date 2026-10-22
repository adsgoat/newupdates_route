import DetailsForCreateCampaign from "@/services/campaigns/campaign/structure";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const accountNumber = searchParams.get("account");
    const data = await DetailsForCreateCampaign(token, accountNumber);
    return Response.json(data);
}