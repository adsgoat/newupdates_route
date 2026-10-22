import axios from "axios";

export default async function CampaignDelete(id, token) {
    const apiCall = await axios.delete(`${process.env.CAMPAIGN_LAUNCHER}/open/campaigns/${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}