import axios from "axios";

export default async function NetworksDataForReports(token) {
    // console.log(token);
    const apiCall = await axios.get("http://test.app.vyaktimetrics.com/reports/commonapis/networkdata", {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}