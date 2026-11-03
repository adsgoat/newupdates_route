import axios from "axios";

export default async function PinUpdate(reqData, token) {
    // console.log(token);
    // const {time, startDate, endDate, transformedObject} = reqData;
    const apiCall = await axios.post(`https://app.vyaktimetrics.com/reports/singleactions/pin`, reqData, {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}