import axios from "axios";

export default async function MarkAllNotificationsAsSeen(
    email,
    token
) {
    const apiCall = await axios.put(
        "http://test.app.vyaktimetrics.com/open/notifications/viewall",
        {
            email,
        },
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}