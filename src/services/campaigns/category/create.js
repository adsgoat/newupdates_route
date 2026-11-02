import axios from "axios";

export default async function CategoryCreate(body, token) {
    const apiCall = await axios.post(`https://fblaunching.vyaktimetrics.com/open/report-category/post`,
        body,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}