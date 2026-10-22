import axios from "axios";

export default async function AdsetStatus(reqData, token) {
    const apiCall = await axios.post(`${process.env.CAMPAIGN_LAUNCHER}/adsets/version2/status`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}