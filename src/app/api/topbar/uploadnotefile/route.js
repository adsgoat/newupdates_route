import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UploadUserFiles from "@/services/topbar/uploadfileinnote";

export async function POST(request) {
    try {
        const email = await getSessionEmailByAuth();

        if (!email) {
            return Response.json(
                { error: "Email not found" },
                { status: 401 }
            );
        }

        const client = await getRedisClient();

        const token = await client.get(`auth_token_${email}`);

        if (!token) {
            return Response.json(
                { error: "Authentication token not found" },
                { status: 401 }
            );
        }

        // Get user details from Redis
        const userdetailsRaw = await client.get(
            `userdetails_${email}`
        );

        if (!userdetailsRaw) {
            return Response.json(
                { error: "User details not found" },
                { status: 404 }
            );
        }

        const userdetails = JSON.parse(userdetailsRaw);

        const username =
            userdetails?.userName ||
            userdetails?.username;

        if (!username) {
            return Response.json(
                { error: "Username not found in Redis user details" },
                { status: 400 }
            );
        }

        // Get uploaded file data
        const formData = await request.formData();

        // Username is NOT taken from formData
        const data = await UploadUserFiles(
            formData,
            token,
            username
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "Upload user file API error:",
            error?.response?.data || error
        );

        return Response.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}