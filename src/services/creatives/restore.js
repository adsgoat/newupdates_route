import axios from "axios";

export default async function RestoreService({
    token,
    username,
    trashKey,
    originalKey,
}) {
    try {
        console.log("========== RESTORE SERVICE ==========");
        console.log("username:", username);
        console.log("token exists:", !!token);
        console.log("trashKey:", trashKey);
        console.log("originalKey:", originalKey);

        const response = await axios.post(
            `http://test.app.vyaktimetrics.com/creatives/trashfiles`,
            {
                trashKey,
                originalKey,
            },
            {
                headers: {
                    Authorization: token,
                    username,
                },
            }
        );

        console.log(
            "RESTORE BACKEND RESPONSE:",
            response.status,
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "========== RESTORE SERVICE ERROR =========="
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
        console.error(
            "headers:",
            error.response?.headers
        );

        throw error;
    }
}