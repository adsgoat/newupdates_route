import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetUrlBuilderData from "@/services/newuser/urlbuilderdata";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const network = searchParams.get("network");

        if (!network) {
            return Response.json(
                {
                    message: "Network is required",
                },
                {
                    status: 400,
                }
            );
        }

        const client = await getRedisClient();

        const email =
            await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const data = await GetUrlBuilderData(
            network,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "URL builder data error:",
            error?.response?.data || error
        );

        return Response.json(
            {
                message:
                    "Failed to fetch URL builder data",
                error:
                    error?.response?.data ||
                    error?.message,
            },
            {
                status:
                    error?.response?.status || 500,
            }
        );
    }
}