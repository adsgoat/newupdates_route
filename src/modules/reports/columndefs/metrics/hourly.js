"use client"
import moment from 'moment-timezone';
import { cpcAggFunc, cplAggFunc, filterationAggFunc, cpcLcAggFunc, rpcAggFunc, ctrAggFunc, fmarginAggFunc, ncplAggFunc, marginAggFunc, roiAggFunc, cpmAggFunc } from "../functions/valueGetter";
import { liveSpender, newSpender, getCpm, getFilteration, getCpc, getCpl, getRpc, getCtr, getFmargin, getNcpl, getMargin, getROI, getCpcLc } from "../functions/aggFunc";
import { currencyFormatter } from "../functions/valueFormatter";
const menuIconVisibility = {
    suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', sortable: true,
}
export const columnDefsHourly = ({taxDetails}) => ({
    accountNumber: {
        headerName: 'Account', field: 'accountNumber', showWhenGrouped: true, width: 160, filter: "agTextColumnFilter",
        ...menuIconVisibility,
    },
    M_tq: {
        headerName: 'M_TQ', field: 'M_tq', aggFunc: 'sum', hide: true, aggFunc: liveSpender,
        valueFormatter: (params) => {
            const val = Number(params.value);
            return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
        }, ...menuIconVisibility,
    },
    D_tq: {
        headerName: 'D_TQ', field: 'D_tq', aggFunc: 'sum', hide: true, aggFunc: liveSpender,
        valueFormatter: (params) => {
            const val = Number(params.value);
            return isNaN(val) ? "0.00" : `${val.toFixed(2)}`;
        }, ...menuIconVisibility,
    },
    campaignname: {
        headerName: 'CampaignID', field: 'campaignname', resizable: true, sortable: true, width: 165, spanRows: true,
        filter: "agTextColumnFilter",
        valueGetter: (params) => {
            if (params.data) return params.data.campaignid;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.campaignid || null;
        },
        hide: true,
    },
    cpm: {
        headerName: 'CPM', field: 'cpm', filter: "agNumberColumnFilter", width: 90, headerTooltip: '(Spend/Impressions)*1000', valueGetter: getCpm, aggFunc: cpmAggFunc, hide: false, ...menuIconVisibility,
    },
    filteration: {
        headerName: "Filteration", field: 'filteration', width: 115, filter: "agNumberColumnFilter",
        valueGetter: getFilteration,
        aggFunc: filterationAggFunc,
        valueFormatter: params => `${params.value || 0}%`,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        }, ...menuIconVisibility
    },
    actions: {
        headerName: 'Budget',
        field: 'actions',
        minWidth: 90,
        sortable: false,
        filter: false,
        enableSorting: false,
        enableFilter: false,
        suppressMenu: true,
        hide: true,
    },
    adsetname: {
        headerName: 'AdsetName',
        field: 'adsetname',
        sortable: true,
        width: 400,
        filter: 'agTextColumnFilter',
        filterParams: {
            comparator: (a, b) => a.localeCompare(b),
            suppressAndOrCondition: true,
        },
        suppressMenu: true,
        hide: true,

    },
    adname: { headerName: 'AdName', field: 'adname', hide: true },
    adid: { headerName: 'AdID', field: 'adid', hide: true },
    category: {
        headerName: 'Category',
        field: 'category',
        minWidth: 110,
        // filter: 'agSetColumnFilter',
        filter: "agTextColumnFilter",
        hide: true,
        ...menuIconVisibility
    },
    from: {
        headerName: 'Start',
        field: 'from',
        minWidth: 110,
        filter: "agDateColumnFilter",
        hide: true,
        ...menuIconVisibility
    },
    to: {
        headerName: 'End',
        field: 'to',
        minWidth: 110,
        filter: "agDateColumnFilter",
        hide: true,
        ...menuIconVisibility
    },
    profitloss: {
        headerName: 'P/L',
        field: 'profitloss',
        valueGetter: (params) => {
            if (params.node.group) {
                return  "";
            }
            return '';
        },
        minWidth: 110,
        filter: "agNumberColumnFilter",
        cellClassRules: {
            'hide-leaf-cell': (params) => !params.node.group,
        },
        cellStyle: { fontWeight: 'bold' },
        ...menuIconVisibility
    },
    date: {
        headerName: 'Date', field: 'date', width: 110, filter: "agDateColumnFilter",
        filterParams: {
            comparator: (filterLocalDateAtMidnight, cellValue) => {
                if (!cellValue) return -1;
                // cellValue is already a Date object
                const cellDate = new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());
                if (cellDate < filterLocalDateAtMidnight) return -1;
                if (cellDate > filterLocalDateAtMidnight) return 1;
                return 0;
            },
        },
        // 🔥 Convert raw YYYY-MM-DD → real Date object
        valueGetter: (params) => {
            const dateStr = params.data?.date;
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        // 🔥 Display format only
        valueFormatter: (params) => {
            const d = params.value;
            return d ? moment(d).format("DD-MM-YYYY") : '';
        },
        ...menuIconVisibility,
    },
    'fb-hour': {
        headerName: 'F-H',
        field: 'fb-hour',
        width: 85,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,
        rowGroup: true,
        enableRowGroup: true,
    },
    'mnet-hour': {
        headerName: 'N-H',
        field: 'mnet-hour',
        width: 80,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,
    },
    spend: {
        headerName: 'Spend',
        field: 'spend',
        width: 100,
        aggFunc: liveSpender,
        filter: "agNumberColumnFilter",
        valueFormatter: currencyFormatter,
        ...menuIconVisibility,
        headerTooltip: "Total amount spent",
        // filterValueGetter: (params) => parseFloat(params.data.spend || 0),
        // filterValueGetter: (params) => parseFloat(params.data?.spend ?? 0),
    },
    tax: {
        headerName: "Tax",
        field: "tax",
        width: 105,
        filter: "agNumberColumnFilter",
        valueGetter: (params) => {
            if (params.node?.rowPinned) {
                return Number(params.data?.tax || 0);
            }
            const accountNumber = params.data?.accountNumber;
            if (!accountNumber) return 0;
            const accountTax = taxDetails?.find( item => String(item.accountNumber) === String(accountNumber));
            const taxRate = parseFloat( String(accountTax?.tax || "0").replace("%", "") ) || 0;
            const spend = Number(params.data?.spend) || 0;
            return Number( (spend + (spend * taxRate) / 100).toFixed(2) );
        },
        aggFunc: (params) => {
            if (!params.values?.length) return 0;
            return Number( params.values .reduce( (sum, value) => sum + (Number(value) || 0), 0 ) .toFixed(2) );
        },
        valueFormatter: (params) => { return `$${Number(params.value || 0).toFixed(2)}` },
        ...menuIconVisibility,
    },
    revenue: {
        headerName: 'Revenue',
        field: 'revenue',
        width: 100,
        aggFunc: liveSpender,
        filter: "agNumberColumnFilter",
        valueFormatter: currencyFormatter,
        ...menuIconVisibility,
        // filterValueGetter: (params) => parseFloat(params.data.revenue || 0),

    },
    profit: {
        headerName: 'Profit',
        field: 'profit',
        width: 100,
        aggFunc: liveSpender,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        filter: "agNumberColumnFilter",
        valueFormatter: currencyFormatter,
        ...menuIconVisibility,
        headerTooltip: "Profit = Revenue - Spend",
        // filterValueGetter: (params) => parseFloat(params.data.profit || 0),

    },
    margin: {
        headerName: 'Margin',
        field: 'margin',
        width: 100,
        valueGetter: getMargin,
        aggFunc: marginAggFunc,
        filter: "agNumberColumnFilter",
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        valueFormatter: (params) => `${params.value}%`,
        ...menuIconVisibility,
        headerTooltip: "Margin = (Profit / Revenue) * 100",

    },
    fbleads: {
        headerName: 'FBLeads',
        field: 'fbleads',
        width: 105,
        aggFunc: newSpender,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,
    },
    conversions: {
        headerName: 'Conv',
        field: 'conversions',
        width: 85,
        aggFunc: newSpender,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "Conversions",
    },
    cpc: {
        headerName: 'CPC',
        field: 'cpc',
        valueGetter: getCpc,
        aggFunc: cpcAggFunc,
        width: 80,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "CPC = Spend / FBClicks",

    },
    cpclinkclicks: {
        headerName: 'CPC_LC',
        field: 'cpclinkclicks',
        valueGetter: getCpcLc,
        aggFunc: cpcLcAggFunc,
        width: 92,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
    },
    fbclicks: {
        headerName: 'FBClicks',
        field: 'fbclicks',
        width: 110,
        aggFunc: newSpender,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,
    },
    fblinkclicks: {
        headerName: 'FB_LC',
        field: 'fblinkclicks',
        headerTooltip: 'fblinkclicks',
        width: 110,
        aggFunc: newSpender,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,// Add a custom class
    },
    impressions: {
        headerName: 'IMP',
        field: 'impressions',
        width: 100,
        aggFunc: newSpender,
        filter: "agNumberColumnFilter",
        suppressMenu: true,
        ...menuIconVisibility,
    },
    ctr: {
        headerName: 'CTR',
        field: 'ctr',
        valueGetter: getCtr,
        aggFunc: ctrAggFunc,
        width: 100,
        filter: "agNumberColumnFilter",
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        valueFormatter: (params) => `${params.value}%`,
        ...menuIconVisibility,

    },
    rpc: {
        headerName: 'RPC',
        field: 'rpc',
        width: 80,
        valueGetter: getRpc,
        aggFunc: rpcAggFunc,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,// Add a custom class
        headerTooltip: "RPC = Revenue / Conversions",
        cellStyle: { fontWeight: 'bold' } // Make text bold
    },
    cpl: {
        headerName: 'CPL',
        field: 'cpl',
        width: 80,
        valueGetter: getCpl,
        aggFunc: cplAggFunc,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "CPL = Spend / FBLeads",

    },
    ncpl: {
        headerName: 'NCPL',
        field: 'ncpl',
        width: 90,
        valueGetter: getNcpl,
        aggFunc: ncplAggFunc,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "NCPL = Spend / Conversions",
    },
    fmargin: {
        headerName: 'FMargin',
        field: 'fmargin',
        width: 110,
        valueGetter: getFmargin,
        aggFunc: fmarginAggFunc,
        filter: "agNumberColumnFilter",
        comparator: (valueA, valueB) => {
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        valueFormatter: (params) => `${params.value}%`,
        ...menuIconVisibility,// Add a custom class
        headerTooltip: "FMargin = (Profit / Spend) * 100",
    },
    roi: {
        headerName: 'ROI',
        field: 'roi',
        width: 100,
        valueGetter: getROI,
        aggFunc: roiAggFunc,
        filter: "agNumberColumnFilter",
        comparator: (valueA, valueB) => {
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        valueFormatter: (params) => `${params.value}%`,
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",

    },
    adsetid: {
        headerName: 'AdsetId',
        field: 'adsetid',
        width: 170,
        filter: "agTextColumnFilter",
        ...menuIconVisibility,
        hide: true,
    },
    campaignid: {
        headerName: 'CampaignId',
        field: 'campaignid',
        filter: "agTextColumnFilter",
        ...menuIconVisibility,
        width: 500,
        hide: true,
    },
    timezone: {
        headerName: 'TimeZone',
        field: 'timezone',
        filter: "agTextColumnFilter",
        width: 110,
        ...menuIconVisibility,
        hide: true
    },
    history: {
        headerName: 'Activity',
        field: 'history',
        minWidth: 90,
        sortable: false,
        filter: false,
        enableSorting: false,
        enableFilter: false,
        suppressMenu: true,
        hide: true,
    },
});