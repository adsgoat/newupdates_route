import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import DeleteNote from "@/services/topbar/deletesinglenote";

export async function DELETE(request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return Response.json(
                {
                    error: "Note ID is required",
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

        const data = await DeleteNote(
            email,
            id,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Delete sticky note API error:",
            error?.response?.data || error
        );

        return Response.json(
            {
                error: "Failed to delete sticky note",
            },
            {
                status: 500,
            }
        );
    }
}