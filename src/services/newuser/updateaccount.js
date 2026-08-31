import axios from "axios";

export default async function UpdateAccount(
    newAccount,
    token
) {
    const apiCall = await axios.put(
        "http://test.app.vyaktimetrics.com/userrole/accounts",
        {
            newAccount,
        },
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}