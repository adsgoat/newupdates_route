import axios from "axios";

export default async function CountryReports(token, start, end, time) {
    // console.log(token);
    const apiCall = await axios.get(`http://test.app.vyaktimetrics.com/reports/data/predicto/countryreports?dateStart=${start}&dateEnd=${end}&timezone=${time}`,
        { headers: { Authorization: token } });
    const res = apiCall.data;
    return res;
}