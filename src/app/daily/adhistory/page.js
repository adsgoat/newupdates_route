
import MainLayout from "@/layouts/MainLayout";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
import AdTable from "@/modules/daily/adhistory/page"
import { App } from "antd";
export default async function DailyAdHistoryPageLayout({ searchParams }) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const stringuserDetails = await client.get(`userdetails_${email}`);
    const userdetails = JSON.parse(stringuserDetails);
    const params = await searchParams;
    const account = params.account;
    const ad_id = params.id;
    const timezone = params.time;
    const collection = params.collection;
    // console.log(account, campaign_id, timezone, collection, "Page params");
    return (
        <MainLayout>
            <App>
                <AdTable userdetails={userdetails} account={account} ad_id={ad_id} timezone={timezone} collection={collection} theme="light" />
            </App>
        </MainLayout>
    );
}