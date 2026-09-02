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
  const stringuserDetails = await client.get(`userdetails_${email}`);
  const userData = JSON.parse(stringuserData);
  const userdetails = JSON.parse(stringuserDetails);
  return (
    <MainLayout>
      <App>
        <ReportsPage userData={userData} cache={JSON.parse(reportsCache)} userdetails={userdetails} />
      </App>
    </MainLayout>
  );
}