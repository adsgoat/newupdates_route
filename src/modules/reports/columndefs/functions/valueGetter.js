const getGroupTotals = (rowNode) => {
    let totals = {
        spend: 0,
        revenue: 0,
        profit: 0,
        conversions: 0,
        fbleads: 0,
        fbclicks: 0,
        fblinkclicks: 0,
        impressions: 0,
    };

    rowNode.allLeafChildren.forEach((child) => {
        const data = child.data || {};

        totals.spend += Number(data.spend || 0);
        totals.revenue += Number(data.revenue || 0);
        totals.profit += Number(data.profit || 0);
        totals.conversions += Number(data.conversions || 0);
        totals.fbleads += Number(data.fbleads || 0);
        totals.fbclicks += Number(data.fbclicks || 0);
        totals.fblinkclicks += Number(data.fblinkclicks || 0);
        totals.impressions += Number(data.impressions || 0);
    });

    return totals;
};
const cpcAggFunc = (params) => {
    const { spend, fbclicks } = getGroupTotals(params.rowNode);

    if (!fbclicks) return 0;

    const cpc = spend / fbclicks;

    return isFinite(cpc) ? Number(cpc.toFixed(2)) : 0;
};
const cplAggFunc = (params) => {
    const { spend, fbleads } = getGroupTotals(params.rowNode);

    if (!fbleads) return 0;

    return Number((spend / fbleads).toFixed(2));
};
const filterationAggFunc = (params) => {
    const { fbleads, conversions } = getGroupTotals(params.rowNode);

    if (!fbleads) return 0;

    const filteration = ((fbleads - conversions) / fbleads) * 100;

    return isFinite(filteration)
        ? Number(filteration.toFixed(2))
        : 0;
};
const cpcLcAggFunc = (params) => {
    const { spend, fblinkclicks } = getGroupTotals(params.rowNode);

    if (!fblinkclicks) return 0;

    const cpcLc = spend / fblinkclicks;

    return isFinite(cpcLc) ? Number(cpcLc.toFixed(2)) : 0;
};
const rpcAggFunc = (params) => {
    const { revenue, conversions } = getGroupTotals(params.rowNode);

    if (!conversions) return 0;

    return Number((revenue / conversions).toFixed(2));
};
const ctrAggFunc = (params) => {
    const { impressions, fbclicks } = getGroupTotals(params.rowNode);

    if (!impressions) return 0;

    const ctr = (fbclicks / impressions) * 100;

    return isFinite(ctr) ? Number(ctr.toFixed(2)) : 0;
};
const fmarginAggFunc = (params) => {
    const { profit, fbleads } = getGroupTotals(params.rowNode);

    const rpc = rpcAggFunc(params);

    const dev = rpc * fbleads;

    if (!dev) return 0;

    const fmargin = (profit / dev) * 100;

    return isFinite(fmargin) ? Number(fmargin.toFixed(2)) : 0;
};
const ncplAggFunc = (params) => {
    const { spend, conversions } = getGroupTotals(params.rowNode);

    if (!conversions) return 0;

    return Number((spend / conversions).toFixed(2));
};
const marginAggFunc = (params) => {
    const { revenue, spend } = getGroupTotals(params.rowNode);

    if (!revenue) return 0;

    const margin = ((revenue - spend) / revenue) * 100;

    return isFinite(margin) ? Number(margin.toFixed(2)) : 0;
};
const roiAggFunc = (params) => {
    const { revenue, spend } = getGroupTotals(params.rowNode);

    if (!spend) return 0;

    const roi = ((revenue - spend) / spend) * 100;

    return isFinite(roi) ? Number(roi.toFixed(2)) : 0;
};
const cpmAggFunc = (params) => {
    const { spend, impressions } = getGroupTotals(params.rowNode);

    if (!impressions) return 0;

    const cpm = (spend / impressions) * 1000;

    return isFinite(cpm)
        ? Number(cpm.toFixed(2))
        : 0;
};
export { cpcAggFunc, cplAggFunc, filterationAggFunc, cpcLcAggFunc, rpcAggFunc, ctrAggFunc, fmarginAggFunc, ncplAggFunc, marginAggFunc, roiAggFunc, cpmAggFunc }