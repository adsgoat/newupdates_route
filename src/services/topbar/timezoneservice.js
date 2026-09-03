import axios from "axios";

export default async function GetTimezonesData(token) {
    const apiCall = await axios.get(
        "http://test.app.vyaktimetrics.com/open/globalclock/timezones",
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}