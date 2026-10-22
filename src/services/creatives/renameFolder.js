import axios from "axios";

export default async function RenameFolder(reqData, token) {
    const { oldFolderKey, newFolderKey, username } = reqData;

    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/creatives/folders/renamefolder",
        {
            oldFolderKey,
            newFolderKey,
        },
        {
            headers: {
                Authorization: token,
                username,
            },
        }
    );

    return apiCall.data;
}