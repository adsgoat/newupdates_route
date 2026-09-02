import { liveSpender, newSpender, getCpm, getFilteration, getCpc, getCpl, getRpc, getCtr, getFmargin, getNcpl, getMargin, getROI, getCpcLc } from "../functions/aggFunc";
import { cpcAggFunc, cplAggFunc, filterationAggFunc, cpcLcAggFunc, rpcAggFunc, ctrAggFunc, fmarginAggFunc, ncplAggFunc, marginAggFunc, roiAggFunc, cpmAggFunc } from "../functions/valueGetter"
const menuIconVisibility = {
    suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', sortable: true,
}
import moment from 'moment-timezone';
const columnDefsObjectCampaign = {
    M_tq: {
        headerName: 'M_TQ',
        field: 'M_tq',
        valueFormatter: (params) => {
            const val = Number(params.value);
            return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
        },
        hide: true, ...menuIconVisibility
    },
    D_tq: {
        headerName: 'D_TQ',
        field: 'D_tq',
        valueFormatter: (params) => {
            const val = Number(params.value);
            return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
        },
        hide: true, ...menuIconVisibility
    },
    campaignname: {
        headerName: 'CampaignName', field: 'campaignname',
        hide: true,
        width: 300,
        cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
        autoHeight: true,
        cellRenderer: (params) => {
            if (params.value && params.value.includes("Copied!")) {
                return (
                    <span>
                        {params.value.replace("Copied!", "")}
                        <span style={{ color: "#91C25F", fontWeight: "bold" }}>Copied!</span>
                    </span>
                );
            }
            return params.value;
        }, ...menuIconVisibility
    },
    adsetname: {
        headerName: 'Adset-Name', field: 'adsetname',
        width: 300,
        cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
        autoHeight: true,
        hide: true, ...menuIconVisibility
    },
    adname: {
        headerName: 'Ad-Name', field: 'adname',
        width: 300,
        cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
        autoHeight: true,
        cellRenderer: (params) => {
            if (params.value && params.value.includes("Copied!")) {
                return (
                    <span>
                        {params.value.replace("Copied!", "")}
                        <span style={{ color: "#91C25F", fontWeight: "bold" }}>Copied!</span>
                    </span>
                );
            }
            return params.value;
        },
        hide: true, ...menuIconVisibility
    },
    date: {
        headerName: 'Date', field: 'date', width: 140, sort: 'desc', pinned: "left",
        comparator: (valueA, valueB) => {
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            const dateA = new Date(valueA);
            const dateB = new Date(valueB);
            // Compare valid dates
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA - dateB;
            }
            return valueA.toString().localeCompare(valueB.toString());
        },
        valueFormatter: (params) => {
            if (params.node.group) return '';
            if (params.node.rowPinned) return 'Total';
            return `${params.value} (${moment(params.value).format('ddd')})`;
        }, filter: 'agDateColumnFilter',
        // ...menuIconVisibility
    },
    hour_f: {
        headerName: 'Date', field: 'hour_f', width: 160, sort: 'asc',
        comparator: (valueA, valueB) => {
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return -1;
            if (valueB == null) return 1;

            const dateA = new Date(valueA);
            const dateB = new Date(valueB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA - dateB;
            }
            return valueA.toString().localeCompare(valueB.toString());
        },

        cellStyle: { fontWeight: 'bold' },
        valueFormatter: (params) => {
            // If the row is grouped or pinned, return the original value (or empty for pinned rows)
            if (params.node.group) return '';
            if (params.node.rowPinned) return '';
            return `${params.value} (${moment(params.value).format('ddd')})`;
        },
        hide: true, ...menuIconVisibility
    },
    hour_n: {
        headerName: 'Date', field: 'hour_n', width: 160, sort: 'asc',
        comparator: (valueA, valueB) => {
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            const dateA = new Date(valueA);
            const dateB = new Date(valueB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA - dateB;
            }
            return valueA.toString().localeCompare(valueB.toString());
        },
        cellStyle: { fontWeight: 'bold', },
        valueFormatter: (params) => {
            if (params.node.group) return '';
            if (params.node.rowPinned) return '';
            return `${params.value} (${moment(params.value).format('ddd')})`;
        },
        hide: true, ...menuIconVisibility
    },
    date_f: {
        headerName: 'Date', field: 'date_f', width: 160, sort: 'asc',
        comparator: (valueA, valueB) => {
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            const dateA = new Date(valueA);
            const dateB = new Date(valueB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA - dateB;
            }
            return valueA.toString().localeCompare(valueB.toString());
        },

        cellStyle: { fontWeight: 'bold' },
        valueFormatter: (params) => {
            if (params.node.group) return '';
            if (params.node.rowPinned) return '';
            return `${params.value} (${moment(params.value).format('ddd')})`;
        },
        hide: true, ...menuIconVisibility
    },
    date_n: {
        headerName: 'Date', field: 'date_n', width: 160, sort: 'asc',
        comparator: (valueA, valueB) => {
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            const dateA = new Date(valueA);
            const dateB = new Date(valueB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA - dateB;
            }
            return valueA.toString().localeCompare(valueB.toString());
        },

        cellStyle: { fontWeight: 'bold' },
        valueFormatter: (params) => {
            if (params.node.group) return '';
            if (params.node.rowPinned) return '';
            return `${params.value} (${moment(params.value).format('ddd')})`;
        },
        hide: true, ...menuIconVisibility
    },
    spend: {
        headerName: 'Spend', field: 'spend', width: 105,
        aggFunc: liveSpender,
        valueFormatter: (params) => `$${params.value}`, filter: "agNumberColumnFilter",
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: false, ...menuIconVisibility
    },
    revenue: {
        headerName: 'Revenue', field: 'revenue', width: 105,
        aggFunc: liveSpender,
        valueFormatter: (params) => `$${params.value}`, filter: "agNumberColumnFilter", ...menuIconVisibility
    },
    profit: {
        headerName: 'Profit', field: 'profit', width: 100,
        cellClassRules: { 'font-red': p => p.value < 0, 'font-green': params => params.value > 0, },
        aggFunc: liveSpender, valueFormatter: (params) => `$${params.value}`,
        headerToolTip: 'Profit = Revenue - Spend', filter: "agNumberColumnFilter", ...menuIconVisibility
    },
    margin: {
        headerName: 'Margin', field: 'margin', valueGetter: getMargin, aggFunc: marginAggFunc,
        width: 105,
        valueFormatter: (params) => `${params.value}%`,
        headerToolTip: 'Margin = ((Revenue - Spend) / Revenue) * 100', ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    rpc: {
        headerName: 'RPC', field: 'rpc', valueGetter: getRpc, aggFunc: rpcAggFunc,
        headerToolTip: 'RPC = Revenue / Conversions',
        width: 85, cellStyle: { fontWeight: 'bold' }, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    cpl: {
        headerName: 'CPL', field: 'cpl', valueGetter: getCpl, aggFunc: cplAggFunc,
        headerToolTip: 'CPL = Spend / FBLeads', width: 85, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    ncpl: {
        headerName: 'NCPL', field: 'ncpl', valueGetter: getNcpl, aggFunc: ncplAggFunc,
        headerToolTip: 'NCPL = Spend / Conversions', width: 95, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    fbleads: {
        headerName: 'Leads', field: 'fbleads', width: 100, aggFunc: liveSpender, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    filteration: {
        headerName: "Filteration", field: 'filteration', width: 115, aggFunc: filterationAggFunc, valueGetter: getFilteration,
        valueFormatter: params => params.value ? `${params.value}%` : '0%', ...menuIconVisibility
    },
    conversions: {
        headerName: 'Conv', field: 'conversions', width: 90, aggFunc: liveSpender,
        headerToolTip: 'Conversions', ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    fmargin: {
        headerName: 'FMargin', field: 'fmargin', valueGetter: getFmargin, aggFunc: fmarginAggFunc,
        valueFormatter: (params) => `${params.value}%`,
        headerToolTip: 'FMargin = (Profit / Revenue) * 100', width: 110, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    roi: {
        headerName: 'ROI', field: 'roi', valueGetter: getROI, aggFunc: roiAggFunc,
        valueFormatter: (params) => `${params.value}%`,
        headerToolTip: 'ROI = ((Revenue - Spend) / Spend) * 100', width: 90, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    cpm: {
        headerName: 'CPM', field: 'cpm', valueGetter: getCpm, aggFunc: cpmAggFunc,
        valueFormatter: (params) => `${params.value}`,
        width: 90, headerToolTip: 'CPM = (spend/impressions) * 1000', ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    cpc: {
        headerName: 'CPC', field: 'cpc', aggFunc: cpcAggFunc, valueGetter: getCpc,
        valueFormatter: params => params.value !== undefined ? Math.round(params.value * 100) / 100 : '',
        width: 90, headerToolTip: 'CPC = Spend / FBClicks', ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    cpclinkclicks: {
        headerName: 'CPC_LC', field: 'cpclinkclicks', valueGetter: getCpcLc, aggFunc: cpcLcAggFunc, width: 80, sortable: true,
        filter: "agNumberColumnFilter", headerTooltip: "CPC = Spend / FBLinkClicks", ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    fbclicks: {
        headerName: 'FBClicks', field: 'fbclicks', width: 110, aggFunc: liveSpender, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    fblinkclicks: {
        headerName: 'FB_LC', field: 'fblinkclicks', width: 110, aggFunc: liveSpender, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    impressions: {
        headerName: 'IMP', field: 'impressions', width: 80, aggFunc: liveSpender, headerToolTip: 'Impressions', ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
    ctr: {
        headerName: 'CTR', field: 'ctr', valueGetter: getCtr, aggFunc: ctrAggFunc,
        headerToolTip: 'CTR = (FBClicks / Impressions) * 100', width: 90, ...menuIconVisibility, filter: "agNumberColumnFilter",
    },
}
export default columnDefsObjectCampaign;