import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UpdateAccount from "@/services/newuser/updateaccount";

export async function PUT(req) {
    try {
        const body = await req.json();

        const client = await getRedisClient();

        const email =
            await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        console.log(
            "Update account email:",
            email
        );

        console.log(
            "Token exists:",
            !!token
        );

        console.log(
            "Update account data:",
            body.newAccount
        );

        const data = await UpdateAccount(
            body.newAccount,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Update account route error:",
            error
        );

        console.error(
            "Backend status:",
            error?.response?.status
        );

        console.error(
            "Backend response:",
            error?.response?.data
        );

        return Response.json(
            {
                message:
                    "Failed to update account",
                error:
                    error?.response?.data ||
                    error?.message ||
                    "Unknown error",
            },
            {
                status:
                    error?.response?.status ||
                    500,
            }
        );
    }
}