import axios from "axios";

export default async function CampaignBudgetUpdate(reqData, token) {
    // console.log(token);
    // const {time, startDate, endDate, transformedObject} = reqData;
    const apiCall = await axios.post(`https://app.vyaktimetrics.com/reports/singleactions/campaignbudget`, reqData, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}