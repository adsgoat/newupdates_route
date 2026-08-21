import axios from "axios";

export default async function DayOfHourForReports(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/data/campaignhourlybreakdown`, reqData, {
        headers:{ Authorization: token }
    });
    const res = apiCall.data;
    return res;
}