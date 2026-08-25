
export default async function UploadUserFiles(reqData, token) {
    const { formData, username } = reqData;
    const response = await fetch(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
        {
            method: "POST",
            headers: {
                Authorization: token,
                username,
            },
            body: formData,
        }
    );

    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(
            `Upload API failed (${response.status}): ${responseText}`
        );
    }

    try {
        return JSON.parse(responseText);
    } catch {
        return responseText;
    }
}