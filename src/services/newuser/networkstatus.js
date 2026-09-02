import axios from "axios";
export  default async function UpdateNetworkStatus(
    token,
    revenuePartner,
    status
) {
    const apiCall = await axios.patch(
        "http://test.app.vyaktimetrics.com/userrole/networks",
        null,
        {
            params: {
                revenuePartner,
                Status: status,
            },
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}