import axios from "axios";

export default async function UrlBuilder(token, network) {
    const apiCall = await axios.get(`https://fblaunching.vyaktimetrics.com/open/get/urlbuilderdata?network=${network}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}