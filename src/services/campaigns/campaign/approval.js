import axios from "axios";

export default async function CampaignApprove(id, reqData, token) {
    const apiCall = await axios.put(`https://fblaunching.vyaktimetrics.com/open/approval/campaign/${id}`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}