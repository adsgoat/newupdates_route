import axios from "axios";

export default async function CommentsUpdate(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/historyactions/comments/update`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}