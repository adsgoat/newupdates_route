import axios from "axios";

export default async function CampaignHistory(id, token) {
    const apiCall = await axios.get(`https://fblaunching.vyaktimetrics.com/campaigns/history/${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}