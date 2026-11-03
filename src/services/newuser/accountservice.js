import axios from "axios";

export default async function GetAccountsData(token) {
    const apiCall = await axios.get(
        "https://app.vyaktimetrics.com/userrole/accounts",
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}