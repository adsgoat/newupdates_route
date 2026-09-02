import axios from "axios";

export default async function UpdateAccountStatus(
    accountNumber,
    status,
    token
) {
    const apiCall = await axios.patch(
        `http://test.app.vyaktimetrics.com/userrole/accounts?accountNumber=${encodeURIComponent(
            accountNumber
        )}&status=${encodeURIComponent(status)}`,
        {},
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}