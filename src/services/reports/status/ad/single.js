import axios from "axios";

export default async function AdStatusUpdate(reqData, token) {
    // console.log(token);
    // const {time, startDate, endDate, transformedObject} = reqData;
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/singleactions/adstatusv2`, reqData, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}