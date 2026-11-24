import DeleteCampaign from "@/services/campaigns/templates/delete";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function DELETE(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const body = await request.json();
    const data = await DeleteCampaign(token, body);
    return Response.json(data);
}