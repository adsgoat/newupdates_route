"use client";
import axios from "axios";
import moment from 'moment-timezone';
import React, { useMemo, useState, useEffect, useRef } from "react";
import { App, Tooltip, Switch, Modal, Input, Button, Row, Col, Space, Typography, Badge, Spin } from "antd";
import { EditOutlined, GlobalOutlined, NumberOutlined, FilterOutlined, DownOutlined, InfoCircleOutlined, DownloadOutlined, PushpinOutlined, PlusOutlined } from "@ant-design/icons"
import GridLoading from "@/components/common/skeletonloading";
import { newtworkCollections, selectTimezone } from "../livereports/networksandtimezones";
import { columnDefsHourly } from "../columndefs/page";
import ReusableAgGrid from "@/components/reports/insights";
import TableConfig from "@/components/reports/tableConfig"
import "@/lib/agGridSetup";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { RxSwitch } from "react-icons/rx";
const { Text } = Typography;

export default function HourlyTable({ theme, userData, updatedRevenuePartner, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, userColumnStructure, Camapignlevelstatus, campaignComments, activeTab, handleColumnMove, getMainMenuItems, customColumns, taxDetails, refreshTabs, userdetails }) {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [dataLoader, setDataLoader] = useState(false);
    const [campaignData, setCampainData] = useState([])
    const memorizedCampaignData = useMemo(() => campaignData, [campaignData])
    const campaignDataRef = useRef([]);
    const gridRef = useRef();
    const fbCron = useRef();
    const revenueCron = useRef();
    const cronStatus = useRef();
    const maxHour = useRef();
    const maxNetworkHour = useRef();
    const lastCampaignFetch = useRef(null);
    const apiClient = axios;
    const [latestHour, setLatestHour] = useState(0);
    const [showAllHours, setShowAllHours] = useState(false);

    const onGridReady = ({ api }) => {
        gridRef.current = { api };
    };
    function getFBHour(data, startDate, endDate) {
        const start = new Date(startDate).toISOString().slice(0, 10);
        const end = new Date(endDate).toISOString().slice(0, 10);

        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);

        const fbData = data.filter(
            item => item.fbCron && item.fbCron !== "Failed" && item.hour
        );
        if (!fbData.length) return "00";
        if (start === end && start === today) {
            const currentHour = new Date().getHours();

            const todayHours = fbData
                .map(i => Number(i.hour))
                .filter(h => h <= currentHour);

            return todayHours.length
                ? String(Math.max(...todayHours)).padStart(2, "0")
                : "00";
        }
        if (start === end && start === yesterday) {
            return findMaxHour(fbData);
        }
        return findMaxHour(fbData);
    }

    function findMaxHour(data) {
        // Use reduce to find the maximum value of the 'hour' key
        const maxHour = data.reduce((max, obj) => {
            // Convert the 'hour' value to a number before comparison
            const hourAsNumber = parseInt(obj.hour, 10);
            return hourAsNumber > max ? hourAsNumber : max;
        }, -Infinity);  // Initialize with -Infinity to ensure proper comparison

        return String(maxHour).padStart(2, '0');  // Return the max hour as a string with leading zero
    }

    function getMaxHour(data) {
        const hours = data
            .filter(item => item.updatedHour) // Filter out objects without updatedHour
            .map(item => parseInt(item.updatedHour.split(":")[0], 10));
        return hours.length > 0 ? Math.max(...hours) : null;
    }
    const onBtExport = async () => {
        const Details = {
            network: updatedRevenuePartner,
            account: updatedAccountsValue,
            dateRange: `From ${updatedStartDate} to ${updatedEndDate}`,
            type: "Live",
            email: userdetails?.email,
            time: moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm A")
        };
        const campaignIdNameMap = {};

        gridRef.current.api.forEachLeafNode(node => {
            const d = node.data;
            if (d?.campaignid && d?.campaignname) {
                campaignIdNameMap[String(d.campaignid)] = d.campaignname;
            }
        });
        gridRef.current.api.exportDataAsCsv({
            processRowGroupCallback: (params) => {
                return campaignIdNameMap[String(params.node.key)] || params.node.key;
            },
            processCellCallback: (params) => {
                const colId = params.column.getColId();

                if (colId === 'campaignid') {
                    return params.data?.campaignname || params.value;
                }

                return params.value;
            }
        });
        try {
            await apiClient.post('api/reports/dataexports', { Details });
        } catch (err) {
            console.error("Export activity logging failed", err);
        }
    }
    const calculateTotals = (rows) => {
        return rows.reduce((totals, row) => {
            totals.spend += Number(row.spend || 0);
            totals.revenue += Number(row.revenue || 0);
            totals.profit += Number(row.profit || 0);

            totals.conversions += Number(row.conversions || 0);
            totals.fbleads += Number(row.fbleads || 0);
            totals.fbclicks += Number(row.fbclicks || 0);
            totals.fblinkclicks += Number(row.fblinkclicks || 0);
            totals.impressions += Number(row.impressions || 0);

            // Include these if they exist in your data
            totals.accountnumber += Number(row.accountnumber || 0);
            totals.rpc += Number(row.rpc || 0);
            totals.cpl += Number(row.cpl || 0);
            totals.ncpl += Number(row.ncpl || 0);
            totals.cpc += Number(row.cpc || 0);
            totals.cpclinkclicks += Number(row.cpclinkclicks || 0);
            totals.filteration += Number(row.filteration || 0);
            totals.ctr += Number(row.ctr || 0);
            totals.cpm += Number(row.cpm || 0);
            totals.roi += Number(row.roi || 0);
            totals.margin += Number(row.margin || 0);
            totals.fmargin += Number(row.fmargin || 0);

            return totals;
        }, {
            spend: 0,
            revenue: 0,
            profit: 0,

            conversions: 0,
            fbleads: 0,
            fbclicks: 0,
            fblinkclicks: 0,
            impressions: 0,

            accountnumber: 0,
            rpc: 0,
            cpl: 0,
            ncpl: 0,
            cpc: 0,
            cpclinkclicks: 0,
            filteration: 0,
            ctr: 0,
            cpm: 0,
            roi: 0,
            margin: 0,
            fmargin: 0,
        });
    };
    const updatePinnedBottomRow = (api, call) => {
        if (!api) return;

        const rows = [];

        api.forEachNodeAfterFilterAndSort((node) => {
            if (!node.group && !node.footer && !node.rowPinned && node.data) {
                rows.push(node.data);
            }
        });

        const pinnedNode = api.getPinnedBottomRow(0);

        if (!pinnedNode) {
            console.log("Pinned row not found");
            return;
        }

        if (!rows.length) {
            Object.assign(pinnedNode.data, {
                spend: 0,
                revenue: 0,
                profit: 0,
                conversions: 0,
                fbleads: 0,
                fbclicks: 0,
                fblinkclicks: 0,
                impressions: 0,
                rpc: 0,
                cpl: 0,
                ncpl: 0,
                cpc: 0,
                cpclinkclicks: 0,
                ctr: 0,
                cpm: 0,
                roi: 0,
                margin: 0,
                fmargin: 0,
                filteration: 0,
                tax: 0,
            });

            api.refreshCells({
                rowNodes: [pinnedNode],
                force: true,
            });

            return;
        }

        const t = calculateTotals(rows);

        const rpc = t.conversions ? t.revenue / t.conversions : 0;
        const revenue = rpc * t.fbleads;
        const tax = rows.reduce((sum, data) => {
            const accountTax = taxDetails?.find(
                item =>
                    String(item.accountNumber) ===
                    String(data.accountNumber)
            );

            const taxRate =
                parseFloat(
                    String(accountTax?.tax || "0").replace("%", "")
                ) || 0;

            const spend = Number(data.spend) || 0;

            return sum + spend + (spend * taxRate) / 100;
        }, 0);

        const row = {
            spend: Number(t.spend) || 0,
            revenue: Number(t.revenue) || 0,
            profit: Number(t.profit) || 0,
            conversions: Number(t.conversions) || 0,
            fbleads: Number(t.fbleads) || 0,
            fbclicks: Number(t.fbclicks) || 0,
            fblinkclicks: Number(t.fblinkclicks) || 0,
            impressions: Number(t.impressions) || 0,

            rpc: Number(rpc.toFixed(2)),
            cpl: t.fbleads ? Number((t.spend / t.fbleads).toFixed(2)) : 0,
            ncpl: t.conversions ? Number((t.spend / t.conversions).toFixed(2)) : 0,
            cpc: t.fbclicks ? Number((t.spend / t.fbclicks).toFixed(2)) : 0,
            cpclinkclicks: t.fblinkclicks ? Number((t.spend / t.fblinkclicks).toFixed(2)) : 0,
            ctr: t.impressions ? Number(((t.fbclicks / t.impressions) * 100).toFixed(2)) : 0,
            cpm: t.impressions ? Number(((t.spend / t.impressions) * 1000).toFixed(2)) : 0,
            roi: t.spend ? Number((((t.revenue - t.spend) / t.spend) * 100).toFixed(2)) : 0,
            margin: t.revenue
                ? Number((((t.revenue - t.spend) / t.revenue) * 100).toFixed(2))
                : 0,
            fmargin: revenue
                ? Number((((t.revenue - t.spend) / revenue) * 100).toFixed(2))
                : 0,
            filteration: t.fbleads
                ? Number((((t.fbleads - t.conversions) / t.fbleads) * 100).toFixed(2))
                : 0,
            tax: Number(tax.toFixed(2)),
        };

        Object.assign(pinnedNode.data, row);

        api.refreshCells({
            rowNodes: [pinnedNode],
            force: true,
        });
    };

    const autoGroupColumnDef = {
        headerName: 'Hourly Breakdown',
        minWidth: 40,
        pinned: 'left',
        sortable: true, // Enable sorting
        unSortIcon: true,
        sort: 'asc', // Default sort order
        headerClass: 'ag-center-header',
        valueFormatter: (params) => {
            // GROUP ROW
            if (params.node?.group) {
                const firstChild = params.node.childrenAfterGroup?.[0]?.data;
                return firstChild?.campaignname ?? params.node.key;
            }

            // LEAF ROW
            return params.value;
        },
        comparator: (groupKeyA, groupKeyB, nodeA, nodeB) => {

            const leafA = nodeA.allLeafChildren?.[0]?.data;
            const leafB = nodeB.allLeafChildren?.[0]?.data;

            if (!leafA) return 1;
            if (!leafB) return -1;

            const hourA = leafA.fb_hour; // 👈 adjust if field name differs
            const hourB = leafB.fb_hour;

            // Try numeric sorting (best for hours like 0–23)
            const numA = Number(hourA);
            const numB = Number(hourB);

            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }

            // fallback (if values are strings like "01:00", "12 PM", etc.)
            return String(groupKeyA).localeCompare(String(groupKeyB));
        },
        cellRenderer: "agGroupCellRenderer", // ✅ Use AG Grid's built-in renderer
        cellRendererParams: {
            // checkbox: true,
            suppressCount: false,
            innerRenderer: (params) => {
                if (params.node.rowPinned === 'bottom') {
                    return 'Total';
                }
                if (params.node.footer) {
                    return 'Total';
                }

                const campaignName = (() => {
                    if (params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.["fb-hour"] || params.node.key;
                    }
                    return ""; // fallback to campaignid
                })();

                const firstColumnValue = campaignName;

                const valueWithCount = `${firstColumnValue}`;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Tooltip
                            title={valueWithCount}
                            overlayInnerStyle={{
                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                border: '1px solid #ccc',
                                borderRadius: 6,
                            }}
                        >
                            <span
                                style={{ cursor: 'pointer' }}
                            >
                                {valueWithCount}
                            </span>
                        </Tooltip>
                    </div>
                );
            }
        },
        processCellForClipboard: (params) => {
            if (params.node.group) {
                if (!params.node.parent || !params.node.parent.childrenAfterGroup) {
                    return params.node.key;
                }
                return params.node.rowIndex === params.node.parent.childrenAfterGroup[0]?.rowIndex ? params.node.key : ""; // Prevent duplicate copies
            }
            return params.value; // Normal copy behavior for regular cells
        }
    }
    const getLatestHour = async (functionCall1) => {

        const collectionName = updatedRevenuePartner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[updatedRevenuePartner];
        try {

            const resp = await apiClient.post('api/reports/latesthour',
                { dateStart: updatedStartDate, dateEnd: updatedEndDate, timezone: updatedTime, network: collectionName, }
            );
            setLatestHour(resp?.data?.latestHour ?? 0);
        } catch (error) {
            console.log(error);
        }
        functionCall1()
    };

    const functionCall1 = async () => {
        try {
            setDataLoader(false);
            const collectionName = updatedRevenuePartner === "FB_DomainActive" ? "Facebook_DActive_Names" : newtworkCollections[updatedRevenuePartner];

            // --- ALWAYS use CampaignLevelAccounts (single OR multiple) ---
            // Normalize to array of strings
            const accountsParam = Array.isArray(updatedAccountsValue) ? updatedAccountsValue.map(String) : [String(updatedAccountsValue)];

            // Build GET query with repeated accountNumbers keys
            const params = new URLSearchParams({
                dateStart: updatedStartDate, dateEnd: updatedEndDate,
                timezone: updatedTime, status: "Live", network: collectionName,
            });
            accountsParam.forEach(acc => params.append("accountNumbers", acc));

            //   const resp = await apiClient.post(`/CampaignLevelAccounts?${params.toString()}`);
            const resp = await axios.post('/api/reports/hourly', {
                dateStart: updatedStartDate, dateEnd: updatedEndDate, timezone: updatedTime,
                status: "Live", network: collectionName, accountNumbers: accountsParam,
            });


            const mainData = resp.data.data;
            const filteredData = mainData && mainData.length > 0 ?
                mainData.map((eachData) => {
                    let revenueData;
                    if (eachData.estimated_revenue === 0 || isNaN(eachData.estimated_revenue)) {
                        revenueData = 0;
                    } else if (eachData.estimated_revenue === undefined) {
                        revenueData = 0;
                    } else if (eachData.estimated_revenue === null) {
                        revenueData = 0;
                    } else {
                        revenueData = parseFloat(eachData.estimated_revenue).toFixed(2);
                    }
                    const profit = (revenueData - eachData.spend).toFixed(2);
                    let margin;
                    if (revenueData === 0) {
                        margin = "0";
                    } else {
                        margin = `${Math.round((((revenueData - eachData.spend) / revenueData) * 100) * 100) / 100}%`;
                    }
                    const rpc = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((revenueData / eachData.conversions) * 100) / 100;

                    let cpl;
                    if (eachData.fbLeads == 0) {
                        cpl = 0;
                    } else {
                        cpl = Math.round((eachData.spend / eachData.fbLeads) * 100) / 100;
                    }
                    const ncpl = eachData.conversions === 0 || eachData.conversions === undefined ? 0 : Math.round((eachData.spend / eachData.conversions) * 100) / 100;

                    const relatedComment = campaignComments.find(comment => comment.campaignname === eachData.campaign_name);
                    const category = campaignComments.find(campaign => campaign.campaignid === eachData.campaign_id && campaign.Account === eachData.accountNumber && campaign.level === "campaign");
                    const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
                    const campaignPinned = campaignComments.find(campaign => campaign.campaignname === eachData.campaign_name && campaign.Account === eachData.accountNumber && campaign.campaign_id === eachData.campaign_id);
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
                    const campaignObjectStatus = Camapignlevelstatus
                        .find(item =>
                            String(item.campaign_id) === String(eachData.campaign_id) &&
                            String(item.accountNumber) === String(eachData.accountNumber)
                        );
                    return {
                        accountNumber: eachData.accountNumber,
                        campaignname: eachData.campaign_name,
                        adsetname: eachData.adsetName,
                        date: eachData[`${updatedTime}Date`],
                        'fb-hour': eachData.hour || "",
                        'mnet-hour': eachData.updatedHour || "",
                        spend: parseFloat(eachData.spend).toFixed(2),
                        revenue: revenueData ? revenueData : 0,
                        profit: parseFloat(profit),
                        fbleads: parseInt(eachData.fbLeads),
                        conversions: eachData.conversions !== null && eachData.conversions !== 0 ? parseInt(eachData.conversions) : 0,
                        cpc: parseFloat(eachData.cpc),
                        cpclinkclicks: cpcLinkClicks,
                        fbclicks: parseInt(eachData.fbClicks),
                        fblinkclicks: parseInt(eachData.fbLinkClicks),
                        impressions: parseInt(eachData.impressions),
                        rpc: parseFloat(rpc),
                        cpl: parseFloat(cpl),
                        ncpl: parseFloat(ncpl),
                        adsetid: eachData.adset_id,
                        campaignid: eachData.campaign_id,
                        timezone: eachData[updatedTime] || "",
                        // comment: relatedComment ? relatedComment.comment : "",
                        adid: "",
                        adname: "",
                        actions: '...',
                        from: campaign_date?.start ? campaign_date?.start : "",
                        to: campaign_date?.end ? campaign_date?.end : "",
                        profitloss: "",
                        M_tq: "",
                        D_tq: "",
                        fbCron: eachData.fbCron,
                        revenueCron: eachData.revenueCron,
                        cronStatus: eachData.cronStatus,
                        accountStatus: eachData.accountStatus,
                        category: category?.category || "",
                    };
                })
                : [];
            if (mainData.length) {
                maxHour.current = getFBHour(mainData, updatedStartDate, updatedEndDate);
                maxNetworkHour.current = getMaxHour(mainData);
                // accountStatus.current = findRevenueObject.accountStatus;
                const getLatestValue = (data, field) => {
                    return data
                        .filter(item => item[field] !== null && item[field] !== 'Failed')
                        .sort((a, b) => new Date(b[field]) - new Date(a[field]))[0]?.[field] || 'Failed';
                };

                cronStatus.current = getLatestValue(mainData, 'cronStatus');

                fbCron.current = getLatestValue(mainData, 'fbCron');
                revenueCron.current = getLatestValue(mainData, 'revenueCron');
            }
            let newFilterData = filteredData;
            if (showAllHours) {
                newFilterData = newFilterData.filter((item) => {
                    const fbHour = Number(item["fb-hour"]);

                    if (isNaN(fbHour)) {
                        return false;
                    }
                    return fbHour <= Number(latestHour);
                });
            }
            campaignDataRef.current = filteredData;
            setDataLoader(true);
            setCampainData(newFilterData);
            // setLoading(false);

        } catch (error) {
            console.log(error)
            setDataLoader(true);
            setCampainData([]);
        }
    };

    const columnDefsObject = useMemo(() => {
        const allColumns = columnDefsHourly({ taxDetails });
        const existingColumns = userColumnStructure.map(key => allColumns[key]).filter(Boolean);
        return [...existingColumns, ...customColumns];
    }, [userColumnStructure, customColumns, taxDetails]);


    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: { textAlign: "center", fontSize: "12px", },
    }), []);
    useEffect(() => {
        if (activeTab !== "5") {
            return;
        }

        const currentKey = JSON.stringify({
            accounts: updatedAccountsValue, startDate: updatedStartDate,
            endDate: updatedEndDate, time: updatedTime, showAllHours: showAllHours, refreshTabs: refreshTabs
        });

        if (lastCampaignFetch.current === currentKey) {
            return;
        }

        lastCampaignFetch.current = currentKey;

        setLoading(true);
        setDataLoader(false);
        getLatestHour(functionCall1);
    }, [activeTab, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, showAllHours, refreshTabs]);

    const gridOptions = {
        defaultColDef: { suppressMenu: true, headerClass: "custom-header" },
        ensureDomOrder: false
    };
    const multiple = updatedAccountsValue.length > 1;
    const accountsAccess = userData[updatedRevenuePartner];
    const accountMap = new Map(accountsAccess.map(a => [a.accountNumber, a]));
    const color = theme === "dark" ? "white" : "black";
    const icon = { color, cursor: "pointer" };
    const accountTip = (type) => (
        <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {updatedAccountsValue.map((id, i) => {
                const a = accountMap.get(id);
                return (
                    <div
                        key={`${id}-${i}`}
                        style={{ padding: "4px 6px", borderBottom: "1px solid #0001", fontSize: 12, color: theme === "dark" ? "#ddd" : "#333" }}
                    >
                        {type === "tz" ?
                            `${id} - ${a?.timeZone ?? "-"}` :
                            <>
                                <div>{id}</div>
                                <div>{a?.accountName ?? "-"}</div>
                            </>
                        }
                    </div>
                );
            })}
        </div>
    );
    const onColumnMoved = (params) => {
        if (!params.finished || params.source !== "uiColumnMoved") return;

        const columnOrder = params.api.getAllGridColumns()
            .filter((column) => column.getColId() !== "ag-Grid-AutoColumn").map((column) => column.getColId());

        handleColumnMove(columnOrder);
    };

    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {loading && (
                <div style={{ height: 400, backgroundColor: theme === "dark" ? "#000" : "#e6e6e6" }}>
                    <GridLoading theme={theme} />
                </div>
            )}
            <div style={{ display: loading ? "none" : "block", }}>
                <Row
                    className="header-row"
                    style={{
                        width: "100%", display: "flex", alignItems: "center", flexWrap: "nowrap",
                        background: theme === "dark" ? "#4d4d4d" : "white", padding: "2px 5px 2px 5px"
                    }}
                >
                    <Col style={{ flex: ".2 1 auto" }}>
                        <Space align="center">
                            <div className="blinking-circle-1" />
                            <Text style={{ paddingLeft: 3, fontSize: 12, color }}>
                                Live
                            </Text>
                        </Space>
                    </Col>

                    <Col style={{ flex: "1 1 auto" }}>
                        {multiple ? (
                            <Tooltip
                                title={accountTip("id")}
                                styles={{
                                    container: {
                                        maxWidth: 320,
                                        background: theme === "dark" ? "#1f1f1f" : "#fff",
                                        color
                                    },
                                }}
                            >
                                <Badge count={updatedAccountsValue.length} size="small">
                                    <NumberOutlined style={{ ...icon, color: theme === "dark" ? "#9ad" : "grey" }} />
                                </Badge>
                            </Tooltip>
                        ) : (
                            <Text style={{ color, fontSize: 12 }}>Id: {updatedAccountsValue[0] ?? "-"}</Text>
                        )}
                    </Col>

                    <Col style={{ flex: "1 1 auto" }}>
                        {!multiple && (
                            <Text style={{ color, fontSize: 12 }}>
                                Name: {accountMap.get(updatedAccountsValue[0])?.accountName ?? "-"}
                            </Text>
                        )}
                    </Col>

                    <Col style={{ flex: "1 1 auto" }}>
                        {multiple ? (
                            <Tooltip
                                title={accountTip("tz")}
                                styles={{
                                    container: { maxWidth: 320, background: theme === "dark" ? "#1f1f1f" : "#fff", color },
                                }}
                            >
                                <Badge count={updatedAccountsValue.length} size="small">
                                    <GlobalOutlined style={{ ...icon, color: theme === "dark" ? "#9ad" : "grey" }} />
                                </Badge>
                            </Tooltip>
                        ) : (
                            <Text style={{ color, fontSize: 12 }}>
                                Time zone: {updatedTime ?? "-"}
                            </Text>
                        )}
                    </Col>

                    <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                        <Text style={{ color: theme === "dark" && "white", fontSize: 12 }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                    </Col>
                    <Col>
                        <Switch
                            checked={showAllHours}
                            onChange={(checked) => setShowAllHours(checked)}
                            checkedChildren="Revenue"
                            unCheckedChildren="Spend"
                            style={{
                                backgroundColor: showAllHours ? "#91c25f" : undefined
                            }}
                        />
                    </Col>

                    <Col style={{ margin: "0px 16px 0px 16px" }}>
                        <Tooltip
                            title={
                                <div style={{ fontSize: 13 }}>
                                    <div>Fb status: {fbCron.current?.toLowerCase()}</div>
                                    <div>Rev status: {revenueCron.current?.toLowerCase()}</div>
                                    <div>Cron status: {cronStatus.current?.toLowerCase()}</div>
                                </div>
                            }
                            styles={{
                                container: {
                                    background: theme === "dark" ? "#111" : "#fff",
                                    color, border: "1px solid #ccc", borderRadius: 6
                                },
                            }}
                        >
                            <InfoCircleOutlined style={{ fontSize: 18, cursor: "pointer", color: "#91C25F" }} />
                        </Tooltip>
                    </Col>

                    <Col>
                        <Button
                            type="primary"
                            style={{
                                background: "#91C25F",
                                border: 0,
                                color: "black",
                                height: 25,
                                fontSize: 12
                            }}
                            icon={<DownloadOutlined />}
                            onClick={onBtExport}
                        />
                    </Col>
                </Row>
                <div
                    className={theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz"}
                    style={{
                        height: 400,
                        // flex: 1,
                        // minHeight: 0,
                        // height: "calc(100% - 60px)",
                        width: "100%",

                    }}
                >


                    <ReusableAgGrid
                        rowData={memorizedCampaignData}
                        dataLoader={dataLoader}
                        columnDefs={columnDefsObject}
                        defaultColDef={defaultColDef}
                        autoGroupColumnDef={autoGroupColumnDef}
                        pagination={true}
                        paginationPageSize={200}
                        paginationPageSizeSelector={[20, 40, 60, 80, 100, 150, 200]}
                        processCellForClipboard={(params) => {
                            // Only customize the Campaign Name (group) column
                            if (params.node.group && params.column.getColId() === "ag-Grid-AutoColumn") {
                                return (params.node.childrenAfterGroup?.[0]?.data?.["fb-hour"] ?? params.node.key);
                            }
                            return params.value;
                        }}
                        gridOptions={gridOptions}
                        setLoading={setLoading}
                        updatePinnedBottomRow={updatePinnedBottomRow}
                        ref={gridRef}
                        onGridReady={onGridReady}
                        onColumnMoved={onColumnMoved}
                        getMainMenuItems={getMainMenuItems}
                    />
                </div>
            </div>

        </div>

    );
}