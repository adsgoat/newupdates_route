import axios from "axios";

export default async function NotificationView(
    email,
    key,
    item,
    token
) {
    const apiCall = await axios.put(
        "http://test.app.vyaktimetrics.com/open/notifications/view",
        {
            email,
            key,
            item,
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