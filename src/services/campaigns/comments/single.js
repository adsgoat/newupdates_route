import axios from "axios";

export default async function CampaignCommentSingle(reqData, token) {
    const apiCall = await axios.post(`${process.env.CAMPAIGN_LAUNCHER}/open/launcher-comments`, reqData,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}