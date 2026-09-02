import axios from "axios";

export default async function DomainDataForDashboard(token) {
    // console.log(token);
    const apiCall = await axios.get("http://test.app.vyaktimetrics.com/dashboard/getNetworksData", {
        headers:{
            Authorization: token
        }
    });
    const res = apiCall.data;
    return res;
}