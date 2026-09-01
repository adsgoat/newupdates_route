import axios from "axios";

export default async function AdsetBudgetAndBidUpdate(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/historyactions/adsetbudget`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}