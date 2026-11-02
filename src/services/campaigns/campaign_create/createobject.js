import axios from "axios";

export default async function CreateCampaignObject(body, token) {
    const apiCall = await axios.post("https://fblaunching.vyaktimetrics.com/open/campaigns/submit",
        body,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
        }
    );

    const res = apiCall.data;
    return res;
}