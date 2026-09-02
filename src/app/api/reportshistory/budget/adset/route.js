import AdsetBudgetAndBidUpdate from "@/services/reportshistory/adset/budget";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
export async function POST(request) {
    console.log("hey");
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const body = await request.json();
    const token = await client.get(`auth_token_${email}`);
    const data = await AdsetBudgetAndBidUpdate(body, token);
    return Response.json(data);
}