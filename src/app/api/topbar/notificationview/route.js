import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

import NotificationView from "@/services/topbar/notificationview";

export async function PUT(request) {
    try {
        const { key, item } = await request.json();

        if (!key || !item) {
            return Response.json(
                { error: "Key and item are required" },
                { status: 400 }
            );
        }

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

        const data = await NotificationView(
            email,
            key,
            item,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Notification view API error:",
            error
        );

        return Response.json(
            {
                error: "Failed to mark notification as viewed",
            },
            { status: 500 }
        );
    }
}