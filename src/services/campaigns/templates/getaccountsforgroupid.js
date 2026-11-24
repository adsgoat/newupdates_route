import axios from "axios";

export default async function GroupIdData(token, groupId) {
    const apiCall = await axios.get(`https://fblaunching.vyaktimetrics.com/open/templates/group/${groupId}`,
        { headers: { Authorization: token } }
    );
    const res = apiCall.data;
    return res;
}