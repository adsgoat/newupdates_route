import axios from "axios";

export default async function LatestHourForReports(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/data/latesthour`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}