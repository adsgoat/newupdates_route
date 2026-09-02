import axios from "axios";

export default async function UpdateUserData(token, formDataToSend) {
    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/userrole/updates",
        formDataToSend,
        {
            headers: {
                Authorization: token,
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return apiCall.data;
}