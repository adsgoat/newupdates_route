import NetworksDataForReports from "@/services/reports/networks/page";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const data = await NetworksDataForReports(token);
    return Response.json(data);
}