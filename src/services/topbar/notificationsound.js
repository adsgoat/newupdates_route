import axios from "axios";

export default async function GetNotificationSoundData(
    email,
    token
) {
    const apiCall = await axios.get(
        "https://app.vyaktimetrics.com/open/notifications/sound",
        {
            params: {
                email,
            },
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}