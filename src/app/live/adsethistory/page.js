
import MainLayout from "@/layouts/MainLayout";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
import AdsetTable from "@/modules/live/adsethistory/page"
import { App } from "antd";
export default async function LiveAdsetHistoryPageLayout({ searchParams }) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const stringuserDetails = await client.get(`userdetails_${email}`);
    const userdetails = JSON.parse(stringuserDetails);
    const params = await searchParams;
    const account = params.account;
    const adset_id = params.id;
    const timezone = params.time;
    const report = params.report;
    const collection = params.collection;
    return (
        <MainLayout>
            <App>
                <AdsetTable userdetails={userdetails} account={account} adset_id={adset_id} timezone={timezone} collection={collection} reportType={report} theme="light" />
            </App>
        </MainLayout>
    );
}