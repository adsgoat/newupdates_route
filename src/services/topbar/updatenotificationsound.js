import axios from "axios";

export default async function UpdateNotificationSound(
    email,
    isMuted,
    token
) {
    const apiCall = await axios.put(
        "https://app.vyaktimetrics.com/open/notifications/sound",
        {
            email,
            isMuted,
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