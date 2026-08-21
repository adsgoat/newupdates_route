"use client";
import axios from "axios";
import moment from 'moment-timezone';
import React, { useMemo, useState, useEffect, useRef } from "react";
import { App, Tooltip, Switch, Modal, Input, Button, Spin } from "antd";
import { EditOutlined, MessageOutlined, CopyOutlined, PictureOutlined, GlobalOutlined, LikeOutlined, CommentOutlined, ShareAltOutlined } from "@ant-design/icons"
import GridLoading from "@/components/common/skeletonloading";
import { newtworkCollections } from "../livereports/networksandtimezones";
import { columnDefsObjectForCampaign } from "../columndefs/page";
import ReusableAgGrid from "@/components/reports/insights";
import TableConfig from "@/components/reports/tableConfig"
import CampaignHistoryModal from "../reportactivity/page";
import "@/lib/agGridSetup";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export default function KeywordTable({ theme, userData, updatedRevenuePartner, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, userColumnStructure, campaignMap, adsetMap, commentsMap, Camapignlevelstatus, setCamapignlevelstatus, campaignComments, setCampaignComments, adLevelCreatives, setAdLevelCreatives, searchValue, showCampaignLevel, activeTab, activeTabForLiveReports, setSelectedCampaigns, moveToNextTab, leafCampaigns, handleColumnMove, getMainMenuItems, customColumns, refreshTabs }) {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [dataLoader, setDataLoader] = useState(false);
    const [campaignData, setCampainData] = useState([])
    const memorizedCampaignData = useMemo(() => campaignData, [campaignData])
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedCampaignIdForHistory, setSelectedCampaignIdForHistory] = useState(null);
    const [selectedAccountForHistory, setSelectedAccountForHistory] = useState(null);
    const [allProfitLossArray, setallProfitLossArray] = useState([]);
    // const [leafCampaigns, setLeafCampaigns] = useState([]);
    const [insideInput, setInsideInput] = useState("");
    const [campaignStatusFilter, setCampaignStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const campaignDataRef = useRef([]);
    const fbCron = useRef();
    const revenueCron = useRef();
    const cronStatus = useRef();
    const gridRef = useRef();
    const maxHour = useRef();
    const maxNetworkHour = useRef();
    const lastCampaignFetch = useRef(null);
    const apiClient = axios;
    const userdetails = { email: "praveen@adsgoat.in", role: "admin", userName: "Praveen" }

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
        };

        Object.assign(pinnedNode.data, row);

        api.refreshCells({
            rowNodes: [pinnedNode],
            force: true,
        });
    };

    const autoGroupColumnDef = {
        headerName: 'Campaign name',
        minWidth: 400,
        pinned: 'left',
        sortable: true, // Enable sorting
        unSortIcon: true,
        headerClass: 'ag-center-header',
        cellRenderer: "agGroupCellRenderer",
        valueFormatter: (params) => {
            // GROUP ROW
            if (params.node?.group) {
                const firstChild = params.node.childrenAfterGroup?.[0]?.data;
                return firstChild?.campaignname ?? params.node.key;
            }

            // LEAF ROW
            return params.value;
        },
        cellRendererParams: {
            // checkbox: true,
            // checkbox: (params) => params.node.group,
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
                        return params.node.childrenAfterGroup[0]?.data?.campaignname || params.node.key;
                    }
                    return params.node.key; // fallback to campaignid
                })();
                const rowAccount = (() => {
                    if (params.node.group && params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.accountNumber ?? null;
                    }
                    return params.data?.accountNumber ?? null;
                })();
                const campaignid = (() => {
                    if (params.node.group && params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.campaignid ?? null;
                    }
                    return params.data?.campaignid ?? null;
                })();
                const adsetid = (() => {
                    if (params.node.group && params.node.childrenAfterGroup?.length > 0) {
                        return params.node.childrenAfterGroup[0]?.data?.adsetid ?? null;
                    }
                    return params.data?.adsetid ?? null;
                })();
                const rec = campaignComments.find(c =>
                    // c.campaignname === campaignName &&
                    String(c.Account) === String(rowAccount) &&
                    (c.campaignid ? String(c.campaignid) === String(campaignid) : true)
                    && c.level === "campaign"
                    // && (c.adsetid ? String(c.adsetid) === String(aid) : true)
                );
                const isMobile = typeof window !== "undefined" && window.innerWidth <= 576;
                const getPinStatusForCampaign = (campaignName) => {
                    // const relatedComment = campaignComments.find(comment => comment.campaignname === campaignName);
                    const relatedComment = campaignComments.find(c =>
                        // c.campaignname === campaignName &&
                        String(c.Account) === String(rowAccount) &&
                        (c.campaignid ? String(c.campaignid) === String(campaignid) : true)
                        && c.level === "campaign"
                        // && (c.adsetid ? String(c.adsetid) === String(aid) : true)
                    );
                    return relatedComment ? relatedComment.pinned : false;
                };

                const [switchOn, setSwitchOn] = useState(false);
                const [pinned, setPinned] = useState(getPinStatusForCampaign(campaignName));
                const [universalOject, setUniversalObject] = React.useState(null)
                const [confirmLoading, setConfirmLoading] = React.useState(true);
                const [modalLoading, setModalLoading] = useState(false);
                const [isModalVisibles, setIsModalVisibles] = useState(false);
                const [tooltipText, setTooltipText] = useState("Click to Copy");
                const [comment, setComment] = useState(rec?.comment ?? "");
                const [isCampaignModalVisibles, setIsCampaignModalVisibles] = useState(false);
                const [nextChecked, setNextChecked] = useState(false); // what user clicked
                const [statusLoading, setStatusLoading] = useState(false)
                const [selectedCampaignCreatives, setSelectedCampaignCreatives] = useState([]);
                const [creativeModalOpen, setCreativeModalOpen] = useState(false);
                const handlePauseOk = async () => {
                    const desired = nextChecked;                  // true => ACTIVE, false => PAUSED
                    // setIsCampaignModalVisibles(true);
                    setStatusLoading(true);
                    try {
                        const payloadForActivity = {
                            editType: "Status",
                            campaignid: campaignid,       // cents
                            Account: String(rowAccount),    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Campain status updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A"),
                            updateDetail: `From ${desired ? "Inactive" : "Active"} to ${desired ? "Active" : "Inactive"}`,
                        }
                        const payload = {
                            status: desired ? "ACTIVE" : "PAUSED",
                            id: params.data?.identifier,
                            campaign_id: campaignid,
                            accountNumber: String(rowAccount),
                            adset_id: adsetid,
                            name: campaignName,
                            email: userdetails?.email,
                            activity: payloadForActivity,
                        };

                        const response = await apiClient.post(`/api/reports/status/campaign/single`, payload);

                        const newStatus = desired ? "ACTIVE" : "PAUSED";

                        if (response.status === 200 || response.status === 201) {
                            // setConfirmLoading(false);
                            setSwitchOn(desired); // optimistic
                            const updatedCampaignLevelStatus = Camapignlevelstatus.map(item =>
                                String(item.campaign_id) === String(campaignid) &&
                                    String(item.accountNumber) === String(rowAccount)
                                    ? { ...item, status: newStatus } // update only this campaign
                                    : item
                            );
                            setCamapignlevelstatus(updatedCampaignLevelStatus);
                            setIsCampaignModalVisibles(false);
                        }

                        // ✅ Persist status only in the override Map (no rowData update, no parent setState)
                        // if (overrides) {
                        //     overrides.set(statusKey, newStatus);
                        // }

                        message.success(`Campaign ${newStatus.toLowerCase()}`);
                    } catch (e) {
                        // revert only this switch
                        // setConfirmLoading(false);
                        setSwitchOn(prev => !prev);
                        message.warning("Failed to update campaign status");
                    } finally {
                        setStatusLoading(false)
                        // setIsCampaignModalVisibles(false);
                        // setSelectedCampaign(null);
                        // setPendingAccount(null);
                    }
                };
                const handlePauseCancel = () => {
                    setIsCampaignModalVisibles(false);
                };
                const handlePauseClick = (checked) => {
                    setNextChecked(checked);
                    setIsCampaignModalVisibles(true);
                };
                const handlePinClick = async (campaignName, campaignid, adsetid, currentPinStatus) => {
                    const updatedPinStatus = !currentPinStatus;

                    const payloadForActivity = {
                        editType: "Pin",
                        campaignid: campaignid,       // cents
                        Account: rowAccount,    // ✅ update *this* row’s account
                        campaignname: campaignName,
                        updatedBy: userdetails?.userName,
                        updatedUserEmail: userdetails?.email,
                        updateType: "Campaign pin updated",
                        updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A"),
                        updateDetail: `From "${updatedPinStatus ? "unpin" : "pin"}" to "${updatedPinStatus ? "pin" : "unpin"}"`,
                    }

                    const body = {
                        accountNumber: rowAccount,
                        campaignname: campaignName,
                        campaignid,
                        userPin: userdetails?.email,
                        // comment: comment || '',
                        level: "campaign",
                        activity: payloadForActivity,
                    };

                    const resp = updatedPinStatus
                        ? await axios.post('api/reports/pin/single', body)
                        : await axios.post('api/reports/unpin/single', body);

                    if (resp.status === 200 || resp.status === 201) {
                        // if (newResponse.status === 200 || newResponse.status === 201) {
                        setCampaignComments(prev => {
                            const arr = Array.isArray(prev) ? [...prev] : [];
                            const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A');

                            const match = arr.findIndex(
                                i =>
                                    String(i?.campaignid) === String(campaignid) &&
                                    String(i?.Account) === String(rowAccount) &&
                                    //   String(i?.adsetid) === String(adsetid) &&
                                    //   String(i?.ad_id) === String(adid) &&
                                    String(i?.level) === 'campaign'
                            );

                            if (match >= 0) {
                                arr[match] = { ...arr[match], pinned: updatedPinStatus, userPin: userdetails?.email, editedPinTime: timeStamp };
                            } else {
                                arr.push({
                                    campaignid,
                                    Account: rowAccount,
                                    //   adsetid,
                                    //   ad_id: adid,
                                    level: 'campaign',
                                    pinned: updatedPinStatus,
                                    userPin: userdetails?.email,
                                    editedPinTime: timeStamp
                                });
                            }

                            return arr;
                        });
                        //   }
                        // refreshComments(accountsParam);     // your helper already accepts array
                        message.success(updatedPinStatus ? `Pinned ${campaignName}` : `Unpinned ${campaignName}`);
                        setPinned(updatedPinStatus);
                    }
                };
                const handleEditClick = () => {
                    console.log("clicked")
                    setIsModalVisibles(true);
                };
                const handleOks = async () => {
                    setModalLoading(true)
                    try {
                        const payloadForActivity = {
                            editType: "Comment",
                            campaignid: campaignid,       // cents
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Campaign comment updated",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const body = {
                            accountNumber: rowAccount,
                            campaignname: campaignName,
                            campaignid,
                            comment,
                            usercommit: userdetails?.email,
                            level: "campaign",
                            activity: payloadForActivity,
                        };
                        const newResponse = await apiClient.post('/api/reports/comments/createandupdate/single', body);
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        // String(i?.adsetid) === String(adsetid) &&
                                        // String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'campaign'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], comment: comment, usercommit: userdetails?.email, editedTime: timeStamp };
                                } else {
                                    arr.push({
                                        campaignid,
                                        Account: rowAccount,
                                        // adsetid,
                                        // ad_id: adid,
                                        level: 'campaign',
                                        comment: comment,
                                        usercommit: userdetails?.email,
                                        editedTime: timeStamp
                                    });
                                }

                                return arr;
                            });
                        }
                        // refreshComments(accountsParam);
                        message.success(`Comment saved for ${campaignName}`);
                        setIsModalVisibles(false);
                    }
                    catch (error) {
                        console.error(error.message)
                    }
                    finally {
                        setModalLoading(false)
                    }
                };
                const handleCancels = () => {
                    setIsModalVisibles(false);
                };

                const handleDelete = async () => {
                    setModalLoading(true)
                    try {
                        const payloadForActivity = {
                            editType: "Comment",
                            campaignid: campaignid,       // cents
                            Account: rowAccount,    // ✅ update *this* row’s account
                            campaignname: campaignName,
                            updatedBy: userdetails?.userName,
                            updatedUserEmail: userdetails?.email,
                            updateType: "Campaign comment cleared",
                            updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A"),
                            // updateDetail: `From ${updatedPinStatus ? "unpin" : "pin"} to ${updatedPinStatus ? "pin" : "unpin"}`,
                        }
                        const body = {
                            accountNumber: rowAccount,
                            campaignname: campaignName,
                            campaignid,
                            // comment,
                            usercommit: userdetails?.email,
                            level: "campaign",
                            activity: payloadForActivity,
                        };
                        const newResponse = await apiClient.post('/api/reports/comments/delete/single', body);
                        if (newResponse.status === 200 || newResponse.status === 201) {
                            setCampaignComments(prev => {
                                const arr = Array.isArray(prev) ? [...prev] : [];
                                const timeStamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A');

                                const match = arr.findIndex(
                                    i =>
                                        String(i?.campaignid) === String(campaignid) &&
                                        String(i?.Account) === String(rowAccount) &&
                                        // String(i?.adsetid) === String(adsetid) &&
                                        // String(i?.ad_id) === String(adid) &&
                                        String(i?.level) === 'campaign'
                                );

                                if (match >= 0) {
                                    arr[match] = { ...arr[match], comment: "", usercommit: userdetails?.email, editedTime: timeStamp };
                                }
                                // else {
                                //     arr.push({
                                //         campaignid,
                                //         Account: rowAccount,
                                //         // adsetid,
                                //         // ad_id: adid,
                                //         level: 'campaign',
                                //         comment: comment,
                                //         usercommit: userdetails?.email,
                                //         editedTime: timeStamp
                                //     });
                                // }

                                return arr;
                            });
                            message.success(`Comment deleted for ${campaignName}`);
                            setIsModalVisibles(false);
                        }
                    }
                    catch (error) {

                    }
                    finally {
                        setModalLoading(false)
                    }
                };
                const copyToClipboard = () => {
                    navigator.clipboard.writeText(campaignName)
                        .then(() => {
                            setTooltipText("Copied!");
                            setTimeout(() => setTooltipText("Click to Copy"), 2000);
                        })
                        .catch(() => {
                            console.error('Failed to copy to clipboard');
                        });
                };
                const CustomTooltipContent = ({ editedTime, usercommit }) => (
                    <div style={{ padding: '5px', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: theme === 'dark' ? "#fff" : "#000" }}>{usercommit}</p>
                        <p style={{ margin: 0, color: theme === 'dark' ? "#fff" : "#000" }}>{editedTime}</p>
                    </div>
                );
                React.useEffect(() => {
                    setUniversalObject(campaignComments.find(d => d.level === "campaign" && d.campaignid === campaignid && d.Account === rowAccount));
                    const rec = campaignComments.find(d => d.level === "campaign" && d.campaignid === campaignid && d.Account === rowAccount)
                    setComment(rec?.comment || '');
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [campaignComments]);
                useEffect(() => {
                    const st = Camapignlevelstatus.find(
                        s => String(s.campaign_id) === String(campaignid) &&
                            String(s.accountNumber) === String(rowAccount)
                    );
                    setSwitchOn(st ? st.status === "ACTIVE" : false);
                }, [Camapignlevelstatus, campaignid, rowAccount]);
                const PinIcon = ({ universalOject, campaignName, campaignid, adsetid, pinned }) => {
                    return (
                        <Tooltip
                            title={pinned ? <CustomTooltipContent editedTime={universalOject?.editedPinTime} usercommit={universalOject?.userPin} /> : null}
                            styles={{
                                container: {
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                },
                            }}
                        >
                            <button
                                onClick={() => handlePinClick(campaignName, campaignid, adsetid, pinned)}
                                style={{
                                    transform: "scale(0.8)",
                                    transformOrigin: "left center",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    padding: "0px"
                                }}
                            >
                                {pinned ? "📌" : "📍"}
                            </button>
                        </Tooltip>
                    );
                };
                const campaignCreative = adLevelCreatives.find(
                    c =>
                        String(c.campaignId) === String(campaignid) &&
                        String(c.accountNumber) === String(rowAccount)
                );
                const creatives =
                    campaignCreative?.adsets?.flatMap(adset => adset.ads) || [];
                const CreativeMedia = ({ url, filetype, small = false }) => {
                    if (!url) return null;

                    const isVideo = filetype === "video";

                    const commonStyle = small
                        ?
                        { width: 50, height: 50, objectFit: "cover", borderRadius: 2, border: "1px solid #ccc", cursor: "pointer", }
                        :
                        { width: "100%", maxHeight: "250px", display: "block", objectFit: "contain", };

                    return isVideo ? (
                        <video src={url} style={commonStyle} controls={!small} muted={small} autoPlay={small} loop={small} playsInline />
                    ) : (
                        <img src={url} alt="creative" style={{ ...commonStyle, objectFit: small ? "cover" : "cover", }} />
                    );
                };
                const CreativeTooltip = () => {
                    if (!adLevelCreatives.length) {
                        return <div style={{ color: theme === "dark" ? "#e4e6eb" : "#050505" }}>Loading creatives…</div>;
                    }

                    if (!creatives.length) {
                        return <div style={{ color: theme === "dark" ? "#e4e6eb" : "#050505" }}>No creatives for this campaign</div>;
                    }

                    return (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 5,
                                maxWidth: 280
                            }}
                        >
                            {/* {creatives.map((ad, i) => (
                                <img
                                    key={i}
                                    src={ad.image}
                                    alt={ad.headline || "Creative"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCampaignCreatives(creatives);
                                        setCreativeModalOpen(true);
                                    }}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: "cover",
                                        borderRadius: 2,
                                        border: "1px solid #ccc",
                                        cursor: "pointer",
                                    }}
                                />

                            ))} */}
                            {creatives.map((ad, i) => (
                                <div
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCampaignCreatives(creatives);
                                        setCreativeModalOpen(true);
                                    }}
                                >
                                    <CreativeMedia
                                        url={ad.image}
                                        filetype={ad.filetype}
                                        small
                                    />

                                </div>
                            ))}

                        </div>
                    );
                };
                const CreativeAvatar = ({ url, filetype }) => {
                    if (!url) return null;

                    const isVideo = filetype === "video";

                    const style = {
                        width: 35,
                        height: 35,
                        borderRadius: "50%",
                        objectFit: "cover",
                    };

                    return isVideo ? (
                        <video
                            src={url}
                            muted
                            autoPlay
                            loop
                            playsInline
                            style={style}
                        />
                    ) : (
                        <img
                            src={url}
                            alt="page"
                            style={style}
                        />
                    );
                };
                // Don't show anything for leaf rows
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        {params.node.group && (
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Switch
                                    checked={switchOn}
                                    onChange={(checked, e) => {
                                        e?.stopPropagation?.();
                                        handlePauseClick(checked);
                                        // setSwitchOn(checked)
                                    }}
                                    size="small"
                                    style={{
                                        transform: "scale(0.82)",
                                        transformOrigin: "left center",
                                        backgroundColor: switchOn ? '#91C25F' : '#d9d9d9'
                                    }}
                                />
                                <PinIcon
                                    campaignName={campaignName}
                                    campaignid={campaignid}
                                    adsetid={adsetid}
                                    pinned={pinned}
                                    universalOject={universalOject}
                                />
                                {universalOject?.comment ? (
                                    <Tooltip
                                        // title={relatedComment || 'No comment available'}
                                        // title={
                                        //     <div>
                                        //       <div>{relatedComment || 'No comment available'}</div>
                                        //       <div>
                                        //         {editUserANdTime
                                        //           ? moment(editUserANdTime?.editedTime, "YYYY-MM-DD hh:mm:ss A").format("DD-MM-YYYY hh:mm:ss A")
                                        //           : "N/A"}
                                        //       </div>
                                        //     </div>
                                        // }
                                        title={
                                            <div>
                                                <div>{universalOject?.comment}</div>
                                                <div style={{ opacity: 0.85 }}>
                                                    {universalOject?.editedTime || 'N/A'}
                                                    <br />
                                                    {universalOject?.usercommit ? ` ${universalOject?.usercommit}` : ''}
                                                </div>
                                            </div>
                                        }
                                        styles={{
                                            container: {
                                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                                color: theme === 'dark' ? '#fff' : '#000',
                                                border: '1px solid #ccc',
                                                borderRadius: 6,
                                                fontSize: 12
                                                // fontWeight: 500,
                                            }
                                        }}
                                    >
                                        <MessageOutlined
                                            className={theme === "dark" ? "black-icon-comment" : 'Message'}
                                            style={{
                                                cursor: 'pointer',
                                                marginRight: 8,
                                                color: '#4CAF50'
                                            }}
                                            onClick={handleEditClick} // Open modal directly on click
                                        />
                                    </Tooltip>
                                ) :
                                    <EditOutlined onClick={handleEditClick} style={{ cursor: 'pointer', marginRight: 8 }} />
                                }
                                <Tooltip
                                    title={tooltipText}
                                    styles={{
                                        container: {
                                            backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            border: '1px solid #ccc',
                                            borderRadius: 6,
                                            // fontWeight: 500,
                                        },
                                    }}
                                >
                                    <CopyOutlined
                                        onClick={copyToClipboard}
                                        style={{ cursor: 'pointer', marginLeft: '2px', color: "#1e1e1f", marginRight: 7, transform: "scale(0.9)", transformOrigin: "left center" }}
                                    />
                                </Tooltip>
                                <Tooltip
                                    title={<CreativeTooltip />}
                                    placement="right"
                                    styles={{
                                        container: {
                                            backgroundColor: theme === "dark" ? "#111" : "#fff",
                                            border: "1px solid #ccc",
                                            borderRadius: 8,
                                            padding: 10
                                        }
                                    }}
                                >
                                    <PictureOutlined
                                        className={
                                            theme === "dark"
                                                ? creatives.length > 0
                                                    ? "black-icon-creatives"
                                                    : "black-icon-creatives1"
                                                : ""
                                        }

                                        style={{
                                            cursor: creatives.length > 0 ? "pointer" : "not-allowed",
                                            color: creatives.length ? "#1890ff" : "#aaa",
                                            fontSize: 12,
                                            marginRight: '5px'
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        )}

                        < Tooltip
                            title={campaignName}
                            styles={{
                                container: {
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                    fontSize: 12
                                },
                            }}
                        >
                            <span
                                onClick={() => {
                                    const rowData = params.node.group
                                        ? params.node.childrenAfterGroup?.[0]?.data
                                        : params.node.data;

                                    const rowNode = params.api.getRowNode(params.node.id);

                                    // Clear existing selections (for single-select mode)
                                    params.api.deselectAll();

                                    // Set this row as selected
                                    if (rowNode) {
                                        rowNode.setSelected(true);
                                    }


                                    showCampaignLevel([rowData]);
                                    moveToNextTab("2");
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {campaignName}
                            </span>
                        </Tooltip >
                        <Modal
                            title="Confirm Action"
                            width={isMobile ? "85%" : "50%"}
                            open={isCampaignModalVisibles}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            onOk={handlePauseOk}
                            onCancel={handlePauseCancel}
                            footer={[
                                <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                    <div>
                                        <Button key="cancel" onClick={handlePauseCancel} style={{ marginLeft: "4px", }}>
                                            Cancel
                                        </Button>
                                        <Button key="ok" onClick={handlePauseOk} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
                                            Ok
                                        </Button>
                                    </div>
                                </div>
                            ]}
                        >
                            <Spin spinning={statusLoading} >
                                <div style={{ fontSize: 12 }}>
                                    <p>
                                        Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this campaign?
                                    </p>
                                    <p>Campaign ID: {campaignid}</p>
                                    <p>Campaign Name: {campaignName}</p>
                                </div>
                            </Spin>

                        </Modal>
                        <Modal
                            title={
                                campaignName
                            }
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            open={isModalVisibles}
                            onOk={handleOks} // Default Ok button functionality
                            onCancel={handleCancels} // Default Cancel button functionality
                            footer={[
                                <div key="footer" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ display: 'flex', flexDirection: "column" }}>
                                        <span key="info" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
                                            Last Edited Time:
                                        </span>
                                        <span key="info1" style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black", }}>
                                            {universalOject?.editedTime || ""}
                                        </span>

                                    </div>
                                    <div>
                                        <Button
                                            key="delete"
                                            type="danger"
                                            onClick={handleDelete}
                                            style={{ marginRight: 'auto', border: "1px solid #e3e3da" }} // Push Delete button to the far left
                                        >
                                            Delete
                                        </Button>
                                        <Button key="cancel" onClick={handleCancels} style={{ marginLeft: "4px" }}>
                                            Cancel
                                        </Button>
                                        <Button key="ok" onClick={handleOks} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
                                            Ok
                                        </Button>
                                    </div>
                                </div>
                            ]}
                        >
                            <Spin spinning={modalLoading}>
                                <Input.TextArea
                                    placeholder="Enter your comments here"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    style={{ color: theme === "dark" ? "white" : "black" }}
                                />
                            </Spin>
                        </Modal>
                        <Modal
                            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                            open={creativeModalOpen}
                            onCancel={() => {
                                setCreativeModalOpen(false);
                                setSelectedCampaignCreatives([]);
                            }}
                            footer={null}
                            width={350}
                            closable
                            styles={{
                                body: {
                                    padding: 0,
                                    background: theme === "dark" ? "#18191a" : "#fff",
                                    overflowY: "auto",
                                    maxHeight: "85vh",
                                }
                            }}
                            // bodyStyle={{
                            //     padding: 0,
                            //     background: theme === "dark" ? "#18191a" : "#fff",
                            //     overflowY: "auto",
                            //     maxHeight: "85vh",
                            // }}
                            style={{ top: 15 }}
                        >
                            {selectedCampaignCreatives.map((selectedCreative, idx) => (
                                <div key={idx}>


                                    <div style={{ padding: "8px 10px" }}>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            {/* <img
                                                src={selectedCreative.image}
                                                alt="page"
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            /> */}
                                            <CreativeAvatar
                                                url={selectedCreative.image}
                                                filetype={selectedCreative.filetype}
                                            />
                                            <div style={{ flex: 1, marginLeft: 6 }}>
                                                <div style={{ display: "flex" }}>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 10,
                                                            color: theme === "dark" ? "#e4e6eb" : "#050505",
                                                        }}
                                                    >
                                                        {selectedCreative.adName || "-"}
                                                    </div>
                                                    <div>
                                                        {idx === 0 && adLevelCreatives.length > 0 && (
                                                            <EditOutlined
                                                                style={{ cursor: "pointer", marginLeft: 8 }}
                                                                onClick={() => {
                                                                    const campaign = adLevelCreatives[0];

                                                                    const href = `/Campaigns?campaignId=${currentCampaignId}&account=${currentAccount}&network=${newRevenuePratner}`;
                                                                    window.open(href, "_blank", "noopener,noreferrer");
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: theme === "dark" ? "#b0b3b8" : "#65676b",
                                                    }}
                                                >
                                                    Sponsored <GlobalOutlined />
                                                </div>
                                            </div>
                                        </div>

                                        {selectedCreative.message && (
                                            <div
                                                style={{
                                                    marginTop: 2,
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#e4e6eb" : "#050505",
                                                }}
                                            >
                                                {selectedCreative.message}
                                            </div>
                                        )}
                                    </div>
                                    {/* <img
                                        src={selectedCreative.image}
                                        alt="creative"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                     */}
                                    <CreativeMedia
                                        url={selectedCreative.image}
                                        filetype={selectedCreative.filetype}
                                    />
                                    <div style={{ padding: "8px 10px" }}>
                                        {selectedCreative.headline && (
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    fontWeight: 600,
                                                    color: theme === "dark" ? "#e4e6eb" : "#050505",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {selectedCreative.headline}
                                            </div>
                                        )}

                                        {selectedCreative.description && (
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#b0b3b8" : "#65676b",
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {selectedCreative.description}
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#b0b3b8" : "#525456",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {selectedCreative.websiteUrl
                                                    ? new URL(selectedCreative.websiteUrl).hostname
                                                    : "-"}
                                            </div>

                                            {selectedCreative.websiteUrl && (
                                                <a
                                                    href={selectedCreative.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    <div
                                                        style={{
                                                            padding: "5px 12px",
                                                            background: "#91C25F",
                                                            color: "#000",
                                                            borderRadius: 18,
                                                            fontSize: 8,
                                                            fontWeight: 600,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        Learn more
                                                    </div>
                                                </a>
                                            )}
                                        </div>

                                        {selectedCreative.websiteUrl && (
                                            <div
                                                style={{
                                                    marginTop: 2,
                                                    fontSize: 8,
                                                    color: theme === "dark" ? "#2e89ff" : "#1877f2",
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                <a
                                                    href={selectedCreative.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: theme === "dark" ? "#2e89ff" : "#1877f2",
                                                        textDecoration: "none",
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedCreative.websiteUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            borderTop: theme === "dark"
                                                ? "1px solid #3a3b3c"
                                                : "1px solid #ddd",
                                            display: "flex",
                                            justifyContent: "space-around",
                                            padding: "8px 0",
                                            fontSize: 10,
                                            color: theme === "dark" ? "#b0b3b8" : "#65676b",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <LikeOutlined style={{ marginRight: 5, fontSize: 12 }} />
                                            Like
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <CommentOutlined style={{ marginRight: 5, fontSize: 12 }} />
                                            Comment
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                                            <ShareAltOutlined style={{ marginRight: 5, fontSize: 12 }} />
                                            Share
                                        </div>
                                    </div>

                                    {idx < selectedCampaignCreatives.length - 1 && (
                                        <div
                                            style={{
                                                height: 8,
                                                background: theme === "dark" ? "#303031ff" : "#e0e2e3ff",
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </Modal>
                    </div >
                );
            }
        },
    }

    const creativesForCampaigns = async (campaignData, filtered) => {
        const uniqueCampaignIds = [
            ...new Set(
                campaignData.map(item => String(item.campaignid)).filter(Boolean)
            )
        ];
        const missingCampaignIds = uniqueCampaignIds.filter(
            campaignId =>
                !Camapignlevelstatus.some(
                    item => String(item.campaign_id) === campaignId
                )
        );
        const items = Object.entries(
            campaignData.reduce((acc, { accountNumber, campaignid }) => {
                (acc[accountNumber] ??= []).push(String(campaignid));
                return acc;
            }, {})
        ).map(([accountNumber, campaignIds]) => ({
            accountNumber,
            campaignIds
        }));
        if (missingCampaignIds.length > 0) {
            const getCampaignStatusAndComments = async () => {
                try {
                    const response = await axios.post('api/reports/campaignstatusandcomments', { items });
                    // const { data } = await axios.post('/api/reports/creatives', { items })
                    // console.log(data, "data");
                    const { creatives, campaignStatus, campaignComments } = response?.data?.data;
                    setCamapignlevelstatus(campaignStatus);
                    setCampaignComments(campaignComments);
                    setAdLevelCreatives(creatives);
                } catch (error) {
                    console.error("Error fetching campaign status and comments:", error);
                }
            };
            await getCampaignStatusAndComments();
            setDataLoader(true);
            setCampainData(filtered)
        } else {
            setDataLoader(true);
            setCampainData(filtered)
            return;
        }

    }

    const functionCall1 = async (creativesForCampaigns) => {
        try {
            setDataLoader(false);
            const collectionName = updatedRevenuePartner === "FB_TonicRsoc" ? "Facebook_TonicRsoc_Keywords" : newtworkCollections[updatedRevenuePartner];
            // const accountsParam = Array.isArray(updatedAccountsValue) ? updatedAccountsValue.map(String) : [String(updatedAccountsValue)];
            // const params = new URLSearchParams({ dateStart: updatedStartDate,
            //     dateEnd: updatedEndDate,
            //     timezone: updatedTime,
            //     status: "Live",
            //     network: collectionName,
            // });
            // // accountsParam.forEach(acc => params.append("accountNumbers", acc));

            //   const resp = await apiClient.post(`/CampaignLevelAccounts?${params.toString()}`);
            // const fetchData = await axios.get(`api/reports/domain?start=${updatedStartDate}&end=${updatedEndDate}&accounts=${updatedAccountsValue}&time=${updatedTime}&network=${collectionName}`);
            // const resp = await axios.post('/api/reports/dayofhour', {
            //     dateStart: updatedStartDate,
            //     dateEnd: updatedEndDate,
            //     timezone: updatedTime,
            //     status: "Live",
            //     network: collectionName,
            //     accountNumbers: accountsParam,   // <= ['111', '222'] or ['111'] for single
            // });
            const resp = await axios.get(`api/reports/keywordreports?start=${updatedStartDate}&end=${updatedEndDate}&accounts=${updatedAccountsValue}&time=${updatedTime}&network=${collectionName}`);


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
                    const category = campaignComments.find(campaign => campaign.campaignid === eachData.campaign_id && campaign.Account === eachData.accountNumber && campaign.level === "campaign");
                    const campaign_date = Camapignlevelstatus.find(campaign => campaign.campaign_id === eachData.campaign_id && campaign.accountNumber === eachData.accountNumber);
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
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
                        keyword: eachData.keyword
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
            // console.log(filteredData, "filteredData");
            // setCampainData(filteredData);
            campaignDataRef.current = filteredData;
            let filtered = [];
            if (searchValue || insideInput) {
                filtered = filteredData || [];

                const normalizedInput = (searchValue || "").trim().toLowerCase();
                const normalizedInside = insideInput.trim().toLowerCase();

                // 1️⃣ FIRST FILTER → by inputValue (only adname)
                if (normalizedInput) {
                    filtered = filtered.filter((each) => {
                        const campaignname = (each?.campaignname || "").trim().toLowerCase();
                        const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                        const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();
                        return (
                            campaignname.includes(normalizedInput) || campaignId.includes(normalizedInput) || accountNumber.includes(normalizedInput)
                        );
                    });
                }

                // 2️⃣ SECOND FILTER → by insideInput (all fields)
                if (normalizedInside) {
                    filtered = filtered.filter((each) => {
                        const campaignname = (each?.campaignname || "").trim().toLowerCase();
                        const accountNumber = (each?.accountNumber || "").toString().trim().toLowerCase();
                        const campaignId = (each?.campaignid || "").toString().trim().toLowerCase();

                        return (
                            campaignname.includes(normalizedInside) ||
                            accountNumber.includes(normalizedInside) ||
                            campaignId.includes(normalizedInside)
                            // adsetId.includes(normalizedInside) ||
                            // adId.includes(normalizedInside)
                        );
                    });
                }

                // setCampainData(filtered);
            }
            else {

                filtered = (filteredData);
            }
            await creativesForCampaigns(filteredData, filtered)
            // setLoading(false);

        } catch (error) {
            console.log(error)
            setDataLoader(true);
            setCampainData([]);
            // setApiStatus(true);
            // setLoading(false);
        }
    };
    const KeywordCellRenderer = ({ params }) => {
        const keyword = params.value;
        const adId = params.data?.adId;
        const shouldAllowKeywordCopy = updatedRevenuePartner === "FB_Tonic1" || updatedRevenuePartner === "FB_TonicRsoc";
        const handleCopy = () => {
            const textToCopy = shouldAllowKeywordCopy ? keyword : adId;
            navigator.clipboard
                .writeText(textToCopy)
                .then(() => { message.success("Copied to clipboard"); })
                .catch(() => { message.error("Failed to copy"); });
        };
        return (
            <span style={{ cursor: 'pointer' }} onClick={handleCopy} >
                {keyword}
            </span>
        );
    };

    const columnDefsObject = useMemo(() => {
        const allColumns = columnDefsObjectForCampaign({
            theme, userdetails, Camapignlevelstatus, setCamapignlevelstatus, campaignComments, setCampaignComments, commentsMap,
            campaignMap, allProfitLossArray, setHistoryOpen, setSelectedCampaignIdForHistory, setSelectedAccountForHistory, apiClient,
            message,
        });
        const existingColumns = [
            {
                headerName: 'Keywords', field: 'keyword', sortable: true, filter: 'agTextColumnFilter', resizable: true, width: 300,
                cellStyle: { textAlign: 'left' }, cellRenderer: (params) => <KeywordCellRenderer params={params} />,
            },
            ...userColumnStructure.map(key => allColumns[key]).filter(Boolean)
        ];

        return [...existingColumns, ...customColumns];
    }, [theme, userdetails, Camapignlevelstatus, campaignComments, allProfitLossArray, userColumnStructure, customColumns]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: {
            textAlign: "center",
            fontSize: "12px",
        },
        // floatingFilter: true,
    }), []);
    useEffect(() => {
        if (activeTab !== "4") {
            return;
        }

        const currentKey = JSON.stringify({
            accounts: updatedAccountsValue,
            startDate: updatedStartDate,
            endDate: updatedEndDate,
            time: updatedTime,
            refreshTabs: refreshTabs
        });

        if (lastCampaignFetch.current === currentKey) {
            return;
        }

        lastCampaignFetch.current = currentKey;

        setLoading(true);
        setDataLoader(false);
        functionCall1(creativesForCampaigns);
    }, [activeTab, activeTabForLiveReports, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, refreshTabs]);

    useEffect(() => {
        const map = new Map(
            Camapignlevelstatus.map(item => {
                const daily =
                    Number(item.campaign_budget?.daily_budget || 0) > 0 ||
                    item.adsets?.some(a => Number(a.budget?.daily_budget || 0) > 0);

                const lifetime =
                    Number(item.campaign_budget?.lifetime_budget || 0) > 0 ||
                    item.adsets?.some(a => Number(a.budget?.lifetime_budget || 0) > 0);

                return [
                    String(item.campaign_id),
                    { status: item.status?.toUpperCase(), daily, lifetime }
                ];
            })
        );

        let filtered = (campaignDataRef.current || []).filter(row => {
            const c = map.get(String(row.campaignid));

            if (campaignStatusFilter !== "All" && c?.status !== campaignStatusFilter.toUpperCase())
                return false;

            if (typeFilter === "Daily" && !c?.daily) return false;
            if (typeFilter === "Lifetime" && !c?.lifetime) return false;

            return true;
        });

        const input = (searchValue || "").trim().toLowerCase();
        const inside = (insideInput || "").trim().toLowerCase();

        if (input) {
            filtered = filtered.filter(row => {
                const name = String(row?.campaignname || "").trim().toLowerCase();
                const account = String(row?.accountNumber || "").trim().toLowerCase();
                const id = String(row?.campaignid || "").trim().toLowerCase();

                return name.includes(input) || id.includes(input) || account.includes(input);
            });
        }

        if (inside) {
            filtered = filtered.filter(row => {
                const name = String(row?.campaignname || "").trim().toLowerCase();
                const account = String(row?.accountNumber || "").trim().toLowerCase();
                const id = String(row?.campaignid || "").trim().toLowerCase();

                return name.includes(inside) || account.includes(inside) || id.includes(inside);
            });
        }

        setCampainData(filtered);
    }, [campaignStatusFilter, typeFilter, searchValue, insideInput]);
    const gridOptions = useMemo(() => ({
        defaultColDef: {
            suppressMenu: true,
            headerClass: "custom-header" // Apply to all columns by default
        },
        ensureDomOrder: false
    }), []);
    const uniqueByCampaignId = (arr) => {
        const map = new Map();
        arr.forEach(obj => {
            if (!map.has(obj.campaignid)) {
                map.set(obj.campaignid, obj);
            }
        });
        return Array.from(map.values());
    };
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        // Don't overwrite the existing selection during grid refresh
        if (!selectedNodes.length) {
            return;
        }
        const selectedData = selectedNodes.map(node => node.data);

        // Store selection persistently


        // Keep your existing functionality
        // showCampaignLevel(uniqueByCampaignId(selectedData));
        const leafCampaignsData = selectedNodes
            .filter(node => !node.group && node.data)
            .map(node => ({
                campaignid: node.data.campaignid,
                campaignname: node.data.campaignname,
                accountNumber: node.data.accountNumber,
                fbStatus: node.data.fbStatus,
                category: node.data.category,
                level: "campaign",
            }))
            .filter(item => item.campaignid && item.campaignname);


        const uniqueLeafCampaigns = Array.from(
            new Map(
                leafCampaignsData.map(item => [`${item.campaignid}_${item.accountNumber}`, item])
            ).values()
        );


        // setLeafCampaigns(uniqueLeafCampaigns);

        // console.log(" Selected unique campaigns:", uniqueLeafCampaigns);
    };
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
            <div style={{ display: loading ? "none" : "block" }}>
                {/* <TableConfig
                    userData={userData}
                    theme={theme}
                    updatedRevenuePartner={updatedRevenuePartner}
                    updatedAccountsValue={updatedAccountsValue}
                    updatedTime={updatedTime}
                    fbCron={fbCron}
                    cronStatus={cronStatus}
                    revenueCron={revenueCron}
                    leafCampaigns={leafCampaigns}
                    insideInput={insideInput}
                    setInsideInput={setInsideInput}
                    setCampaignStatusFilter={setCampaignStatusFilter}
                    campaignStatusFilter={campaignStatusFilter}
                    setTypeFilter={setTypeFilter}
                    typeFilter={typeFilter}
                    onBtExport={onBtExport}
                    maxHour={maxHour}
                    maxNetworkHour={maxNetworkHour}
                    tab="Live"
                    tabLevel="campaigns"
                // latestHour={latestHour}
                // selectedHour={selectedHour}
                // setSelectedHour={setSelectedHour}
                // tableLoading={tableLoading}
                // setTableLoading={setTableLoading}
                /> */}
                <div
                    className={theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz"}
                    style={{
                        height: 375,
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
                                return (params.node.childrenAfterGroup?.[0]?.data?.campaignname ?? params.node.key);
                            }
                            return params.value;
                        }}
                        gridOptions={gridOptions}
                        setLoading={setLoading}
                        updatePinnedBottomRow={updatePinnedBottomRow}
                        onSelectionChanged={onSelectionChanged}
                        ref={gridRef}
                        onGridReady={onGridReady}
                        onColumnMoved={onColumnMoved}
                    />
                </div>
            </div>

            <CampaignHistoryModal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                campaignId={selectedCampaignIdForHistory}
                accountNumber={selectedAccountForHistory}
                adAccounts={userData}
            />

        </div>

    );
}