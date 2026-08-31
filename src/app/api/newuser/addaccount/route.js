import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import AddAccountData from "@/services/newuser/adaccount";

export async function POST(request) {
    try {
        const client = await getRedisClient();

        const email =
            await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const body = await request.json();

        const { newAccount } = body;

        const response = await AddAccountData(
            token,
            newAccount
        );

        return Response.json(
            response.data,
            {
                status: response.status,
            }
        );
    } catch (error) {
        console.error(
            "Add account API error:",
            error
        );

        return Response.json(
            {
                message:
                    "Failed to create account",
            },
            {
                status:
                    error.response?.status || 500,
            }
        );
    }
}