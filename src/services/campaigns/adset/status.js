import axios from "axios";

export default async function AdsetStatus(reqData, token) {
    const apiCall = await axios.post(`https://fblaunching.vyaktimetrics.com/adsets/version2/status`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}