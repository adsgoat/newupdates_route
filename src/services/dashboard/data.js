import axios from "axios";

export default async function DataForDashboard(reqData, token) {
    // console.log(token);
    const {time, startDate, endDate, transformedObject} = reqData;
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/dashboard/data?timezone=${time}&start_date=${startDate}&end_date=${endDate}`, { formattedData: transformedObject }, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}