import axios from "axios";

export default async function CampaignData(CampaignId, network, timezone, accountNumber, token) {
    const apiCall = await axios.get(`http://test.app.vyaktimetrics.com/reports/livehistory/campaignhistory/v2?accountNumber=${accountNumber}&timezone=${timezone}&network=${network}&CampaignId=${CampaignId}`, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}