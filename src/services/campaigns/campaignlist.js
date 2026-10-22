import axios from "axios";

export default async function CampaignsList(token, accountNumber, network, startDate, endDate, search) {
    const apiCall = await axios.get(`${process.env.CAMPAIGN_LAUNCHER}/open/campaigns/list/v2?accountNumber=${accountNumber}&network=${network}&startDate=${startDate}&endDate=${endDate}&searchInput=${search}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}