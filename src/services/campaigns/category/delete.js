import axios from "axios";

export default async function CategoryDelete(accountNumber, id, token) {
    const apiCall = await axios.delete(`${process.env.CAMPAIGN_LAUNCHER}/open/report-category/${accountNumber}/${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}