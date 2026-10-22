import axios from "axios";

export default async function CampaignCommentBulk(reqData, token) {
    const apiCall = await axios.post(`${process.env.CAMPAIGN_LAUNCHER}/open/comments/bulk-create`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}