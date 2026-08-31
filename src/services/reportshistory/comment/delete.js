import axios from "axios";
export default async function CommentsDelete(reqData, token) {
    const apiCall = await axios.post(`http://localhost:4000/reports/historyactions/comments/delete`, reqData, {
        headers: { Authorization: token }
    });
    const res = apiCall.data;
    return res;
}