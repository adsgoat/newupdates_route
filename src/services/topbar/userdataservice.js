import axios from "axios";

export default async function GetUserData(email, token) {
    const apiCall = await axios.get(
        `http://test.app.vyaktimetrics.com/auth/user/verify?email=${encodeURIComponent(email)}`,
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}