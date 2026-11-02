import axios from "axios";

export default async function CampaignStatus(id, reqData, token) {
    const apiCall = await axios.put(`https://fblaunching.vyaktimetrics.com/campaigns/status/v2/${id}`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}