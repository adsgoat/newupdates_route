import axios from "axios";

export default async function Networks(token) {
    const apiCall = await axios.get(`${process.env.CAMPAIGN_LAUNCHER}/open/get/networksData`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}