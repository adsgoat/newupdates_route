import axios from "axios";

export default async function CampaignHistory(id, token) {
    const apiCall = await axios.get(`${process.env.CAMPAIGN_LAUNCHER}/campaigns/history/${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}