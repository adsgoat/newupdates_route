import axios from "axios";

export default async function AdsetDataForReports(reqData, token) {
    // console.log(token);
    // const {time, startDate, endDate, transformedObject} = reqData;
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/data/adset`, reqData, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}