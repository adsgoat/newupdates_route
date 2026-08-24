import axios from "axios";

export default async function DeleteFolder(reqData, token) {
    const { username, folder } = reqData;

    const apiCall = await axios.delete(
        "http://test.app.vyaktimetrics.com/creatives/folders/deletefolder",
        {
            headers: {
                Authorization: token,
                username,
                "x-folder": folder,
            },
        }
    );

    return apiCall.data;
}