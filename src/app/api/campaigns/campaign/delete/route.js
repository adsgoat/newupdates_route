import CampaignDelete from "@/services/campaigns/campaign/delete";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function DELETE(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const data = await CampaignDelete(id, token);
    return Response.json(data);
}