import axios from "axios";

export default async function DeleteUserFile(reqData, token) {
    const { username, key } = reqData;

    const apiCall = await axios.delete(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/deleteuserfiles",
        {
            headers: {
                Authorization: token,
                username,
                "file-key": key,
            },
            data: {
                key,
            },
        }
    );

    return apiCall.data;
}