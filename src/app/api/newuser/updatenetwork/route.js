import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UpdateNetwork from "@/services/newuser/updtaenetwork";

export async function PUT(req) {
    try {
        const body = await req.json();

        const { updatedNetwork } = body;

        if (!updatedNetwork) {
            return Response.json(
                {
                    message: "updatedNetwork is required",
                },
                { status: 400 }
            );
        }

        const client = await getRedisClient();

        const email =
            await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const data = await UpdateNetwork(
            updatedNetwork,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Update Network API Error:",
            error.response?.data || error.message
        );

        return Response.json(
            {
                message:
                    error.response?.data?.message ||
                    "Failed to update network",
                error:
                    error.response?.data ||
                    error.message,
            },
            {
                status:
                    error.response?.status || 500,
            }
        );
    }
}