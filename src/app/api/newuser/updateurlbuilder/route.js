import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UpdateUrlBuilder from "@/services/newuser/updateurlbuilder";

export async function PUT(req) {
    try {
        const body = await req.json();

        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const data = await UpdateUrlBuilder(
            body.updatedData,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "URL Builder update error:",
            error?.response?.data || error
        );

        return Response.json(
            {
                message: "Failed to update URL builder",
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