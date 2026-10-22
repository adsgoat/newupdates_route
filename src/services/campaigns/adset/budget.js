import axios from "axios";

export default async function AdsetBudget(reqData, token) {
    const apiCall = await axios.post(`${process.env.CAMPAIGN_LAUNCHER}/adsets/version2/budget`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}