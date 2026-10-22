import axios from "axios";

export default async function CampaignBudget(id, reqData, token) {
    const apiCall = await axios.put(`${process.env.CAMPAIGN_LAUNCHER}/campaigns/budget/v2/${id}`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}