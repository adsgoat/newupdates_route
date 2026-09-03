import { NextResponse } from "next/server";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function DELETE() {
    try {
        const client = await getRedisClient();
        const email = await getSessionEmailByAuth();

        if (!email) {
            return NextResponse.json(
                { error: "Email not found" },
                { status: 401 }
            );
        }

        // Clear Redis user/session data
        const keys = [
            `auth_token_${email}`,
            `auth_${email}`,
            `userdetails_${email}`,
            `permissions_${email}`,
            `userData_${email}`,
            `profileImage_${email}`,
        ];

        for (const key of keys) {
            try {
                await client.del(key);
                console.log(`Deleted Redis key: ${key}`);
            } catch (error) {
                console.error(
                    `Failed to delete Redis key: ${key}`,
                    error
                );
            }
        }

        // Do NOT delete:
        // theme_${email}

        const response = NextResponse.json({
            success: true,
            message: "Logout successful",
        });

        // Clear authentication cookies
        const cookiesToClear = [
            "auth_token",
            "token",
            "session",
            "next-auth.session-token",
            "__Secure-next-auth.session-token",
        ];

        cookiesToClear.forEach((cookieName) => {
            response.cookies.set(cookieName, "", {
                expires: new Date(0),
                path: "/",
            });
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);

        return NextResponse.json(
            {
                error: error?.message || "Logout failed",
            },
            { status: 500 }
        );
    }
}