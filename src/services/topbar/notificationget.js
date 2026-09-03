import axios from "axios";

export default async function GetNotificationsData(email, token) {
    const apiCall = await axios.get(
        `http://test.app.vyaktimetrics.com/open/notifications/${encodeURIComponent(email)}`,
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}