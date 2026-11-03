import axios from "axios";

export default async function CampaignBudgetUpdate(reqData, token) {
    const apiCall = await axios.post(`https://app.vyaktimetrics.com/reports/historyactions/campaignbudget`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}