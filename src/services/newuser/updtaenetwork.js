import axios from "axios";

export default async function UpdateNetwork(
    updatedNetwork,
    token
) {
    const apiCall = await axios.put(
        "http://test.app.vyaktimetrics.com/userrole/networks",
        {
            updatedNetwork,
        },
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}