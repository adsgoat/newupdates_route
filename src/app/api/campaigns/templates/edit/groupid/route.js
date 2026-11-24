import GroupIdData from "@/services/campaigns/templates/getaccountsforgroupid";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function GET(request) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);
    const { searchParams } = new URL(request.url);

    const groupId = searchParams.get("groupId");
    console.log(groupId, "ID");
    const data = await GroupIdData(token, groupId);
    return Response.json(data);
}