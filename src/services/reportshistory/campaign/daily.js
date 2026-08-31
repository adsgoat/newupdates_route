import axios from "axios";

export default async function CampaignData(CampaignId, network, timezone, accountNumber, token) {
    const apiCall = await axios.get(`http://localhost:4000/reports/dailyhistory/campaignhistory/v2?accountNumber=${accountNumber}&timezone=${timezone}&network=${network}&CampaignId=${CampaignId}`, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}