import axios from "axios";

export default async function CategoryDelete(accountNumber, id, token) {
    const apiCall = await axios.delete(`https://fblaunching.vyaktimetrics.com/open/report-category/${accountNumber}/${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}