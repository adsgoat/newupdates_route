import axios from "axios";

export default async function HourlyForReports(reqData, token) {
    // console.log(token);
    // const {time, startDate, endDate, transformedObject} = reqData;
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/data/campaignhourly`, reqData, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}