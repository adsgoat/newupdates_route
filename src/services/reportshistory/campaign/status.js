import axios from "axios";

export default async function CampaignStatusUpdate(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/historyactions/campaignstatus`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}