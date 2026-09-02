import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UpdateAccountStatus from "@/services/newuser/accountstatus";

export async function PATCH(req) {
    const { searchParams } = new URL(req.url);

    const accountNumber =
        searchParams.get("accountNumber");

    const status = searchParams.get("status");

    const client = await getRedisClient();

    const email = await getSessionEmailByAuth();

    const token = await client.get(
        `auth_token_${email}`
    );

    const data = await UpdateAccountStatus(
        accountNumber,
        status,
        token
    );

    return Response.json(data);
}