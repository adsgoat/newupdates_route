import axios from "axios";

export default async function AdRejectReasonUpdate(reqData, token) {
    const apiCall = await axios.put(`${process.env.CAMPAIGN_LAUNCHER}/ads/version2/reject/reason`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}