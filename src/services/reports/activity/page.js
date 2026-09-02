import axios from "axios";

export default async function ReportsActivity(token, accountNumber,  campaignId) {
    // console.log(token);
    const apiCall = await axios.get(`http://test.app.vyaktimetrics.com/reports/data/reportscampaignhistory?accountNumber=${accountNumber}&campaignid=${campaignId}`, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}