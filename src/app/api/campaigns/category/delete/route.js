import CategoryDelete from "@/services/campaigns/category/delete";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function DELETE(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const accountNumber = searchParams.get("account");
    const data = await CategoryDelete(accountNumber, id, token);
    return Response.json(data);
}