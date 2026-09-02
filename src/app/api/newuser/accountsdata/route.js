import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetAccountsData from "@/services/newuser/accountservice";

export async function GET() {
    const client = await getRedisClient();

    const email = await getSessionEmailByAuth();

    const token = await client.get(`auth_token_${email}`);

    const data = await GetAccountsData(token);

    return Response.json(data);
}