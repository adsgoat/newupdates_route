import axios from "axios";

export default async function AddAccountData(
    token,
    newAccount
) {
    const response = await axios.post(
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

    return response;
}