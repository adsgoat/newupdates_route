export default async function StoreReportsValues(reqData, client, email) {
    await client.set(`report_cache_${email}`, JSON.stringify(reqData));
    return { message: "report cache stoored successfully" };
}