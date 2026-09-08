import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import CopyFolder from "@/services/creatives/copyFolder";

export async function POST(request) {
    try {
        const client = await getRedisClient();

        const body = await request.json();

        const email = await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const data = await CopyFolder(body, token);

        return Response.json(data);

    } catch (error) {
        console.error(
            "========== FOLDER COPY ROUTE ERROR =========="
        );

        console.error(error);

        return Response.json(
            {
                message:
                    error?.message ||
                    "Folder copy failed",
            },
            {
                status:
                    error?.response?.status || 500,
            }
        );
    }
}