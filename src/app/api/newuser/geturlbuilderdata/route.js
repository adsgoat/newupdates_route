import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetUrlBuilderData from "@/services/newuser/geturlbuilderdata";

export async function GET() {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const data = await GetUrlBuilderData(token);

        return Response.json(data);
    } catch (error) {
        console.error(
            "Error fetching URL Builder data:",
            error
        );

        return Response.json(
            {
                error: "Failed to fetch URL Builder data",
            },
            {
                status: 500,
            }
        );
    }
}