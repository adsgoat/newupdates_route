import axios from "axios";

export default async function GetTrashFiles(reqData, token) {
    const { username, folder } = reqData;

    const apiCall = await axios.get(
        "http://test.app.vyaktimetrics.com/creatives/trashfiles",
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