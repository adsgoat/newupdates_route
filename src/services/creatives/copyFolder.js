import axios from "axios";

export default async function CopyFolder(reqData, token) {
    const { sourceKey, destinationKey, username } = reqData;

    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/creatives/folders/copyfolder",
        {
            sourceKey,
            destinationKey,
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