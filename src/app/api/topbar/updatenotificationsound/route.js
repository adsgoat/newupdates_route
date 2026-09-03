import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetNotificationSoundData from "@/services/topbar/notificationsound";
import UpdateNotificationSound from "@/services/topbar/updatenotificationsound";

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

        const token = await client.get(
            `auth_token_${email}`
        );

        if (!token) {
            return Response.json(
                { error: "Authentication token not found" },
                { status: 401 }
            );
        }

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
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { isMuted } = await request.json();

        if (typeof isMuted !== "boolean") {
            return Response.json(
                { error: "Invalid isMuted value" },
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

        const token = await client.get(
            `auth_token_${email}`
        );

        if (!token) {
            return Response.json(
                { error: "Authentication token not found" },
                { status: 401 }
            );
        }

        console.log(
            "Updating notification sound for:",
            email
        );

        const data =
            await UpdateNotificationSound(
                email,
                isMuted,
                token
            );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Update notification sound API error:",
            error
        );

        return Response.json(
            {
                error:
                    "Failed to update notification sound",
            },
            { status: 500 }
        );
    }
}