import axios from "axios";

export default async function AdStatus(reqData, token) {
    const apiCall = await axios.post(`${process.env.CAMPAIGN_LAUNCHER}/ads/version2/status`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}