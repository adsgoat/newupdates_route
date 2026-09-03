import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetNotificationsData from "@/services/topbar/notificationget";

export async function GET() {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        if (!email) {
            return Response.json(
                { error: "Email not found" },
                { status: 401 }
            );
        }

        const token = await client.get(`auth_token_${email}`);

        if (!token) {
            return Response.json(
                { error: "Authentication token not found" },
                { status: 401 }
            );
        }

        const data = await GetNotificationsData(email, token);

        return Response.json(data);
    } catch (error) {
        console.error("Notifications API error:", error);

        return Response.json(
            {
                error: "Failed to fetch notifications",
            },
            { status: 500 }
        );
    }
}