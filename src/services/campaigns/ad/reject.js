import axios from "axios";

export default async function AdReject(reqData, token) {
    const apiCall = await axios.post(`https://fblaunching.vyaktimetrics.com/ads/version2/reject`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}