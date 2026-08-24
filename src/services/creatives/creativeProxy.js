import axios from "axios";

export default async function GetCreativeProxy(reqData, token) {
    const { url } = reqData;

    const apiCall = await axios.get(
        `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(url)}`,
        {
            headers: {
                Authorization: token,
            },
            responseType: "arraybuffer",
        }
    );

    return apiCall;
}