import { cookies } from "next/headers";
import DashboardPage from "../../modules/dashboard/page"
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import MainLayout from "@/layouts/MainLayout";
import getRedisClient from "@/lib/redis";
export default async function DashboardPageLayout() {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    // const token = (await cookies()).get("auth_token")?.value;
    const stringuserData = await client.get(`userData_${email}`);
    const getTheAuthInfo = JSON.parse(await client.get(`auth_${email}`));
    const userPermissionsInfo = JSON.parse(await client.get(`permissions_${email}`));
    const userData = JSON.parse(stringuserData);
    const userPermissions = {
        "permissions": {
            "dashboard": {
                "allowed": true,
                "project_report": true,
                "ad_accounts": ["profit", "loss", "top_5_spend", "top_5_revenue", "top_5_profit"],
                "top_campaigns": ["spend", "revenue", "profit", "all_profit", "all_loss"],
                "domain_agency": ["domain"]
            },
            "reports": {
                "allowed": false
            }
        }
    }
    // console.log(email);
    // console.log(userData, "userData");
    return (
        <MainLayout>
            <DashboardPage email={email} userData={userData} userPermissions={userPermissionsInfo} auth={getTheAuthInfo} />
        </MainLayout>
    );
}