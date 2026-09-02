import DomainReports from "@/services/reports/domain/page";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const time = searchParams.get("time");
    const network = searchParams.get("network");
    const accounts = searchParams.get("accounts");
    const data = await DomainReports(token, start, end, time, network, accounts );
    return Response.json(data);
}