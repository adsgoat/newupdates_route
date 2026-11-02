import axios from "axios";

export default async function DetailsForCreateCampaign(accountNumber) {
    const apiCall = await axios.get(`https://fblaunching.vyaktimetrics.com/open/campaignformdata/${accountNumber}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}