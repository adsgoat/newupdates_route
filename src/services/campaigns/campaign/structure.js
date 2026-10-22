import axios from "axios";

export default async function DetailsForCreateCampaign(token, accountNumber) {
    const apiCall = await axios.get(`${process.env.CAMPAIGN_LAUNCHER}/open/campaignformdata/${accountNumber}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}