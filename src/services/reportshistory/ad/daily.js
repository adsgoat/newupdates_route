import axios from "axios";

export default async function AdData(AdId, network, timezone, accountNumber, token) {
    const apiCall = await axios.get(`http://localhost:4000/reports/dailyhistory/adhistory/v2?accountNumber=${accountNumber}&timezone=${timezone}&network=${network}&AdId=${AdId}`, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}