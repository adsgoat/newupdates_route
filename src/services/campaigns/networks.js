import axios from "axios";

export default async function Networks(token) {
    const apiCall = await axios.get(`https://fblaunching.vyaktimetrics.com/open/get/networksData`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}