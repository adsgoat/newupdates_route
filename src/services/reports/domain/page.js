import axios from "axios";

export default async function DomainReports(token, start, end, time, network, accounts) {
    // console.log(token);
    const apiCall = await axios.get(`http://test.app.vyaktimetrics.com/reports/data/domainandagency?dateStart=${start}&dateEnd=${end}&accountNumber=${accounts}&timezone=${time}&network=${network}`,
        { headers: { Authorization: token } });
    const res = apiCall.data;
    return res;
}