import axios from "axios";

export default async function ColumnStructreOfUsersForReportsHistory(reqData, token, email) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/historyactions/columnstructure?email=${email}`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}