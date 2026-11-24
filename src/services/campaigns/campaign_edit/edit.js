import axios from "axios";

export default async function EditCampaignObject(body, token) {
    const apiCall = await axios.patch("https://fblaunching.vyaktimetrics.com/open/campaigns/edit",
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