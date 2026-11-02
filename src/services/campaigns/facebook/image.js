import axios from "axios";

export default async function CreateImageHash(body, account) {
    const apiCall = await axios.post(`https://graph.facebook.com/v23.0/act_${account}/adimages`,
        body,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
            }
        }
    );
    const res = apiCall.data;
    return res;
}