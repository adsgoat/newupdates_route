import axios from "axios";

export default async function ColumnStructreOfUsersForReports(email, token) {
    const apiCall = await axios.get(`http://test.app.vyaktimetrics.com/reports/commonapis/columnStructure?email=${email}`, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}