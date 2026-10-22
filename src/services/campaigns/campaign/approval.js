import axios from "axios";

export default async function CampaignApprove(id, reqData, token) {
    const apiCall = await axios.put(`${process.env.CAMPAIGN_LAUNCHER}/open/approval/campaign/${id}`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}