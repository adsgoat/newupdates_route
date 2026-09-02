import axios from "axios";

export default async function UpdateUrlBuilder(
    updatedData,
    token
) {
    const apiCall = await axios.put(
        "http://test.app.vyaktimetrics.com/userrole/urlbuilder",
        {
            updatedData,
        },
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}