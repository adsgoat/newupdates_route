import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import SaveProfileImage from "@/services/topbar/saveprofile";

export async function POST(request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return Response.json(
                { error: "Image URL is required" },
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

        const token = await client.get(`auth_token_${email}`);

        if (!token) {
            return Response.json(
                { error: "Authentication token not found" },
                { status: 401 }
            );
        }

        const data = await SaveProfileImage(
            email,
            imageUrl,
            token
        );

        // Optional: keep Redis profile image in sync
        await client.set(`profileImage_${email}`, imageUrl);

        return Response.json(data);
    } catch (error) {
        console.error("Save profile image API error:", error);

        return Response.json(
            { error: "Failed to save profile image" },
            { status: 500 }
        );
    }
}