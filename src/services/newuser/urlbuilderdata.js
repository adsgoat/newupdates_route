import axios from "axios";

export default async function GetUrlBuilderData(
    network,
    token
) {
    const apiCall = await axios.get(
        "https://fblaunching.vyaktimetrics.com/open/get/urlbuilderdata",
        {
            params: {
                network,
            },
            headers: {
                Authorization: token,
            },
        }
    );

    return apiCall.data;
}