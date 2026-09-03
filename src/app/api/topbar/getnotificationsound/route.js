import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetNotificationSoundData from "@/services/topbar/notificationsound";

export async function GET() {
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
                    error: "Authentication token not found",
                },
                {
                    status: 401,
                }
            );
        }

        console.log(
            "Notification sound email:",
            email
        );

        const data =
            await GetNotificationSoundData(
                email,
                token
            );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Notification sound API error:",
            error
        );

        return Response.json(
            {
                error:
                    "Failed to fetch notification sound setting",
            },
            {
                status: 500,
            }
        );
    }
}