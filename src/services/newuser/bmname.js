import axios from "axios";

export default async function GetBMNames(token) {
    const apiCall = await axios.get(
        "http://test.app.vyaktimetrics.com/getBMNames/",
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}