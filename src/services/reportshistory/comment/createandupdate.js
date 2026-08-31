import axios from "axios";

export default async function CommentsUpdate(reqData, token) {
    const apiCall = await axios.post(`http://localhost:4000/reports/historyactions/comments/update`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}