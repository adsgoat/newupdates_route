import axios from "axios";

const PermanentDeleteService = async (
    {
        username,
        fileKey,
    },
    token
) => {
    try {
        console.log(
            "========== PERMANENT DELETE SERVICE =========="
        );

        console.log("username:", username);
        console.log("fileKey:", fileKey);
        console.log("token exists:", !!token);

        const response = await axios.delete(
            "http://test.app.vyaktimetrics.com/creatives/trashfiles",
            {
                headers: {
                    Authorization: token,
                    username,
                    "x-file": fileKey,
                },
            }
        );

        console.log(
            "Backend response:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "PermanentDeleteService error:"
        );

        console.error(
            "status:",
            error.response?.status
        );

        console.error(
            "data:",
            error.response?.data
        );

        throw error;
    }
};

export default PermanentDeleteService;