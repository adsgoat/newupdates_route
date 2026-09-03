import axios from "axios";

export default async function AdsetStatusUpdate(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/historyactions/adsetstatus`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}