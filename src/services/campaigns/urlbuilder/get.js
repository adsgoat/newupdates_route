import axios from "axios";

export default async function UrlBuilder(token, network) {
    const apiCall = await axios.get(`${process.env.CAMPAIGN_LAUNCHER}/open/get/urlbuilderdata?network=${network}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}