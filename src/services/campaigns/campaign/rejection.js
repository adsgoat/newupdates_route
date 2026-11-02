import axios from "axios";

export default async function CampaignReject(id, reqData, token) {
    const apiCall = await axios.put(`https://fblaunching.vyaktimetrics.com/open/reject/campaign/${id}`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}