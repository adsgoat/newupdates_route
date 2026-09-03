import axios from "axios";

export default async function UploadProfileImage(file, token) {
    const formData = new FormData();

    formData.append("file", file);

    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/uploaduserimage",
        formData,
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}