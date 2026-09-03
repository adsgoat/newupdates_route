import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import MarkAllNotificationsAsSeen from "@/services/topbar/markallnotification";

export async function PUT() {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        if (!email) {
            return Response.json(
                {
                    error: "Email not found",
                },
                {
                    status: 401,
                }
            );
        }

        const token = await client.get(
            `auth_token_${email}`
        );

        if (!token) {
            return Response.json(
                {
                    error:
                        "Authentication token not found",
                },
                {
                    status: 401,
                }
            );
        }

        const data =
            await MarkAllNotificationsAsSeen(
                email,
                token
            );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Mark all notifications API error:",
            error
        );

        return Response.json(
            {
                error:
                    "Failed to mark all notifications as seen",
            },
            {
                status: 500,
            }
        );
    }
}