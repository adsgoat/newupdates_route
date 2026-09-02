import axios from "axios";

export default async function UploadUserFiles(reqData, token) {
    const { formData, username } = reqData;

    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
        formData,
        {
            headers: {
                Authorization: token,
                username,
            },
        }
    );

    return apiCall.data;
}