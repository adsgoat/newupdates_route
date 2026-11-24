import axios from "axios";

// export default async function DeleteCampaign(token, body) {
//     const apiCall = await axios.delete(`https://fblaunching.vyaktimetrics.com/open/templates`,
//         body,
//         { headers: { Authorization: token } }
//     );
//     const res = apiCall.data;
//     return res;
// }
export default async function DeleteCampaign(token, body) {
    const apiCall = await axios.delete("https://fblaunching.vyaktimetrics.com/open/templates", {
        headers: { Authorization: token },
        data: body,                       // the body goes inside config.data
    });
    return apiCall.data;
}