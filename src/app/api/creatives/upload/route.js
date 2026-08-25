import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UploadUserFiles from "@/services/creatives/uploadUserFiles";

export async function POST(request) {
    try {
        const client = await getRedisClient();
        const email = await getSessionEmailByAuth();
        const token = await client.get(`auth_token_${email}`);
        const formData = await request.formData();
        const username = request.headers.get("username");
        const data = await UploadUserFiles(
            {
                formData,
                username,
            },
            token
        );

        return Response.json(data);
    } catch (error) {
        console.error("CREATIVE UPLOAD ERROR:", error);

        return Response.json(
            {
                error: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
