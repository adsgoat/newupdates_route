import ReportsPage from "../../modules/reports/page"
import MainLayout from "@/layouts/MainLayout";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
import { App } from "antd";
export default async function ReportsPageLayout() {
  const client = await getRedisClient();
  const email = await getSessionEmailByAuth();
  // const token = (await cookies()).get("auth_token")?.value;
  const stringuserData = await client.get(`userData_${email}`);
  const reportsCache = await client.get(`report_cache_${email}`)
  const userData = JSON.parse(stringuserData);
  // const userData = {
  //   "FB_Mnet": [
  //     { "accountNumber": "1211267696902826", "accountName": "Mnet UTC 01", "timeZone": "UTC", "status": "Active" },
  //     { "accountNumber": "442792938541008", "status": "Active", "accountName": "SYS_ZOLO_UTC", "timeZone": "UTC" },
  //     { "accountNumber": "1665444237296997", "status": "Active", "accountName": "Maximizer 01 - UTC", "timeZone": "UTC" },
  //     { "accountNumber": "1785311825335018", "status": "Active", "timeZone": "UTC", "accountName": "Mnet 11 - UTC" },
  //     { "accountNumber": "1002978538248522", "status": "Active", "timeZone": "UTC", "accountName": "Mnet 13 - UTC" },
  //     { "accountNumber": "1398751290914273", "status": "Active", "accountName": "Mnet UTC 02", "timeZone": "UTC" },
  //     { "accountNumber": "940361467242266", "status": "Active", "accountName": "Maximizer - UTC 2", "timeZone": "UTC" },
  //     { "accountNumber": "3564501213830980", "status": "Active", "accountName": "DEV EDT NEW", "timeZone": "EDT" },
  //     { "accountNumber": "1362079959454551", "status": "Active", "accountName": "#5193 - RAWL-EDT-YM-01 10 - PP - RHKA", "timeZone": "EDT" },
  //     { "accountNumber": "258608967163686", "status": "Active", "accountName": "Lookup trends PDT", "timeZone": "PDT" },
  //     { "accountNumber": "1908001566543117", "status": "Active", "accountName": "#8539 - RAWL-EDT-YM-04 11 - PP - RHKA", "timeZone": "EDT" },
  //     { "accountNumber": "1312229417743147", "status": "Active", "accountName": "#9562 - RAWL-EDT-YM-03 13 - PP - RHKA", "timeZone": "EDT" },
  //     { "accountNumber": "1548502733440117", "status": "Active", "accountName": "#1065 - RAWL-EDT-YM-05 15 - PP - RHKA", "timeZone": "EDT" },
  //     { "accountNumber": "5846299178799482", "status": "InActive", "accountName": "search 2 pst", "timeZone": "PDT" }
  //   ]
  // }
  return (
    <MainLayout>
      <App>
        <ReportsPage userData={userData} cache={JSON.parse(reportsCache)} />
      </App>
    </MainLayout>
  );
}