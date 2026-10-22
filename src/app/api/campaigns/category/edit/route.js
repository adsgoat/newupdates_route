import CategoryEdit from "@/services/campaigns/category/edit";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function PATCH(request) {
    console.log("[PATCH] Route entered");
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const accountNumber = searchParams.get("account");
    const body = await request.json();
    const data = await CategoryEdit(accountNumber, id, body, token);
    return Response.json(data);
}