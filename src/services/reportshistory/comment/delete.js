import axios from "axios";
export default async function CommentsDelete(reqData, token) {
    const apiCall = await axios.post(`http://test.app.vyaktimetrics.com/reports/historyactions/comments/delete`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}