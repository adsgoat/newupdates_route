import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import DeleteMultipleNotes from "@/services/topbar/deleteservice";

export async function DELETE(request) {
    try {
        const body = await request.json();

        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return Response.json(
                {
                    error: "Note IDs are required",
                },
                {
                    status: 400,
                }
            );
        }

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

        const client = await getRedisClient();

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

        const data = await DeleteMultipleNotes(
            email,
            ids,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Delete multiple sticky notes API error:",
            error?.response?.data || error
        );

        return Response.json(
            {
                error: "Failed to delete sticky notes",
            },
            {
                status: 500,
            }
        );
    }
}