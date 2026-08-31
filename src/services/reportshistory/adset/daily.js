import axios from "axios";

export default async function AdsetData(AdsetId, network, timezone, accountNumber, token) {
    const apiCall = await axios.get(`http://localhost:4000/reports/dailyhistory/adsethistory/v2?accountNumber=${accountNumber}&timezone=${timezone}&network=${network}&AdsetId=${AdsetId}`, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}