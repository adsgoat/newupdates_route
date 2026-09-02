import axios from "axios";

export default async function RenameUserFile(reqData, token) {
    const { key, newFilename, username } = reqData;

    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/renameuserfile",
        {
            key,
            newFilename,
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