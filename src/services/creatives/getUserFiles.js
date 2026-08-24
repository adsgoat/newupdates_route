import axios from "axios";

export default async function GetUserFiles(reqData, token) {
    const { username, folder } = reqData;

    const apiCall = await axios.get(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/getuserfiles",
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