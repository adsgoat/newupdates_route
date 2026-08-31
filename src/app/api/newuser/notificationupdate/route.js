import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UpdateUserData from "@/services/newuser/updatenotification";

export async function POST(request) {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        const token = await client.get(`auth_token_${email}`);

        const formData = await request.formData();

        const data = await UpdateUserData(token, formData);

        return Response.json(data);
    } catch (error) {
        console.error("Update user API error:", error);

        return Response.json(
            {
                message: error?.response?.data || error.message,
            },
            {
                status: error?.response?.status || 500,
            }
        );
    }
}