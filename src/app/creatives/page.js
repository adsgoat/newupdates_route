import MainLayout from "@/layouts/MainLayout";
import CreativesPage from "../../modules/creatives/page.js"
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
export default async function CreativesPageLayout() {

    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    // const token = (await cookies()).get("auth_token")?.value;
    const stringuserData = await client.get(`userData_${email}`);
    const username = await client.get(`username_${email}`);
    const getTheAuthInfo = JSON.parse(await client.get(`auth_${email}`));
    const userPermissionsInfo = JSON.parse(await client.get(`permissions_${email}`));
    const userData = JSON.parse(stringuserData);

    return (
        <MainLayout>
            <CreativesPage email={email} userData={userData} userPermissions={userPermissionsInfo} auth={getTheAuthInfo} username={username}/>
        </MainLayout>
    );
}