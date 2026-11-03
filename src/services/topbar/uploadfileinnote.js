import axios from "axios";

export default async function UploadUserFiles(formData, token, username) {
    const apiCall = await axios.post(
        "https://app.vyaktimetrics.com/open/notes/uploadUserFiles",
        formData,
        {
            headers: {
                Authorization: token,
                username: username,
            },
        }
    );

    return apiCall.data;
}