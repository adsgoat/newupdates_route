import axios from "axios";

export default async function CopyFolder(reqData, token) {
    const { sourceKey, destinationKey, username } = reqData;

    try {
        const apiCall = await axios.post(
            "http://test.app.vyaktimetrics.com/creatives/folders/copyfolder",
            {
                sourceKey,
                destinationKey,
            },
            {
                headers: {
                    Authorization: token,
                    username,
                },
            }
        );

        return apiCall.data;

    } catch (error) {
        console.error(
            "========== COPY FOLDER API ERROR =========="
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "Response:",
            error.response?.data
        );

        console.error(
            "Message:",
            error.message
        );

        throw new Error(
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Folder copy failed"
        );
    }
}