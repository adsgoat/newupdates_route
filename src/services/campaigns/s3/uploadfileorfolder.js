import axios from "axios";

export default async function CreateS3FileOrFolder(body, headers, token) {
    const requestHeaders = {
        Authorization: token,
        username: headers.username,
    };

    if (headers["x-action"]) {
        requestHeaders["x-action"] = headers["x-action"];
    }

    if (headers["x-folder"]) {
        requestHeaders["x-folder"] = headers["x-folder"];
    }

    const { data } = await axios.post(
        "https://app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
        body,
        {
            headers: requestHeaders,
            timeout: 120000,
        }
    );

    return data;
}