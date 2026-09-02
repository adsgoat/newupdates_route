import axios from "axios";

export default async function KeywordReports(token, start, end, time, network, accounts) {
    const apiCall = await axios.get(`http://test.app.vyaktimetrics.com/reports/data/tonicrsockeyword?startDate=${start}&endDate=${end}&accountNumber=${accounts}&timezone=${time}&collectionName=${network}`,
        { headers: { Authorization: token } });
    const res = apiCall.data;
    return res;
}