import ReportsActivity from "@/services/reports/activity/page";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const account = searchParams.get("account");
    const campaignId = searchParams.get("campaign");
    const data = await ReportsActivity(token, account, campaignId);
    return Response.json(data);
}