import axios from "axios";

export default async function CampaignDelete(id, token) {
    const apiCall = await axios.delete(`https://fblaunching.vyaktimetrics.com/open/campaigns/${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}