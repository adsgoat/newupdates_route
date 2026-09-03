"use client"
import { cplAggFunc, rpcAggFunc, marginAggFunc, } from "../functions/valueGetter";
import { liveSpender, getCpl, getRpc, getMargin, } from "../functions/aggFunc";
import { currencyFormatter } from "../functions/valueFormatter";
const menuIconVisibility = {
    suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', sortable: true,
}
export const CountryColumnDefs = ({ updatedTime }) => [
    {
        field: 'campaignId',
        headerName: 'CampaignID',
        width: 150,
        hide: true, // Hide column as it's grouped
        rowGroup: true,
        enableRowGroup: true,
        flex: 9,
        ...menuIconVisibility
    },
    {
        field: 'country_code',
        headerName: 'Country',
        width: 100,
        flex: 9,
        ...menuIconVisibility
    },
    {
        field: `${updatedTime}Date`,
        headerName: 'Date',
        flex: 6,
        width: 120,
        filter: true,
        ...menuIconVisibility
    },
    {
        field: "revenue",
        headerName: "Revenue",
        resizable: true,
        filter: true,
        width: 110,
        flex: 4,
        aggFunc: liveSpender,
        // valueFormatter: currencyFormatter,
        valueFormatter: ({ value }) =>
            value == null ? "" : `$${Number(value).toFixed(2)}`,
        filter: "agNumberColumnFilter",
        ...menuIconVisibility
    },
    {
        headerName: 'Clicks',
        field: 'conversions',
        headerTooltip: "Clicks",
        width: 85,
        aggFunc: liveSpender,
        filter: 'agNumberColumnFilter',
        ...menuIconVisibility
    },
    {
        headerName: 'Impressions',
        field: 'impressions',
        headerTooltip: "Impressions",
        width: 85,
        aggFunc: liveSpender,
        filter: 'agNumberColumnFilter',
        ...menuIconVisibility
    },
    {
        headerName: 'RPC',
        width: 80,
        field: 'rpc',
        valueGetter: getRpc,
        aggFunc: rpcAggFunc,
        filter: 'agNumberColumnFilter',
        headerTooltip: 'RPC = Revenue / Conversions',
        ...menuIconVisibility,
        cellStyle: { fontWeight: 'bold' }
    },
]