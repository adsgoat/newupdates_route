import axios from "axios";

export default async function ColumnStructreOfUsersForReports(reqData, token, email) {
    const apiCall = await axios.put(`http://test.app.vyaktimetrics.com/reports/commonapis/columnStructure?email=${email}`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}