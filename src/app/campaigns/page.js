import CampaignsModule from "../../modules/campaigns/page";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import MainLayout from "@/layouts/MainLayout";
import getRedisClient from "@/lib/redis";
import Networks from "@/services/campaigns/networks"

export default async function CampaignsPage() {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const stringuserData = await client.get(`userData_${email}`);
    const getTheAuthInfo = JSON.parse((await client.get(`auth_${email}`)) ?? "{}");
    const userPermissionsInfo = JSON.parse((await client.get(`permissions_${email}`)) ?? "{}");
    const userData = JSON.parse(stringuserData ?? "{}");
    const token = await client.get(`auth_token_${email}`);
    const stringuserDetails = await client.get(`userdetails_${email}`);
    const userdetails = JSON.parse(stringuserDetails);
    const networksWithStatus = await Networks(token);

    return (
        <MainLayout>
            <CampaignsModule
                email={email}
                userData={userData}
                userPermissions={userPermissionsInfo}
                auth={getTheAuthInfo}
                theme="light"
                userdetails={userdetails}
                networksWithStatus={networksWithStatus}
            />
            {/* <div>Campaigns</div> */}
        </MainLayout>
    );
}