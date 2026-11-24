import axios from "axios";

export default async function DetailsForCloneCampaignAndCampaignData(token, accountNumber, id) {
    const apiCall = await axios.get(`https://fblaunching.vyaktimetrics.com/open/campaignformdata/clone?account=${accountNumber}&id=${id}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}