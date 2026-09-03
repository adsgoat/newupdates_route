import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UploadProfileImage from "@/services/topbar/profileuserimage";

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

        const formData = await request.formData();

        const file = formData.get("file");

        if (!file) {
            return Response.json(
                { error: "Image file is required" },
                { status: 400 }
            );
        }

        const data = await UploadProfileImage(file, token);

        if (!data?.imageUrl) {
            return Response.json(
                { error: "Image URL not returned from upload API" },
                { status: 500 }
            );
        }

        // Save image URL in Redis
        await client.set(
            `profileImage_${email}`,
            data.imageUrl
        );

        return Response.json({
            success: true,
            imageUrl: data.imageUrl,
        });
    } catch (error) {
        console.error("Profile image upload error:", error);

        return Response.json(
            { error: "Failed to upload profile image" },
            { status: 500 }
        );
    }
}