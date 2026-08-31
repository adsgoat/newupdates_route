import axios from "axios";

export default async function GetUrlBuilderData(token) {
    const apiCall = await axios.get(
        "http://test.app.vyaktimetrics.com/userrole/urlbuilder",
        {
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}