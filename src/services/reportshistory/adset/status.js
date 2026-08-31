import axios from "axios";

export default async function AdsetStatusUpdate(reqData, token) {
    const apiCall = await axios.post(`http://localhost:4000/reports/historyactions/adsetstatus`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}