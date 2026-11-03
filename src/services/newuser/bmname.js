import axios from "axios";

export default async function GetBMNames(token) {
    const apiCall = await axios.get(
        "https://app.vyaktimetrics.com/getBMNames/",
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}