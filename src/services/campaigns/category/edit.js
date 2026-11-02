import axios from "axios";

export default async function CategoryEdit(accountNumber, id, body, token) {
    console.log("CategoryEdit", accountNumber, id, body, token);
    const apiCall = await axios.patch(`https://fblaunching.vyaktimetrics.com/open/report-category/${accountNumber}/${id}`,
        body,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}