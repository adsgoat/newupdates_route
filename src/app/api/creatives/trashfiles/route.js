import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import GetTrashFiles from "@/services/creatives/getTrashFiles";
import PermanentDeleteService from "@/services/creatives/permanentlydelete";
import RestoreService from "@/services/creatives/restore";


// GET - Get trash files
export async function GET(request) {
    const client = await getRedisClient();

    const email = await getSessionEmailByAuth();
    const token = await client.get(`auth_token_${email}`);

    const { searchParams } = new URL(request.url);

    const username = searchParams.get("username");
    const folder = searchParams.get("folder");

    const data = await GetTrashFiles(
        {
            username,
            folder,
        },
        token
    );

    return Response.json(data);
}

export async function POST(request) {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();
        const token = await client.get(`auth_token_${email}`);

        const username = request.headers.get("username");

        const {
            trashKey,
            originalKey,
        } = await request.json();

        console.log("========== RESTORE API ==========");
        console.log("email:", email);
        console.log("username:", username);
        console.log("token exists:", !!token);
        console.log("trashKey:", trashKey);
        console.log("originalKey:", originalKey);

        if (!username || !trashKey || !originalKey) {
            return Response.json(
                {
                    message:
                        "username, trashKey and originalKey are required",
                },
                {
                    status: 400,
                }
            );
        }

        const data = await RestoreService({
            username,
            trashKey,
            originalKey,
            token,
        });

        return Response.json(data);
    } catch (error) {
        console.error(
            "========== RESTORE API ERROR =========="
        );

        console.error("message:", error.message);
        console.error(
            "status:",
            error.response?.status
        );
        console.error(
            "data:",
            error.response?.data
        );

        return Response.json(
            {
                message:
                    error.response?.data?.message ||
                    error.response?.data ||
                    error.message ||
                    "Failed to restore",
            },
            {
                status:
                    error.response?.status || 500,
            }
        );
    }
}

// DELETE - Permanently delete
export async function DELETE(request) {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();
        const token = await client.get(`auth_token_${email}`);

        const username = request.headers.get("username");
        const fileKey = request.headers.get("x-file");

        console.log("========== PERMANENT DELETE API ==========");
        console.log("email:", email);
        console.log("username:", username);
        console.log("fileKey:", fileKey);
        console.log("token exists:", !!token);

        if (!username || !fileKey) {
            return Response.json(
                {
                    message: "username and x-file are required",
                },
                {
                    status: 400,
                }
            );
        }

        const data = await PermanentDeleteService(
            {
                username,
                fileKey,
            },
            token
        );

        console.log("Permanent delete response:", data);

        return Response.json(data);
    } catch (error) {
        console.error(
            "========== PERMANENT DELETE ERROR =========="
        );

        console.error("message:", error.message);
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
        console.error("headers:", error.response?.headers);

        return Response.json(
            {
                message:
                    error.response?.data?.message ||
                    error.response?.data ||
                    error.message ||
                    "Failed to delete permanently",
            },
            {
                status: error.response?.status || 500,
            }
        );
    }
}

