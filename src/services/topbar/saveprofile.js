import axios from "axios";

export default async function SaveProfileImage(email, imageUrl, token) {
    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/open/userimage",
        {
            email,
            imageUrl,
        },
        {
            headers: {
                Authorization: token,
                accept: "application/json",
                "Content-Type": "application/json",
            },
        }
    );

    return apiCall.data;
}