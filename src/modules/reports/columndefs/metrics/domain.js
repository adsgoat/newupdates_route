"use client"
import { cpcAggFunc, cplAggFunc, filterationAggFunc, cpcLcAggFunc, rpcAggFunc, ctrAggFunc, fmarginAggFunc, ncplAggFunc, marginAggFunc, roiAggFunc, cpmAggFunc } from "../functions/valueGetter";
import { liveSpender, newSpender, getCpm, getFilteration, getCpc, getCpl, getRpc, getCtr, getFmargin, getNcpl, getMargin, getROI, getCpcLc } from "../functions/aggFunc";
import { currencyFormatter } from "../functions/valueFormatter";
const menuIconVisibility = {
    suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', sortable: true,
}
export const DomainColumnDefs = ({ updatedTime, taxDetails }) => [
    {
        field: 'domain',
        headerName: 'Domain',
        minWidth: 400,
        hide: true, // Hide column as it's grouped
        rowGroup: true,
        enableRowGroup: true,
        flex: 8,
        ...menuIconVisibility
    },
    {
        field: 'accountNumber',
        headerName: 'Account',
        minWidth: 200,
        flex: 9,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility
    },
    {
        field: `${updatedTime}Date`,
        headerName: 'Date',
        flex: 6,
        minWidth: 120,
        filter: true,
        ...menuIconVisibility
    },
    {
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
    {
        field: "spend",
        resizable: true,
        minWidth: 100,
        flex: 4,
        aggFunc: liveSpender,
        valueFormatter: currencyFormatter,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility
    },
    {
        field: "conversions",
        resizable: true,
        headerName: "Conversions",
        filter: "agNumberColumnFilter",
        minWidth: 100,
        flex: 4,
        aggFunc: newSpender,
        ...menuIconVisibility
    },
    {
        field: "revenue",
        headerName: "Revenue",
        resizable: true,
        minWidth: 110,
        filter: "agNumberColumnFilter",
        flex: 4,
        aggFunc: liveSpender,
        valueFormatter: currencyFormatter,
        ...menuIconVisibility
    },
    {
        field: 'profit',
        resizable: true,
        minWidth: 100,
        filter: "agNumberColumnFilter",
        flex: 4,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        aggFunc: liveSpender,
        valueFormatter: currencyFormatter,
        ...menuIconVisibility
    },
    {
        field: "margin",
        headerName: 'Margin',
        valueGetter: getMargin,
        aggFunc: marginAggFunc,
        cellClassRules: {
            'font-red': p => p.value < 0
        },
        minWidth: 110,
        flex: 4,
        filter: "agNumberColumnFilter",
        headerTooltip: 'Margin = (Profit / Revenue) * 100',
        ...menuIconVisibility
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: getRpc,
        aggFunc: rpcAggFunc,
        filter: "agNumberColumnFilter",
        minWidth: 100,
        flex: 3,
        ...menuIconVisibility,
        headerTooltip: "RPC = Revenue / Conversions",
        cellStyle: { fontWeight: 'bold' } // Make text bold
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        valueGetter: getCpl,
        aggFunc: cplAggFunc,
        filter: "agNumberColumnFilter",
        minWidth: 100,
        flex: 3,
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "CPL = Spend / FBLeads",
    },
    {
        headerName: 'CPC',
        field: 'cpc',
        valueGetter: getCpc,
        aggFunc: cpcAggFunc,
        width: 80,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility, // Add a custom class
        headerTooltip: "CPC = Spend / FBClicks",

    },
    {
        field: "fbleads",
        headerName: "FB Leads",
        filter: "agNumberColumnFilter",
        resizable: true,
        minWidth: 100,
        flex: 3,
        aggFunc: newSpender,
        ...menuIconVisibility
    },
    {
        field: "fbclicks",
        headerName: "FB Clicks",
        filter: "agNumberColumnFilter",
        resizable: true,
        minWidth: 100,
        flex: 4,
        aggFunc: newSpender,
        ...menuIconVisibility
    },
    {
        headerName: 'IMP',
        field: 'impressions',
        minWidth: 80,
        aggFunc: newSpender,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility,
        headerTooltip: "Impressions",
    },
    {
        field: "filteration",
        headerName: "Filteration",
        resizable: true,
        minWidth: 120,
        filter: "agNumberColumnFilter",
        flex: 4,
        valueGetter: getFilteration,
        aggFunc: filterationAggFunc,
        valueFormatter: params => `${params.value || 0}%`,
        ...menuIconVisibility,
        headerTooltip: "((fbLeads - conversions) / fbLeads) * 100"
    },
    {
        headerName: 'CPM',
        field: 'cpm',
        filter: "agNumberColumnFilter",
        minWidth: 90,
        headerTooltip: '(Spend/Impressions)*1000',
        valueGetter: getCpm, aggFunc: cpmAggFunc,
        hide: false,
        ...menuIconVisibility
    },
    {
        headerName: 'CPC_LC',
        field: 'cpclinkclicks',
        minWidth: 80,
        valueGetter: getCpcLc,
        aggFunc: cpcLcAggFunc,
        filter: 'agNumberColumnFilter',
        hide: false,
        ...menuIconVisibility,
        headerTooltip: "cpclinkclicks = Spend / FBLinkClicks",
    },
    {
        headerName: 'FB_LC',
        field: 'fblinkclicks',
        headerTooltip: 'fblinkclicks',
        minWidth: 110,
        aggFunc: newSpender,
        filter: 'agNumberColumnFilter',
        ...menuIconVisibility
    },
    {
        headerName: 'CTR',
        field: 'ctr',
        valueGetter: getCtr,
        aggFunc: ctrAggFunc,
        minWidth: 100,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        valueFormatter: (params) => `${params.value}%`,
        filter: 'agNumberColumnFilter',
        ...menuIconVisibility,
        headerTooltip: "CTR = (FBClicks / Impressions) * 100",
    },
    {
        headerName: 'NCPL',
        field: 'ncpl',
        minWidth: 90,
        valueGetter: getNcpl,
        aggFunc: ncplAggFunc,
        filter: 'agNumberColumnFilter',
        ...menuIconVisibility,
        headerTooltip: "NCPL = Spend / Conversions"
    },
    {
        headerName: 'FMargin',
        field: 'fmargin',
        valueGetter: getFmargin,
        aggFunc: fmarginAggFunc,
        filter: "agNumberColumnFilter",
        minWidth: 120,
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        valueFormatter: (params) => `${params.value}%`,
        ...menuIconVisibility,
        headerTooltip: "FMargin = (Profit / Spend) * 100",
    },
    {
        headerName: 'ROI',
        field: 'roi',
        valueGetter: getROI,
        aggFunc: roiAggFunc,
        filter: "agNumberColumnFilter",
        comparator: (valueA, valueB) => {
            // Handle sorting based on the computed margin value
            if (valueA == null) return -1;
            if (valueB == null) return 1;
            return valueA - valueB;
        },
        minWidth: 100,
        valueFormatter: (params) => `${params.value}%`,
        ...menuIconVisibility,
        headerTooltip: "ROI = ((Revenue - Spend) / Spend) * 100",
    },
]