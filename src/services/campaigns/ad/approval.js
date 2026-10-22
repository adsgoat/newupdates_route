import axios from "axios";

export default async function AdApprove(reqData, token) {
    const apiCall = await axios.post(`${process.env.CAMPAIGN_LAUNCHER}/ads/version2/approval`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}