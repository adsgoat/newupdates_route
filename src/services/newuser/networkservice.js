import axios from "axios";

export default async function GetNetworksData(token) {
    const apiCall = await axios.get(
        "https://app.vyaktimetrics.com/userrole/networks",
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}