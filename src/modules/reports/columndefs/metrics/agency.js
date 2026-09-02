"use client"
import { cplAggFunc, rpcAggFunc, marginAggFunc, } from "../functions/valueGetter";
import { liveSpender, getCpl, getRpc, getMargin, } from "../functions/aggFunc";
import { currencyFormatter } from "../functions/valueFormatter";
const menuIconVisibility = {
    suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', sortable: true,
}
export const BMNameColumnDefs = ({ updatedTime, taxDetails }) => [
    {
        field: 'BMName',
        headerName: 'BMName',
        minWidth: 150,
        resizable: true,
        sortable: true,
        rowGroup: true,
        enableRowGroup: true,
        flex: 9,
        hide: true,
        ...menuIconVisibility

    },
    {
        field: 'accountNumber',
        headerName: 'Account',
        minWidth: 150,
        sortable: true,
        flex: 9,
        ...menuIconVisibility
    },
    {
        field: 'AgencyName',
        headerName: 'AgencyName',
        minWidth: 150,
        sortable: true,
        flex: 8,
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
        sortable: true,
        filter: "agNumberColumnFilter",
        minWidth: 100,
        flex: 4,
        aggFunc: liveSpender,
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu' // Add a custom class
    },
    {
        field: "revenue",
        headerName: "Revenue",
        resizable: true,
        sortable: true,
        filter: "agNumberColumnFilter",
        minWidth: 110,
        flex: 4,
        aggFunc: liveSpender,
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu' // Add a custom class
    },
    {
        field: 'profit',
        resizable: true,
        sortable: true,
        minWidth: 100,
        flex: 4,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        aggFunc: liveSpender,
        filter: "agNumberColumnFilter",
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
        minWidth: 105,
        flex: 4,
        valueFormatter: (params) => `${params.value}%`,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: getRpc,
        aggFunc: rpcAggFunc,
        // valueFormatter: rpcCplFormatter,
        minWidth: 90,
        flex: 3,
        filter: "agNumberColumnFilter",
        cellStyle: { fontWeight: 'bold' },
        ...menuIconVisibility
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        aggFunc: cplAggFunc,
        valueGetter: getCpl,
        // valueFormatter: rpcCplFormatter,
        minWidth: 90,
        flex: 3,
        filter: "agNumberColumnFilter",
        headerTooltip: "CPL = Spend / FBLeads",
        ...menuIconVisibility
    },
    {
        field: 'fbleads',
        headerName: 'Leads',
        aggFunc: liveSpender,
        hide: true,
        // minWidth: 150,
        // sortable: true,
        // flex: 9,
        ...menuIconVisibility
    },
]