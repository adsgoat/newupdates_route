import axios from "axios";

export default async function GetVideoThumbnails(videoid, token) {
    const { data } = await axios.get(
        `https://graph.facebook.com/v23.0/${encodeURIComponent(videoid)}`,
        {
            params: {
                access_token: token,
                fields: "thumbnails",
            },
            timeout: 120000,
        }
    );

    return data;
}