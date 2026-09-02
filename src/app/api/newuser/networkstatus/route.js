import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UpdateNetworkStatus from "@/services/newuser/networkstatus";

export async function PATCH(request) {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const { searchParams } = new URL(
            request.url
        );

        const revenuePartner =
            searchParams.get("revenuePartner");

        const status =
            searchParams.get("Status");

        if (!revenuePartner || !status) {
            return Response.json(
                {
                    error:
                        "revenuePartner and Status are required",
                },
                { status: 400 }
            );
        }

        const data = await UpdateNetworkStatus(
            token,
            revenuePartner,
            status
        );

        return Response.json(data);

    } catch (error) {
        console.error(
            "Network status update error:",
            error
        );

        return Response.json(
            {
                error:
                    "Failed to update network status",
            },
            { status: 500 }
        );
    }
}