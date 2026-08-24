// import getRedisClient from "@/lib/redis";
// import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
// import UploadUserFiles from "@/services/creatives/uploadUserFiles";

// export async function POST(request) {
//     const client = await getRedisClient();

//     const email = await getSessionEmailByAuth();
//     const token = await client.get(`auth_token_${email}`);

//     const formData = await request.formData();
//     const username = formData.get("username");

//     formData.delete("username");

//     const data = await UploadUserFiles(
//         {
//             formData,
//             username,
//         },
//         token
//     );

//     return Response.json(data);
// }
import getRedisClient from "@/lib/redis";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import UploadUserFiles from "@/services/creatives/uploadUserFiles";

export async function POST(request) {
    try {
        const client = await getRedisClient();

        const email = await getSessionEmailByAuth();

        const token = await client.get(
            `auth_token_${email}`
        );

        const formData = await request.formData();

        const username =
            formData.get("username");

        formData.delete("username");

        console.log(
            "========== UPLOAD API =========="
        );

        console.log("Email:", email);
        console.log("Username:", username);
        console.log("Token exists:", !!token);

        for (const [key, value] of formData.entries()) {
            console.log(
                key,
                value instanceof File
                    ? {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                    }
                    : value
            );
        }

        const data = await UploadUserFiles(
            {
                formData,
                username,
            },
            token
        );

        console.log(
            "Upload service response:",
            data
        );

        return Response.json(data);
    } catch (error) {
        console.error(
            "========== UPLOAD API ERROR =========="
        );

        console.error(error);

        return Response.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Upload failed",
            },
            {
                status: 500,
            }
        );
    }
}