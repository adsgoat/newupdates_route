import CreateS3FileOrFolder from "@/services/campaigns/s3/uploadfileorfolder";
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";

export async function POST(request) {
    try {
        const client = await getRedisClient();
        const email = await getSessionEmailByAuth();
        const token = await client.get(`auth_token_${email}`);

        if (!token) {
            return Response.json(
                { error: "Authentication token not found" },
                { status: 401 }
            );
        }

        const headers = {
            "x-folder": request.headers.get("x-folder"),
            "x-action": request.headers.get("x-action"),
            username: request.headers.get("username"),
        };

        const contentType = request.headers.get("content-type") || "";

        let body;

        if (contentType.includes("multipart/form-data")) {
            body = await request.formData();
        } else {
            body = null;
        }

        const data = await CreateS3FileOrFolder(body, headers, token);

        return Response.json(data);
    } catch (error) {
        console.error("S3 API error:", error.response?.data || error);

        return Response.json(
            {
                error:
                    error.response?.data?.message ||
                    error.message ||
                    "S3 operation failed",
            },
            {
                status: error.response?.status || 500,
            }
        );
    }
}