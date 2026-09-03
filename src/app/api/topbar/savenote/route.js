import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import SaveNotes from "@/services/topbar/savenote";

export async function POST(request) {
    try {
        const body = await request.json();

        const { notes } = body;

        if (!Array.isArray(notes)) {
            return Response.json(
                {
                    error: "Notes are required",
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

        const data = await SaveNotes(
            email,
            notes,
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Save sticky notes API error:",
            error?.response?.data || error
        );

        return Response.json(
            {
                error: "Failed to save sticky notes",
            },
            {
                status: 500,
            }
        );
    }
}