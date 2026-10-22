import axios from "axios";

export default async function DeleteFolder(reqData, token) {
    const { username, folderKey } = reqData;

    const apiCall = await axios.delete(
        "http://test.app.vyaktimetrics.com/creatives/folders/deletefolder",
        {
            headers: {
                Authorization: token,
                username,
                "x-folder": folderKey,
            },
        }
    );

    return apiCall.data;
}