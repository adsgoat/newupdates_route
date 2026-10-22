import axios from "axios";

export default async function GetNetworksData(token) {
    const apiCall = await axios.get(
        "http://test.app.vyaktimetrics.com/creatives/commonapis/networksdata",
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}