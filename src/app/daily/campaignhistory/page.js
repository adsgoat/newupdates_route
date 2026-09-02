
import MainLayout from "@/layouts/MainLayout";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
import CampaignAndAccount from "@/modules/daily/campaignhistory/page"
import { App } from "antd";
export default async function DailyCampaginHistoryPageLayout({ searchParams }) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const stringuserDetails = await client.get(`userdetails_${email}`);
    const userdetails = JSON.parse(stringuserDetails);
    const params = await searchParams;
    const account = params.account;
    const campaign_id = params.id;
    const timezone = params.time;
    const collection = params.collection;
    // console.log(account, campaign_id, timezone, collection, "Page params");
    return (
        <MainLayout>
            <App>
                <CampaignAndAccount userdetails={userdetails} account={account} campaign_id={campaign_id} timezone={timezone} collection={collection} theme="light" />
            </App>
        </MainLayout>
    );
}