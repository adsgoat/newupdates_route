
// export default async function UploadUserFiles(reqData, token) {
//     const { formData, username } = reqData;
//     const response = await fetch(
//         "http://test.app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
//         {
//             method: "POST",
//             headers: {
//                 Authorization: token,
//                 username,
//             },
//             body: formData,
//         }
//     );

//     const responseText = await response.text();
//     if (!response.ok) {
//         throw new Error(
//             `Upload API failed (${response.status}): ${responseText}`
//         );
//     }

//     try {
//         return JSON.parse(responseText);
//     } catch {
//         return responseText;
//     }
// }


export default async function UploadUserFiles(
    reqData,
    token
) {
    const {
        formData,
        username,
        folder,
        action,
    } = reqData;

    const headers = {
        Authorization: token,
        username,
    };

    if (folder) {
        headers["x-folder"] = folder;
    }

    if (action) {
        headers["x-action"] = action;
    }

    const response = await fetch(
        "http://test.app.vyaktimetrics.com/creatives/userfiles/uploaduserfiles",
        {
            method: "POST",
            headers,
            body: formData,
        }
    );

    const responseText =
        await response.text();

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