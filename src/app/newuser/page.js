import MainLayout from "@/layouts/MainLayout";
import NewuserPage from "../../modules/newuser/page.js"
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
export default async function CreativesPageLayout() {

    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const stringuserData = await client.get(`userData_${email}`);
    const username = await client.get(`username_${email}`);
    const userdetails = await client.get(`userdetails_${email}`)
    const getTheAuthInfo = JSON.parse(await client.get(`auth_${email}`));
    const userPermissionsInfo = JSON.parse(await client.get(`permissions_${email}`));
    const userData = JSON.parse(stringuserData);
    const themeRaw = await client.get(`theme_${email}`);
    const theme = themeRaw === "dark" ? "dark" : "light";
    console.log("User details in NewuserPageLayout:", userData);

    return (
        <MainLayout>
            <NewuserPage email={email} userData={userData} userPermissions={userPermissionsInfo} auth={getTheAuthInfo} username={username} userdetails={userdetails} theme={theme} />
        </MainLayout>
    );
}