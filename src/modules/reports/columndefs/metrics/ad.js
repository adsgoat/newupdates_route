"use client"
import axios from "axios"
import moment from 'moment-timezone';
import React, { useState, useEffect, } from "react";
import { Tooltip, Modal, Input, Spin, message } from "antd"
import { WarningOutlined, DollarOutlined, PlusOutlined, HistoryOutlined } from "@ant-design/icons"
import { cpcAggFunc, cplAggFunc, filterationAggFunc, cpcLcAggFunc, rpcAggFunc, ctrAggFunc, fmarginAggFunc, ncplAggFunc, marginAggFunc, roiAggFunc, cpmAggFunc } from "../functions/valueGetter";
import { liveSpender, newSpender, getCpm, getFilteration, getCpc, getCpl, getRpc, getCtr, getFmargin, getNcpl, getMargin, getROI, getCpcLc } from "../functions/aggFunc";
import { currencyFormatter } from "../functions/valueFormatter";
const menuIconVisibility = {
    suppressMenu: true, menuTabs: [], headerClass: 'hide-menu', sortable: true,
}
export const columnDefsObjectForAd = ({ theme, userdetails, Camapignlevelstatus, setCamapignlevelstatus, setCampaignComments, commentsMap, campaignMap, allProfitLossArray, setHistoryOpen, setSelectedCampaignIdForHistory, setSelectedAccountForHistory, apiClient, taxDetails }) => ({
    accountNumber: {
        headerName: 'Account', field: 'accountNumber', showWhenGrouped: true, width: 160, filter: "agTextColumnFilter",
        valueGetter: (params) => {
            if (params.data) return params.data.accountNumber;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.accountNumber || null;
        }, ...menuIconVisibility,
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
        headerName: 'CampaignName', field: 'campaignname', resizable: true, sortable: true,
        valueGetter: (params) => {
            if (params.data) return params.data.campaignname;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.campaignname || null;
        },
    },
    keyword: {
        headerName: 'Keyword', field: 'keyword', resizable: true, sortable: true, filter: "agTextColumnFilter",
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
        headerName: 'Budget', field: 'actions', width: 80, sortable: false, filter: false, enableSorting: false, enableFilter: false,
        cellRenderer: (params) => {
            return (
                <div>
                    <div>
                        <span>{params.value || "..."}</span>
                    </div>
                </div>
            );
        }
        , ...menuIconVisibility,
        hide: true
    },
    adsetname: {
        headerName: 'AdsetName',
        field: 'adsetname',
        spanRows: true,
        width: 400,
        filter: 'agTextColumnFilter',
        filterParams: {
            comparator: (a, b) => a.localeCompare(b),
            suppressAndOrCondition: true,
        }, ...menuIconVisibility,
        valueGetter: (params) => {
            if (params.data) return params.data.adsetname;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.adsetname || null;
        },

    },
    adname: {
        headerName: 'AdID',
        field: 'adname',
        resizable: true,
        sortable: true,
        minWidth: 180,
        spanRows: true,
        filter: "agTextColumnFilter",
        valueGetter: (params) => {
            if (params.data) return params.data.adid;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.adid || null;
        },
    },
    adid: {
        headerName: 'AdID',
        field: 'adid',
        filterParams: {
            comparator: (a, b) => a.localeCompare(b),
            suppressAndOrCondition: true,
        },
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        pinned: 'left',
    },
    category: {
        headerName: 'Category',
        field: 'category',
        width: 100,
        filter: "agTextColumnFilter",
        valueFormatter: (params) => {
            if (!params.value) return '';
            return params.value.charAt(0).toUpperCase() + params.value.slice(1).toLowerCase();
        },
        valueGetter: (params) => {
            const capitalize = (val) => val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;
            if (params.node.group) {
                const firstChild = params.node.allLeafChildren?.[0];
                const account = firstChild?.data?.accountNumber;
                const campaignName = firstChild?.data?.campaignid;
                const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                return capitalize(campaign?.category);
            }
            return capitalize(params.data?.category);
        },
        // ✅ Filter uses same logic as valueGetter
        filterValueGetter: (params) => {
            const capitalize = (val) => val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;
            if (params.node.group) {
                const firstChild = params.node.allLeafChildren?.[0];
                const account = firstChild?.data?.accountNumber;
                const campaignName = firstChild?.data?.campaignid;
                const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                return capitalize(campaign?.category);
            }
            // ✅ Include leaf rows in filtering
            return capitalize(params.data?.category);
        },
        // ✅ Dynamic filter list (from both grouped + leaf rows)
        filterParams: {
            values: (params) => {
                const uniqueCategories = new Set();
                params.api.forEachNode((node) => {
                    const capitalize = (val) => val ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : null;
                    if (node.group) {
                        const firstChild = node.allLeafChildren?.[0];
                        const account = firstChild?.data?.accountNumber;
                        const campaignName = firstChild?.data?.campaignid;
                        const campaign = commentsMap.get(`${campaignName}_${account}_campaign`);
                        const category = capitalize(campaign?.category);
                        if (category) uniqueCategories.add(category);
                    } else {
                        const category = capitalize(node.data?.category);
                        if (category) uniqueCategories.add(category);
                    }
                });
                // params.success(Array.from(uniqueCategories));
                params.success && params.success(Array.from(uniqueCategories));
            },
        },
        comparator: (valueA, valueB, nodeA, nodeB) => {
            const isGroupA = nodeA?.group;
            const isGroupB = nodeB?.group;
            if (isGroupA && isGroupB) {
                return valueA?.localeCompare?.(valueB) ?? 0;
            }
            // sort normally for leaf nodes
            return valueA?.localeCompare?.(valueB) ?? 0;
        },
        cellClassRules: { 'hide-leaf-cell': (params) => !params.node.group && !params.value },
        cellRenderer: (props) => {
            if (props.node.rowPinned || props.node.footer) return null;
            const [editing, setEditing] = React.useState(false);
            const [value, setValue] = React.useState(props.value || "");
            const [open, setOpen] = React.useState(false);
            const [category, setCategory] = React.useState("");
            const [categoryLoading, setCategotyLaoding] = React.useState(false);
            const getRow = () => props.node.group ? props.node.allLeafChildren?.[0]?.data : props.node.data;
            const openModal = () => {
                const row = getRow();
                if (!row) return;
                setCategory(row.category || "");
                setOpen(true);
            };
            const saveFromModal = async () => {
                const row = getRow();
                if (!row) return;
                await saveApi(row, category);
                setOpen(false);
            };
            // const saveInline = async () => {
            //     const row = getRow();
            //     if (!row) return;
            //     await saveApi(row, value);
            //     setEditing(false);
            // };
            const saveInline = async () => {
                const row = getRow();
                if (!row || categoryLoading) return;

                try {
                    setCategotyLaoding(true);

                    await saveApi(row, value);

                    setEditing(false);
                } catch (err) {
                    console.error(err);
                } finally {
                    setCategotyLaoding(false);
                }
            };
            const saveApi = async (row, catValue) => {
                setCategotyLaoding(true);
                try {
                    const payloadForActivity = {
                        editType: "Categoty",
                        campaignid: row.campaignid,
                        Account: row.accountNumber,
                        campaignname: row.campaignname,
                        updatedBy: userdetails?.userName || "Unknown",
                        updatedUserEmail: userdetails.email,
                        updateType: row.category ? "Campain category updated" : "Campain category created",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                        updateDetail: row.category ? `From ${row.category || "N/A"} to ${catValue}` : `Category added as ${catValue}`,
                    }
                    const payload = {
                        accountNumber: row.accountNumber,
                        campaignid: row.campaignid,
                        level: "campaign",
                        category: catValue,
                        activity: payloadForActivity,
                    };
                    await axios.post("/api/reports/category/single", payload);
                    setCampaignComments((prev) => {
                        const arr = [...prev];
                        const idx = arr.findIndex(i =>
                            String(i.campaignid) === String(payload.campaignid) && String(i.Account) === String(payload.accountNumber) && i.level === "campaign"
                        );
                        if (idx >= 0) arr[idx].category = catValue;
                        else
                            arr.push({
                                campaignid: payload.campaignid, Account: payload.accountNumber, level: "campaign", category: catValue,
                            });
                        return arr;
                    });
                    commentsMap.set(`${payload.campaignid}_${payload.accountNumber}_campaign`, { category: catValue });
                    message.success("Category updated");
                }
                catch (error) {
                    console.error(error.message)
                }
                finally {
                    setCategotyLaoding(false)
                }

            };
            if (props.value && !editing) {
                return (
                    <Tooltip title={props.value}
                        styles={{
                            body: {
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                            }
                            // fontWeight: 500,
                        }}>
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditing(true);
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            {props.value}
                        </span>
                    </Tooltip>

                );
            }
            if (props.value && editing) {
                return (
                    <Spin spinning={categoryLoading}>
                        <Input autoFocus size="small" value={value} onChange={(e) => setValue(e.target.value)} onPressEnter={saveInline} onBlur={saveInline} />
                    </Spin>
                );
            }

            return (
                <>
                    <PlusOutlined style={{ cursor: "pointer" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal();
                        }}
                    />
                    <Modal open={open} title="Edit Category" onOk={saveFromModal} onCancel={() => setOpen(false)}>
                        <Spin spinning={categoryLoading}>
                            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
                        </Spin>
                    </Modal>
                </>
            );
        }, ...menuIconVisibility,
    },
    from: {
        headerName: 'Start', field: 'from', width: 110, filter: "agDateColumnFilter",
        filterParams: {
            comparator: (filterLocalDateAtMidnight, cellValue) => {
                if (!cellValue) return -1;
                // cellValue is already a Date object from valueGetter
                const cellDate = new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());
                if (cellDate < filterLocalDateAtMidnight) return -1;
                if (cellDate > filterLocalDateAtMidnight) return 1;
                return 0;
            },
        },
        valueGetter: (params) => {
            let dateStr = null;
            if (params.node.group) {
                const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
                const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
                const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                dateStr = campaign?.start || null;
            }
            else { dateStr = params.data?.from || null; }

            // 🔥 Convert YYYY-MM-DD → real Date object
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: (params) => {
            const d = params.value;
            return d ? moment(d).format("DD-MM-YYYY") : '';
        },
        cellClassRules: { 'hide-leaf-cell': (params) => !params.node.group, }, ...menuIconVisibility,
    },
    to: {
        headerName: 'End', field: 'to', width: 110, filter: "agDateColumnFilter",
        filterParams: {
            comparator: (filterLocalDateAtMidnight, cellValue) => {
                if (!cellValue) return -1;
                // cellValue already Date from valueGetter
                const cellDate = new Date(cellValue.getFullYear(), cellValue.getMonth(), cellValue.getDate());
                if (cellDate < filterLocalDateAtMidnight) return -1;
                if (cellDate > filterLocalDateAtMidnight) return 1;
                return 0;
            },
        },
        valueGetter: (params) => {
            let dateStr = null;
            if (params.node.group) {
                const campaignName = params.node?.childrenAfterGroup?.[0]?.data?.campaignname || "";
                const campaignId = params.node?.childrenAfterGroup?.[0]?.data?.campaignid || params.node?.key || "";
                const campaign = campaignMap.get(`${campaignName}_${campaignId}`);
                dateStr = campaign?.end || null;
            }
            else { dateStr = params.data?.to || null; }
            // 🔥 Convert YYYY-MM-DD → real Date object
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: (params) => {
            const d = params.value;
            return d ? moment(d).format("DD-MM-YYYY") : '';
        },
        cellClassRules: { 'hide-leaf-cell': (params) => !params.node.group, }, ...menuIconVisibility,
    },
    profitloss: {
        headerName: 'P/L', field: 'profitloss',
        valueGetter: (params) => {
            if (params.node.group) {
                const campaignName = params.node.groupData?.campaignname ? params.node.groupData?.campaignname : params.node.key;
                const campaignData = allProfitLossArray?.items?.filter(obj => obj.campaign_name === campaignName);
                const revenue = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.estimated_revenue) || 0), 0);
                const spend = campaignData?.reduce((acc, obj) => acc + (parseFloat(obj?.spend) || 0), 0);
                return (revenue - spend) ? (revenue - spend).toFixed(2) : "" || "";
            }
            return '';
        },
        minWidth: 110, filter: "agNumberColumnFilter", cellClassRules: { 'hide-leaf-cell': (params) => !params.node.group, },
        cellStyle: { fontWeight: 'bold' }, ...menuIconVisibility, // Add a custom class
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
        valueGetter: (params) => {
            if (params.data) return params.data.adsetid;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.adsetid || null;
        },
    },
    campaignid: {
        headerName: 'CampaignId',
        field: 'campaignid',
        filter: "agTextColumnFilter",
        ...menuIconVisibility,
        spanRows: true,
        width: 175,
        valueGetter: (params) => {
            if (params.data) return params.data.campaignid;
            const firstChild = params.node?.childrenAfterGroup?.[0];
            return firstChild?.data?.campaignid || null;
        },
    },
    timezone: {
        headerName: 'TimeZone',
        field: 'timezone',
        filter: "agTextColumnFilter",
        width: 110,
        ...menuIconVisibility,
    },
    history: {
        headerName: 'Activity',
        field: 'history',
        width: 75,
        hide: true,
        sortable: false,
        filter: false,
        enableSorting: false,
        enableFilter: false,
        suppressMenu: true,
        cellRenderer: (params) => {
            return (
                <div>
                    <HistoryOutlined />
                </div>
            );
        }, ...menuIconVisibility,
    },
});