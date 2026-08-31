"use client"
import React from 'react';
import axios from 'axios';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import moment from 'moment-timezone';
import { Spin, Row, Col, Select, Input, Button, Modal, message, Switch, Tooltip, Skeleton, } from 'antd';
import { ReloadOutlined, EditOutlined, BarChartOutlined, DollarOutlined } from '@ant-design/icons';
import { columnDefsObjectCampaign } from "../columndefs/page";
import GridLoading from "@/components/common/skeletonloading";
import ReusableAgGrid from "@/components/reportshistory/insights"
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import "@/lib/agGridSetup";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { sanitizeNumericValue, computeRPC, computeCPCLC, computeCPL, computeNCPL, computeMargin, computeFMargin, computeROI, computeCTR, computeAggregatedRPC, computeAggregatedCPCLC, computeAggregatedNCPL, computeAggregatedCPL, computeAggregatedMargin, computeAggregatedFMargin, computeAggregatedROI, computeAggregatedCTR, cpcSpender1, customAggFunc } from "../columndefs/functions/customcolumn";
const datasetColorMap = {
    Spend: 'rgba(75, 192, 192, 1)', Revenue: 'rgba(54, 162, 235, 1)', RPC: 'rgba(255, 99, 132, 1)',
    CPL: 'rgba(255, 159, 64, 1)', Profit: 'rgba(255, 206, 86, 1)', Margin: 'rgba(153, 102, 255, 1)',
};
export default function AdsetTable({ account, adset_id, timezone, collection, userdetails, theme }) {
    const [historyColumns, setHistoryColumns] = useState([]);
    const [comments, setComments] = useState({});
    const [budgetObject, setBudgetObject] = useState({})
    const [campaignData, setCampaignData] = useState([]);
    const [bidAmount, setBidAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [dataLoader, setDataLoader] = useState(false);
    const [showTables, setShowTables] = useState(false);
    const [chartData, setChartData] = useState({ dates: [], spend: [], revenue: [], profit: [], margin: [] });
    const [isGraphVisible, setIsGraphVisible] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCampaignModalVisibles, setIsCampaignModalVisibles] = useState(false);
    const [nextChecked, setNextChecked] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [changeBudget, setChangeBudget] = useState("");
    const [comment, setComment] = useState("");
    const [isModalVisibles, setIsModalVisibles] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedValue, setSelectedValue] = useState("All");
    const [hiddenKeys, setHiddenKeys] = useState([
        'Spend', 'Revenue', 'RPC', 'CPL', 'Margin', // ❌ Only "Profit" shown by default
    ]);
    const [rpcTableType, setRpcTableType] = useState("top5");
    const [marginTableType, setMarginTableType] = useState("top5");
    const campaignDataRef = useRef([]);
    const gridRef = useRef();
    const campaignNameRef = useRef("");
    //Custom Column
    const [customColumns, setCustomColumns] = useState([]);
    const [newColumnName, setNewColumnName] = useState("");
    const [formula, setFormula] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    //custom column
    const columnDefs = useMemo(() => {
        const allColumns = columnDefsObjectCampaign;
        const existingColumns = historyColumns.map(key => allColumns[key]).filter(Boolean);
        return [...existingColumns, ...customColumns];
    }, [historyColumns, customColumns])

    const handleOkCustomColumn = () => {
        if (!newColumnName || !formula) {
            message.error("Please fill in all fields.");
            return;
        }
        const lowerCaseFormula = formula.toLowerCase();
        const field = newColumnName.trim().toLowerCase();
        if (customColumns.some(col => col.field === field)) {
            message.error("Column already exists.");
            return;
        }
        const newColumnDef = {
            headerName: newColumnName,
            field,
            isCustom: true,
            valueGetter: (params) => {
                if (params.node.group && params.node.aggData) {
                    return (sanitizeNumericValue(params.node.aggData[field]) || 0);
                }
                const data = params.data;
                if (!data) { return 0; }
                try {
                    const values = { ...data };

                    if (lowerCaseFormula.includes("margin")) {
                        values.margin = computeMargin(data);
                    }
                    if (lowerCaseFormula.includes("fmargin")) {
                        values.fmargin = computeFMargin(data);
                    }
                    if (lowerCaseFormula.includes("cpclinkclikcs")) {
                        values.cpclinkclicks = computeCPCLC(data);
                    }
                    if (lowerCaseFormula.includes("roi")) {
                        values.roi = computeROI(data);
                    }
                    if (lowerCaseFormula.includes("ctr")) {
                        values.ctr = computeCTR(data);
                    }
                    if (lowerCaseFormula.includes("rpc")) {
                        values.rpc = computeRPC(data);
                    }
                    if (lowerCaseFormula.includes("cpc")) {
                        values.cpc = sanitizeNumericValue(data.cpc);
                    }
                    if (lowerCaseFormula.includes("cpl")) {
                        values.cpl = computeCPL(data);
                    }
                    if (lowerCaseFormula.includes("ncpl")) {
                        values.ncpl = computeNCPL(data);
                    }

                    const originalKeys = Object.keys(values);
                    const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, "_"));
                    const keyMapping = {};
                    sanitizedKeys.forEach((key, index) => { keyMapping[key] = originalKeys[index]; });
                    const sanitizedValues = sanitizedKeys.map(key => sanitizeNumericValue(values[keyMapping[key]]));
                    const safeFormula = lowerCaseFormula.replace(/\/(\s*)0/g, "/(0 === 0 ? 1 : 0)");
                    const func = new Function(...sanitizedKeys, `return ${safeFormula}`);
                    const result = func(...sanitizedValues);
                    return (isNaN(result) || !isFinite(result)) ? 0 : Number(result.toFixed(2));
                }
                catch (error) {
                    console.error("Error evaluating formula:", error);
                    return 0;
                }
            },
            sortable: true,
            filter: true,
            aggFunc: (params) => params.rowNode.group ? customAggFunc(params, lowerCaseFormula) : null,
            cellStyle: { backgroundColor: "skyblue" },
            headerCellStyle: { backgroundColor: "skyblue", color: "black" },
            headerTooltip: formula
        };

        setCustomColumns(prev => [...prev, newColumnDef]);
        setNewColumnName("");
        setFormula("");
        setIsModalOpen(false);
    };
    const handleCancel = () => { setIsModalOpen(false); };
    const showModal = () => { setIsModalOpen(true); };
    const getMainMenuItems = (params) => {
        const defaultItems = params.defaultItems.slice();
        const resetColumnsItemIndex = defaultItems.findIndex(item => item === "resetColumns");

        if (resetColumnsItemIndex > -1) {

            defaultItems[resetColumnsItemIndex] = {
                name: "Reset Columns (Custom)",
                action: () => { handleColumnMove(columnStructure); },
                cssClasses: ["custom-reset-columns-item"]
            };

            defaultItems.splice(
                resetColumnsItemIndex + 1,
                0,
                {
                    name: "Add New Column",
                    action: showModal,
                    cssClasses: ["custom-new-item-history"]
                }
            );
        }

        return defaultItems;
    };

    const getCampaignData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/reportshistory/daily/adset?accountNumber=${account}&timezone=${timezone}&network=${collection}&AdsetId=${adset_id}`)
            const responseData = response.data;
            setComments(responseData?.comments || {});
            setComment(responseData?.comments?.comment || "")
            setBudgetObject(responseData?.statusandbudget);
            setChangeBudget(responseData?.statusandbudget?.budget?.budget_amount ? responseData?.statusandbudget?.budget?.budget_amount / 100 : null);
            setBidAmount(responseData?.statusandbudget?.bid_amount ? (responseData?.statusandbudget?.bid_amount / 100) : null);
            setHistoryColumns(responseData?.columns);
            const specifiedTimeZone = `${timezone}Date`;
            const mainData = responseData?.data;
            const filteredData = mainData && mainData.length > 0 ?
                mainData.map(eachData => {
                    const Revenue = eachData.estimated_revenue !== undefined ? (eachData.estimated_revenue) : 0;
                    const profit = Math.round((Revenue - eachData.spend) * 100) / 100;
                    const margin = Revenue !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.estimated_revenue) * 100) * 100) / 100}%` : '0%'
                    let rpc = eachData.conversions !== 0 ? (Math.round((Revenue / eachData.conversions) * 100) / 100) : 0;
                    const revenue = ((eachData.estimated_revenue - eachData.spend) / (eachData.fbLeads * rpc)) * 100;
                    let fMargin = revenue !== 0 ? Math.round(((profit / revenue) * 100) * 100) / 100 : 0;
                    const cpl = eachData.fbLeads !== 0 ? Math.round((eachData.spend / eachData.fbLeads) * 100) / 100 : 0;
                    let ncpl = eachData.conversions !== 0 ? Math.round((eachData.spend / eachData.conversions) * 100) / 100 : 0;
                    const roi = eachData.spend !== 0 ? `${Math.round((((Revenue - eachData.spend) / eachData.spend) * 100) * 100) / 100}%` : '0%';
                    const ctr = eachData.impressions !== 0 ? `${Math.round(((eachData.fbClicks / eachData.impressions) * 100) * 100) / 100}%` : '0%';
                    const mainRvenue = ((Math.round(Revenue * 100) / 100)).toString();
                    const conversions = eachData.conversions !== undefined && eachData.conversions !== null ? eachData.conversions : '0';
                    // console.log(conversions, "conversions");
                    rpc = !isNaN(rpc) ? rpc : 0;
                    ncpl = !isNaN(ncpl) ? ncpl : 0;
                    fMargin = !isNaN(fMargin) ? `${fMargin}%` : '0%';
                    const fbLClicks = parseInt(eachData.fbLinkClicks, 10);
                    const spend = parseFloat(eachData.spend);
                    const cpcLinkClicks = isNaN(fbLClicks) || fbLClicks === 0 ? 0 : Math.round((spend / fbLClicks) * 100) / 100;
                    return (
                        {
                            campaignName: eachData.campaign_name,
                            date: eachData[specifiedTimeZone],
                            hour_f: eachData[specifiedTimeZone],
                            hour_n: eachData[specifiedTimeZone],
                            date_f: eachData[specifiedTimeZone],
                            date_n: eachData[specifiedTimeZone],
                            adsetname: eachData.adsetName,
                            adname: "",
                            spend: (eachData.spend).toString(),
                            revenue: mainRvenue,
                            profit: profit.toString(),
                            margin: margin,
                            rpc: rpc.toString(),
                            cpl: cpl.toString(),
                            ncpl: ncpl.toString(),
                            roi: roi,
                            cpc: (eachData.cpc).toString(),
                            cpclinkclicks: cpcLinkClicks.toString(),
                            fbleads: (eachData.fbLeads).toString(),
                            // filterarion: eachData.fbLeads && parseInt((eachData.fbLeads)) !==0 ? (((parseInt(eachData.fbLeads)-parseInt(eachData.conversions))/parseInt(eachData.fbLeads))*100).toString(2) : 0,
                            filteration: parseInt(eachData.fbLeads) !== 0 ? Math.round((((parseInt(eachData.fbLeads) - parseInt(eachData.conversions)) / parseInt(eachData.fbLeads)) * 100) * 100) / 100 : 0,
                            fbclicks: (eachData.fbClicks).toString(),
                            fblinkclicks: (eachData.fbLinkClicks).toString(),
                            impressions: (eachData.impressions).toString(),
                            conversions: conversions.toString(),
                            fmargin: fMargin,
                            ctr: ctr,
                            adsetId: eachData.adset_id,
                            campaignId: eachData.campaign_id,
                            M_tq: "",
                            D_tq: "",
                        }
                    )
                })
                : null;
            campaignNameRef.current = filteredData[0].campaignname;
            setDataLoader(true);
            campaignDataRef.current = filteredData;
            setCampaignData(filteredData);
            const newFilterData = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
            const dates = newFilterData.map(d => d.date);
            const spend = newFilterData.map(d => d.spend);
            const revenue = newFilterData.map(d => d.revenue);
            const profit = newFilterData.map(d => d.profit);
            const rpc = newFilterData.map(d => d.rpc);
            const cpl = newFilterData.map(d => d.cpl);

            const margin = newFilterData.map(d => parseFloat(d.margin));

            setChartData({ dates, spend, revenue, profit, margin, rpc, cpl });
        } catch (error) {
            setLoading(true);
            console.error(error);
        }
    }
    const defaultComparator = (valueA, valueB) => {
        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return -1;
        if (valueB == null) return 1;

        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return valueA.localeCompare(valueB);
    };

    const defaultColDef = useMemo(() => ({
        comparator: defaultComparator,
        sortable: true,
        filter: true,
    }), []);

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

            api.refreshCells({ rowNodes: [pinnedNode], force: true, });

            return;
        }

        const t = calculateTotals(rows);
        const rpc = t.conversions ? t.revenue / t.conversions : 0;
        const revenue = rpc * t.fbleads;

        const row = {
            spend: Number(t.spend).toFixed(2) || 0,
            revenue: Number(t.revenue).toFixed(2) || 0,
            profit: Number(t.profit).toFixed(2) || 0,
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
            date: "Total"
        };

        Object.assign(pinnedNode.data, row);

        api.refreshCells({
            rowNodes: [pinnedNode],
            force: true,
        });
    };
    const toggleLegend = (label) => {
        setHiddenKeys(prev =>
            prev.includes(label) ? prev.filter(k => k !== label) : [...prev, label]
        );
    };
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    const colorMap = {};
    const getColorForValue = (value) => {
        if (!colorMap[value]) {
            colorMap[value] = getRandomColor(); // Generate and assign a color
        }
        return colorMap[value]; // Return the assigned color
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(budgetObject.adset_name).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500); // Reset after 1.5 seconds
        });
    };

    const handleOks = async () => {
        try {
            setConfirmLoading(true)
            if (typeof comment === 'string' && comment.trim() !== '') {
                const payloadForActivity = {
                    editType: "Comment",
                    adsetid: adset_id,
                    campaignid: budgetObject?.campaign_id,
                    Account: account,    // ✅ update *this* row’s account
                    adsetname: budgetObject?.adset_name,
                    campaignname: budgetObject?.campaign_name,
                    updatedBy: userdetails?.username,
                    updatedUserEmail: userdetails?.email,
                    updateType: "Campaign comment updated",
                    updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                }
                const response = await axios.post('/api/reportshistory/comment/createandupdate', {
                    accountNumber: account,
                    adsetname: budgetObject?.adset_name,
                    campaignname: budgetObject?.campaign_name,
                    adsetid: adset_id,
                    campaignid: budgetObject?.campaign_id,
                    comment: comment,
                    usercommit: userdetails?.email,
                    level: "adset",
                    activity: payloadForActivity
                });
                if (response.status === 200 || response.status === 201) {
                    setComment(comment);
                    setComments(prev => ({ ...prev, comment: comment, usercommit: userdetails?.email }));
                    message.success("Comment saved!");
                    setIsModalVisibles(false);
                }
            }
            setConfirmLoading(false);
        } catch (error) {
            setConfirmLoading(false);
            console.error('Error while submitting comment:', error);
            message.error("Error while submitting the comment.");
        }
    };

    const handleDelete = async () => {
        try {
            setConfirmLoading(true)
            const payloadForActivity = {
                editType: "Comment",
                campaignid: budgetObject?.campaign_id,
                adsetid: budgetObject?.adset_id,
                Account: account,    // ✅ update *this* row’s account
                campaignname: budgetObject?.campaign_name,
                updatedBy: userdetails?.username,
                updatedUserEmail: userdetails?.email,
                updateType: "Campaign comment cleared",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
            }
            const payload = {
                accountNumber: account,
                campaignname: budgetObject?.campaign_name,
                campaignid: budgetObject?.campaign_id,
                adsetid: budgetObject?.adset_id,
                comment: comment,
                usercommit: userdetails?.email,
                level: "adset",
                activity: payloadForActivity
            };
            // console.log(payload);

            // Call the backend API to delete the comment
            const response = await axios.post('/api/reportshistory/comment/delete', payload);

            if (response.status === 200) {
                if (comments?.comment) {
                    setComments(prev => ({ ...prev, comment: "", editedTime: "" }));
                }
                else {
                    setComments(prev => ({ ...prev }));
                }
                setComment(""); // clear comment in UI

                message.success('Comment deleted successfully!');
                setIsModalVisibles(false); // Close the popup
            } else {
                message.error('Failed to delete the comment. Please try again.-1');
            }
            setConfirmLoading(false);
        } catch (error) {
            setConfirmLoading(false);
            console.error('Error deleting the comment:', error);
            message.error('Failed to delete the comment. Please try again.');
        }
    };


    const handleCancels = () => setIsModalVisibles(false);

    const handleReload = async () => { await getCampaignData(); }

    const handleChange = (value) => { setSelectedValue(value); };

    const dateOptions = [
        "All",
        "Today",
        "Yesterday",
        "Last 7 Days",
        "Last 15 Days",
        "Last 20 Days",
        "Last 25 Days",
        "Last 30 Days",
        "Last 60 Days",
        "Last 90 Days",
        "This Month",
        "Last Month",
    ];

    const onChangeBudget = (value) => { setChangeBudget(value); };

    const handleOk = async () => {
        // setConfirmLoading(true);
        // const currentBudget = budgetObject?.budget?.budget_amount;
        // const campaignId = budgetObject?.campaign_id;
        // const budgetType = budgetObject?.budget?.budgetType || "unknown";

        // const payloadForActivity = {
        //     editType: "Budget",
        //     level: "campaign",
        //     campaignid: campaignId,
        //     Account: String(account),
        //     campaignname: budgetObject?.campaign_name,
        //     updatedBy: userdetails?.userame,
        //     updatedUserEmail: userdetails?.email,
        //     updateType: "Campaign budget updated",
        //     updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
        //     updateDetail: `From $${Number(currentBudget) / 100} to $${Number(changeBudget)}`,
        //     budgetType
        // };
        // const payload = {
        //     campaignId,
        //     budget: Math.round(Number(changeBudget) * 100),
        //     accountNumber: String(account),
        //     campaignname: budgetObject?.campaign_name,
        //     updatedby: userdetails?.email,
        //     budgetType,
        //     activity: payloadForActivity,
        // };

        // if (!payload.campaignId || !payload.accountNumber) {
        //     message.error("Campaign ID missing");
        //     setConfirmLoading(false);
        //     return;
        // }
        // try {
        //     await axios.post('/api/reportshistory/budget/adset', payload);
        //     message.success("Campaign Budget Updated Successfully");
        //     setBudgetObject((prev) => ({
        //         ...prev,
        //         budget: {
        //             ...prev?.budget,
        //             budget_amount: String(Math.round(Number(changeBudget) * 100))
        //         }
        //     }));
        //     setConfirmLoading(false);
        //     setIsBudgetModalVisible(false);

        // } catch (err) {

        //     setConfirmLoading(false);
        //     // setIsBudgetModalVisible(false);
        //     message.error("Failed to update budget");
        // }
        // const campaignname = CampaignName;
        const adsetname = budgetObject?.adset_name;

        // const selectedAdset =
        //     budgetAndStatusData?.selected_adset;

        const currentBudget =
            budgetObject?.budget?.budget_amount || 0;

        const currentBidAmount =
            budgetObject?.bid_amount || 0;

        const budgetType = budgetObject?.budget?.budgetType || "unknown";

        const bidAmountValue = Math.round(parseFloat(bidAmount || 0) * 100);

        const changeBudgetValue = Math.round(parseFloat(changeBudget || 0) * 100);

        const payload = {
            adsetId: adset_id,
            campaignId: budgetObject?.campaign_id,
            accountNumber: account,
            adsetname: budgetObject?.adset_name,
            updatedby: userdetails?.email,
            budgetType,
        };

        // ✅ Budget Change
        if (changeBudget !== undefined && changeBudget !== '' && !isNaN(changeBudget) && parseFloat(changeBudget) > 0 &&
            changeBudgetValue !== Number(currentBudget)) {

            payload.budget = changeBudgetValue;

            payload.activity = {
                editType: "Budget",
                campaignid: budgetObject?.campaign_id,
                adsetid: adset_id,
                Account: String(account),
                adsetname: budgetObject?.adset_name,
                updatedBy: userdetails?.username,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset budget updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                updateDetail: `From $${Number(currentBudget) / 100} to $${Number(changeBudget)}`,
                budgetType
            };
        }

        // ✅ Bid Change
        if (bidAmount !== undefined && bidAmount !== '' && !isNaN(bidAmount) && parseFloat(bidAmount) >= 0 &&
            bidAmountValue !== Number(currentBidAmount)) {
            payload.bidAmount = bidAmountValue;
            payload.bidactivity = {
                editType: "Bid",
                campaignid: budgetObject?.campaign_id,
                adsetid: adset_id,
                Account: String(account),
                campaignname: budgetObject?.campaign_name,
                adsetname: budgetObject?.adset_name,
                updatedBy: userdetails?.username,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset bid strategy updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                updateDetail: `From $${Number(currentBidAmount) / 100} to $${Number(bidAmount)}`,
            };
        }

        const hasBudget = Object.prototype.hasOwnProperty.call(payload, 'budget');

        const hasBidAmount = Object.prototype.hasOwnProperty.call(payload, 'bidAmount');

        if (!hasBudget && !hasBidAmount) {
            message.warning("Please change Budget and/or Bid Amount before submitting.");
            return;
        }

        try {
            setConfirmLoading(true);
            const newResponse = await axios.post('/api/reportshistory/budget/adset', payload);

            if (newResponse.status === 200 || newResponse.status === 201) {
                setBudgetObject((prev) => ({
                    ...prev,
                    budget: {
                        ...prev?.budget,
                        ...(payload.budget !== undefined && {
                            budget_amount: String(payload.budget)
                        }),
                    },
                    ...(payload.bidAmount !== undefined && {
                        bid_amount: payload.bidAmount
                    })
                }));

                message.success("Adset Budget and/or Bid Updated");

                setIsBudgetModalVisible(false);
            }

        } catch (err) {
            console.error(err);
            message.error("Failed to update adset");
        } finally { setConfirmLoading(false); }
    };

    const handlePauseCancel = () => {
        setIsCampaignModalVisibles(false);
    };

    const handlePauseOk = async () => {
        const desired = nextChecked;                  // true => ACTIVE, false => PAUSED
        setIsCampaignModalVisibles(true);
        setConfirmLoading(true);
        try {
            const payloadForActivity = {
                editType: "Status",
                campaignid: budgetObject?.campaign_id,       // cents
                adsetid: adset_id,
                Account: String(account),    // ✅ update *this* row’s account
                campaignname: budgetObject?.campaign_name,
                adsetname: budgetObject?.adset_name,
                updatedBy: userdetails?.username,
                updatedUserEmail: userdetails?.email,
                updateType: "Adset status updated",
                updateAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A"),
                updateDetail: `From ${desired ? "Inactive" : "Active"} to ${desired ? "Active" : "Inactive"}`,
            }
            const payload = {
                status: desired ? "ACTIVE" : "PAUSED",
                campaign_id: budgetObject?.campaign_id,
                adset_id: adset_id,
                accountNumber: String(account),
                name: budgetObject?.adset_name,
                email: userdetails?.email,
                activity: payloadForActivity,
            };

            const response = await axios.post(`/api/reportshistory/status/adset`, payload);

            const newStatus = desired ? "ACTIVE" : "PAUSED";

            if (response.status === 200 || response.status === 201) {
                setBudgetObject(prev => ({ ...prev, status: nextChecked ? "ACTIVE" : "PAUSED" }));
                setConfirmLoading(false);
                setIsCampaignModalVisibles(false);
            }
            message.success(`Adset ${newStatus.toLowerCase()}`);
        } catch (e) {
            setConfirmLoading(false);
            // setIsCampaignModalVisibles(false);
            message.error("Failed to update adset status");
        }
    };
    const onCellClicked = useCallback((params) => {
        if (params.column.getColId() === "campaignname" && params.value) {
            navigator.clipboard.writeText(params.value).then(() => {
                const originalValue = params.value;

                params.node.setDataValue(
                    "campaignname",
                    `${originalValue} Copied!`
                );

                setTimeout(() => {
                    params.node.setDataValue("campaignname", originalValue);
                }, 1500);
            }).catch(err => console.error("Copy failed:", err));
        }

        const cell = {
            rowIndex: params.node.rowIndex,
            colId: params.column.getColId()
        };

        if (params.event?.shiftKey || params.event?.ctrlKey) {
            setSelectedCells(prev => [...prev, cell]);
        } else {
            setFirstSelectedCell(cell);
            setSelectedCells([cell]);
        }
    }, []);
    // AG Grid options
    const gridOptions = useMemo(() => ({
        onCellClicked,
    }), [onCellClicked]);
    const getRowHeight = useCallback(() => 25, []);
    const onClickBarChart = () => {
        setIsGraphVisible(prev => !prev);
    }
    const onGridReady = ({ api }) => {
        gridRef.current = { api };
    };

    const handleColumnMove = async (newOrder) => {
        await axios.post(`/api/reportshistory/columnstructure/update`, { updateDataArray: newOrder });
    };

    const onColumnMoved = (params) => {
        if (!params.finished || params.source !== "uiColumnMoved") return;
        const columnOrder = params.api.getAllGridColumns()
            .filter((column) => column.getColId() !== "ag-Grid-AutoColumn").map((column) => column.getColId());
        handleColumnMove(columnOrder);
    };

    useEffect(() => { getCampaignData(); }, [])

    useEffect(() => {
        const campaignData = campaignDataRef.current;
        const today = moment();

        const dynamicDaysFilter = (data, days) =>
            data.filter((item) =>
                moment(item.date).isBetween(today.clone().subtract(days, "days"), today, undefined, "[]")
            );

        const filterLogic = {
            All: (data) => data,
            Today: (data) => data.filter((item) => item.date === today.format("YYYY-MM-DD")),
            Yesterday: (data) => data.filter((item) =>
                item.date === today.clone().subtract(1, "days").format("YYYY-MM-DD")
            ),
            "Last 7 Days": (data) => dynamicDaysFilter(data, 7),
            "Last 15 Days": (data) => dynamicDaysFilter(data, 15),
            "Last 20 Days": (data) => dynamicDaysFilter(data, 20),
            "Last 25 Days": (data) => dynamicDaysFilter(data, 25),
            "Last 30 Days": (data) => dynamicDaysFilter(data, 30),
            "Last 60 Days": (data) => dynamicDaysFilter(data, 60),
            "Last 90 Days": (data) => dynamicDaysFilter(data, 90),
            "This Month": (data) => data.filter((item) => moment(item.date).isSame(today, "month")),
            "Last Month": (data) =>
                data.filter((item) => moment(item.date).isSame(today.clone().subtract(1, "month"), "month")),
        };

        // Date filter
        let filtered = filterLogic[selectedValue] ? filterLogic[selectedValue](campaignData) : campaignData;

        // Search filter
        if (searchText.trim()) {
            const search = searchText.toLowerCase();

            filtered = filtered.filter((item) => Object.values(item).some((value) =>
                String(value ?? "").toLowerCase().includes(search))
            );
        }
        setCampaignData(filtered);
    }, [selectedValue, searchText]);
    const datasets = [
        {
            label: 'Spend',
            data: chartData?.spend?.map(Number) || [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 1)',
            hidden: hiddenKeys.includes('Spend'),
            tension: 0.3,
        },
        {
            label: 'Revenue',
            data: chartData?.revenue?.map(Number) || [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 1)',
            hidden: hiddenKeys.includes('Revenue'),
            tension: 0.3,
        },
        {
            label: 'RPC',
            data: chartData?.rpc?.map(Number) || [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 1)',
            hidden: hiddenKeys.includes('RPC'),
            tension: 0.3,
        },
        {
            label: 'CPL',
            data: chartData?.cpl?.map(Number) || [],
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 1)',
            hidden: hiddenKeys.includes('CPL'),
            tension: 0.3,
        },
        {
            label: 'Profit',
            data: chartData?.profit?.map(Number) || [],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 1)',
            hidden: hiddenKeys.includes('Profit'),
            tension: 0.3,
        },
        {
            label: 'Margin',
            data: chartData?.margin?.map(Number) || [],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 1)',
            hidden: hiddenKeys.includes('Margin'),
            tension: 0.3,
        },
    ];
    return (
        <div
            style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                minHeight: 0,
            }}
        >
            <Row style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                <Col style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>

                    <div style={{
                        width: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        height: '32px'
                    }}>
                        <p style={{ fontSize: 12, color: theme === "dark" ? "white" : "black" }}>Timezone: <span>{timezone}</span></p>
                    </div>

                    <Switch
                        size='small'
                        checked={showTables}
                        onChange={(checked) => setShowTables(checked)}
                        checkedChildren={
                            <span style={{ color: showTables ? "white" : theme === "dark" ? "black" : "white" }}>Tables</span>
                        }
                        unCheckedChildren={
                            <span style={{ color: showTables ? "white" : theme === "dark" ? "black" : "white" }}>Hide</span>
                        }
                        style={{
                            backgroundColor: showTables ? "#91c25f" : theme === "dark" ? "beige" : undefined,
                            minHeight: "18px",
                            textAlign: "center"
                        }}
                    />

                    <Button
                        size='small'
                        type="default"
                        icon={<BarChartOutlined />}
                        onClick={onClickBarChart}
                        checked={isGraphVisible}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        style={{
                            border: '2px solid #91C25F',
                            color: theme === 'dark' ? '#fff' : (isGraphVisible || hovered ? '#fff' : '#555'),
                            backgroundColor: isGraphVisible || hovered ? '#91C25F' : 'transparent',
                            borderRadius: '18px',
                            fontWeight: 500,
                            // padding: '0 13px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease-in-out',
                            fontSize: 10
                        }}
                    >
                        Chart
                    </Button>

                </Col>
            </Row>
            {isGraphVisible &&
                <div
                    style={{
                        width: '100%',
                        borderRadius: 12,
                        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                        padding: 15,
                        height: 'auto',
                        boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.6)' : '0 1px 6px rgba(0,0,0,0.08)',
                    }}
                >

                    {/* Legend */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            marginBottom: '10px',
                        }}
                    >
                        {Object.keys(datasetColorMap).map(label => {
                            const isVisible = !hiddenKeys.includes(label);

                            return (
                                <div
                                    key={label}
                                    onClick={() => toggleLegend(label)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        gap: '6px',
                                        fontSize: '13px',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '4px',
                                            backgroundColor: datasetColorMap[label],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '11px',
                                        }}
                                    >
                                        {isVisible && '✓'}
                                    </div>

                                    <span>{label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Chart */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '350px',
                        }}
                    >
                        <Line
                            data={{
                                labels: chartData?.dates || [],
                                datasets,
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                    legend: {
                                        display: false,
                                    },

                                    tooltip: {
                                        mode: 'index',
                                        intersect: false,
                                    },
                                },

                                scales: {
                                    x: {
                                        ticks: {
                                            color: (context) => {
                                                const index = context.index;
                                                const label = chartData?.dates?.[index];
                                                return getColorForValue(label);
                                            },
                                        },
                                        grid: {
                                            color: theme === 'dark' ? '#444' : '#e0e0e0',
                                        },
                                    },

                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            callback: value => Number(value).toFixed(2),
                                        },
                                        grid: {
                                            color: theme === 'dark' ? '#444' : '#e0e0e0',
                                        },
                                    },
                                },
                            }}
                        />
                    </div>

                </div>
            }
            {showTables && (
                <Col
                    className="rpc-margin-container"
                    style={{
                        display: "flex",
                        width: "100%",
                        marginLeft: "5px",
                        alignItems: "flex-start",
                    }}
                >
                    <div
                        className="rpc-margin-card"
                        style={{
                            marginLeft: "0",
                            padding: "12px",
                            borderRadius: "6px",
                            border: theme === "dark"
                                ? "1px solid #3a3a3a"
                                : "1px solid #ddd",
                            backgroundColor: theme === "dark"
                                ? "#1f1f1f"
                                : "#f5f5f5",
                            boxSizing: "border-box",
                            overflow: "hidden",
                        }}
                    >
                        {/* Radio Buttons */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginBottom: "10px",
                                flexWrap: "wrap",
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "5px 8px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    color: theme === "dark" ? "#fff" : "#333",
                                    backgroundColor:
                                        rpcTableType === "top5"
                                            ? theme === "dark"
                                                ? "#333"
                                                : "#f0f0f0"
                                            : "transparent",
                                }}
                            >
                                <input
                                    type="radio"
                                    name="rpcTable"
                                    value="top5"
                                    checked={rpcTableType === "top5"}
                                    onChange={(e) => setRpcTableType(e.target.value)}
                                    style={{
                                        margin: 0,
                                        width: "12px",
                                        height: "12px",
                                        cursor: "pointer",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        border: "1px solid #91c25f",
                                        borderRadius: "50%",
                                        backgroundColor: "transparent",
                                        boxSizing: "border-box",
                                        backgroundImage:
                                            rpcTableType === "top5"
                                                ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                                : "none",
                                    }}
                                />
                                Top 5 RPC
                            </label>

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "5px 8px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    color: theme === "dark" ? "#fff" : "#333",
                                    backgroundColor:
                                        rpcTableType === "top5"
                                            ? theme === "dark"
                                                ? "#333"
                                                : "#f0f0f0"
                                            : "transparent",
                                }}
                            >
                                <input
                                    type="radio"
                                    name="rpcTable"
                                    value="last5"
                                    checked={rpcTableType === "last5"}
                                    onChange={(e) => setRpcTableType(e.target.value)}
                                    style={{
                                        margin: 0,
                                        width: "12px",
                                        height: "12px",
                                        cursor: "pointer",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        border: "1px solid #91c25f",
                                        borderRadius: "50%",
                                        backgroundColor: "transparent",
                                        boxSizing: "border-box",
                                        backgroundImage:
                                            rpcTableType === "last5"
                                                ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                                : "none",
                                    }}
                                />
                                Last 5 RPC
                            </label>
                        </div>

                        {/* RPC Table */}
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                fontSize: "11px",
                                overflow: "hidden",
                                borderRadius: "4px",
                                border: theme === "dark"
                                    ? "1px solid #444"
                                    : "1px solid #d9d9d9",
                            }}
                        >
                            <colgroup>
                                <col style={{ width: "1%" }} />
                                <col style={{ width: "1%" }} />
                                <col style={{ width: "1%" }} />
                            </colgroup>

                            <thead>
                                <tr>
                                    {["Date", "RPC", "WeekDay"].map((heading, columnIndex) => (
                                        <th
                                            key={heading}
                                            style={{
                                                padding: "7px 14px",
                                                textAlign: "left",
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                color: theme === "dark" ? "#fff" : "#333",

                                                backgroundColor:
                                                    theme === "dark"
                                                        ? "#2a2a2a"
                                                        : "#f5f5f5",

                                                borderBottom:
                                                    theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9",

                                                borderRight:
                                                    columnIndex < 2
                                                        ? theme === "dark"
                                                            ? "1px solid #444"
                                                            : "1px solid #d9d9d9"
                                                        : "none",
                                            }}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {chartData.dates
                                    .map((date, index) => ({
                                        date: date.split(" ")[0],
                                        rpc: chartData.rpc[index],
                                    }))
                                    .sort((a, b) =>
                                        rpcTableType === "top5"
                                            ? b.rpc - a.rpc
                                            : a.rpc - b.rpc
                                    )
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <tr key={index}>
                                            {/* Date */}
                                            <td
                                                style={{
                                                    padding: "6px 14px",
                                                    whiteSpace: "nowrap",
                                                    color: theme === "dark" ? "#eee" : "#333",

                                                    borderRight:
                                                        theme === "dark"
                                                            ? "1px solid #444"
                                                            : "1px solid #d9d9d9",

                                                    borderBottom:
                                                        index !== 4
                                                            ? theme === "dark"
                                                                ? "1px solid #444"
                                                                : "1px solid #d9d9d9"
                                                            : "none",
                                                }}
                                            >
                                                {item.date}
                                            </td>

                                            {/* RPC */}
                                            <td
                                                style={{
                                                    padding: "6px 14px",
                                                    whiteSpace: "nowrap",
                                                    fontWeight: 500,
                                                    color: theme === "dark" ? "#fff" : "#333",

                                                    borderRight:
                                                        theme === "dark"
                                                            ? "1px solid #444"
                                                            : "1px solid #d9d9d9",

                                                    borderBottom:
                                                        index !== 4
                                                            ? theme === "dark"
                                                                ? "1px solid #444"
                                                                : "1px solid #d9d9d9"
                                                            : "none",
                                                }}
                                            >
                                                {item.rpc}
                                            </td>

                                            {/* WeekDay */}
                                            <td
                                                style={{
                                                    padding: "6px 14px",
                                                    whiteSpace: "nowrap",
                                                    color: theme === "dark" ? "#eee" : "#333",

                                                    // No right border for last column
                                                    borderRight: "none",

                                                    borderBottom:
                                                        index !== 4
                                                            ? theme === "dark"
                                                                ? "1px solid #444"
                                                                : "1px solid #d9d9d9"
                                                            : "none",
                                                }}
                                            >
                                                {moment(item.date).format("dddd")}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    <div
                        className="rpc-margin-card"
                        style={{
                            marginLeft: "0",
                            padding: "12px",
                            borderRadius: "6px",
                            border: theme === "dark"
                                ? "1px solid #3a3a3a"
                                : "1px solid #ddd",
                            backgroundColor: theme === "dark"
                                ? "#1f1f1f"
                                : "#f5f5f5",
                            boxSizing: "border-box",
                            overflow: "hidden",
                        }}
                    >
                        {/* Radio Buttons */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginBottom: "10px",
                                flexWrap: "wrap",
                            }}
                        >
                            {/* Top 5 */}
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "5px 8px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    color: theme === "dark" ? "#fff" : "#333",
                                    backgroundColor:
                                        rpcTableType === "top5"
                                            ? theme === "dark"
                                                ? "#333"
                                                : "#f0f0f0"
                                            : "transparent",
                                }}
                            >
                                <input
                                    type="radio"
                                    name="marginTable"
                                    value="top5"
                                    checked={marginTableType === "top5"}
                                    onChange={(e) => setMarginTableType(e.target.value)}
                                    style={{
                                        margin: 0,
                                        width: "12px",
                                        height: "12px",
                                        cursor: "pointer",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        border: "1px solid #91c25f",
                                        borderRadius: "50%",
                                        backgroundColor: "transparent",
                                        boxSizing: "border-box",
                                        backgroundImage:
                                            marginTableType === "top5"
                                                ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                                : "none",
                                    }}
                                />
                                Top 5 Margin
                            </label>

                            {/* Last 5 */}
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "5px 8px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    color: theme === "dark" ? "#fff" : "#333",
                                    backgroundColor:
                                        rpcTableType === "top5"
                                            ? theme === "dark"
                                                ? "#333"
                                                : "#f0f0f0"
                                            : "transparent",
                                }}
                            >
                                <input
                                    type="radio"
                                    name="marginTable"
                                    value="last5"
                                    checked={marginTableType === "last5"}
                                    onChange={(e) => setMarginTableType(e.target.value)}
                                    style={{
                                        margin: 0,
                                        width: "12px",
                                        height: "12px",
                                        cursor: "pointer",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        border: "1px solid #91c25f",
                                        borderRadius: "50%",
                                        backgroundColor: "transparent",
                                        boxSizing: "border-box",
                                        backgroundImage:
                                            marginTableType === "last5"
                                                ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                                : "none",
                                    }}
                                />
                                Last 5 Margin
                            </label>
                        </div>

                        {/* Margin Table */}
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: 0,
                                fontSize: "11px",
                                overflow: "hidden",
                                borderRadius: "4px",
                                border: theme === "dark"
                                    ? "1px solid #444"
                                    : "1px solid #d9d9d9",
                            }}
                        >
                            <thead>
                                <tr>
                                    {["Date", "Margin", "WeekDay"].map((heading, index) => (
                                        <th
                                            key={heading}
                                            style={{
                                                padding: "7px 10px",
                                                textAlign: "left",
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                color: theme === "dark" ? "#fff" : "#333",
                                                backgroundColor:
                                                    theme === "dark" ? "#2a2a2a" : "#f5f5f5",

                                                borderBottom:
                                                    theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9",

                                                borderRight:
                                                    index < 2
                                                        ? theme === "dark"
                                                            ? "1px solid #444"
                                                            : "1px solid #d9d9d9"
                                                        : "none",
                                            }}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {chartData.dates
                                    .map((date, index) => ({
                                        date: date.split(" ")[0],
                                        margin: chartData.margin[index],
                                    }))
                                    .sort((a, b) =>
                                        marginTableType === "top5"
                                            ? b.margin - a.margin
                                            : a.margin - b.margin
                                    )
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <tr key={index}>
                                            {/* Date */}
                                            <td
                                                style={{
                                                    padding: "6px 10px",
                                                    whiteSpace: "nowrap",
                                                    color: theme === "dark" ? "#eee" : "#333",

                                                    borderBottom:
                                                        index !== 4
                                                            ? theme === "dark"
                                                                ? "1px solid #444"
                                                                : "1px solid #d9d9d9"
                                                            : "none",

                                                    borderRight:
                                                        theme === "dark"
                                                            ? "1px solid #444"
                                                            : "1px solid #d9d9d9",
                                                }}
                                            >
                                                {item.date}
                                            </td>

                                            {/* Margin */}
                                            <td
                                                style={{
                                                    padding: "6px 10px",
                                                    whiteSpace: "nowrap",
                                                    fontWeight: 500,
                                                    color: theme === "dark" ? "#fff" : "#333",

                                                    borderBottom:
                                                        index !== 4
                                                            ? theme === "dark"
                                                                ? "1px solid #444"
                                                                : "1px solid #d9d9d9"
                                                            : "none",

                                                    borderRight:
                                                        theme === "dark"
                                                            ? "1px solid #444"
                                                            : "1px solid #d9d9d9",
                                                }}
                                            >
                                                {item.margin}
                                            </td>

                                            {/* WeekDay */}
                                            <td
                                                style={{
                                                    padding: "6px 10px",
                                                    whiteSpace: "nowrap",
                                                    color: theme === "dark" ? "#eee" : "#333",

                                                    borderBottom:
                                                        index !== 4
                                                            ? theme === "dark"
                                                                ? "1px solid #444"
                                                                : "1px solid #d9d9d9"
                                                            : "none",
                                                }}
                                            >
                                                {moment(item.date).format("dddd")}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </Col>
            )}

            <Col style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Col style={{ display: 'flex', justifyContent: "space-between", alignItems: 'center', marginBottom: '5px', gap: 5 }}>
                    <Select
                        size="small"
                        placeholder="Select a range"
                        value={selectedValue}
                        onChange={handleChange}
                        style={{
                            width: 100,
                            fontSize: 12,
                            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#000',
                            border: '1px solid #4CAF50',
                        }}
                        styles={{
                            selector: {
                                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                                border: '1px solid #4CAF50',
                                borderRadius: 8,
                                color: theme === 'dark' ? '#fff' : '#000',
                                minHeight: 24,
                            },
                        }}
                        classNames={{
                            popup: {
                                root: theme === 'dark' ? 'custom-dropdown' : undefined,
                            },
                        }}
                        options={dateOptions.map(option => ({
                            value: option,
                            label: option,
                        }))}
                    />

                    <Input
                        size="small"
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className={theme === 'dark' ? 'dark-theme' : 'custom-input-light'}
                        style={{
                            width: 150,
                            fontSize: 12,
                            minHeight: 24,
                            borderRadius: 8,
                            border: '1px solid #4CAF50',
                            backgroundColor: theme === 'dark' ? '#000' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#000',
                            fontWeight: 500,
                        }}
                    />
                    <Button
                        size='small'
                        type="default"
                        icon={<ReloadOutlined className='black-icon' />}
                        style={{ width: '25px', height: "24px", backgroundColor: '#91C25F', border: 'solid 0px' }}
                        onClick={handleReload}  // Call refresh function when clicked
                    />
                    <EditOutlined
                        onClick={() => setIsModalVisibles(true)}
                        style={{
                            marginRight: '3px',
                            color: comments?.comment ? '#91C25F' : 'gray',
                            cursor: 'pointer',
                            fontSize: '18px',
                        }}
                        title={comments?.comment ? 'Edit Comment' : 'Add Comment'}
                    />
                    <Modal
                        title={budgetObject?.adset_name}
                        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                        open={isModalVisibles}
                        closable={!confirmLoading}
                        mask={{ closable: false }}
                        onOk={handleOks}
                        onCancel={handleCancels}
                        styles={{
                            container: {
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            },
                            content: {
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                            },
                            header: {
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                            },
                            body: {
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                            },
                            footer: {
                                backgroundColor: theme === 'dark' ? '#333' : '#fff',
                            },
                            close: {
                                color: theme === 'dark' ? '#fff' : '#000',
                            },
                        }}
                        footer={[
                            <div
                                key="footer"
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%"
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: "column" }}>
                                    <span
                                        style={{
                                            marginRight: "auto",
                                            fontSize: "14px",
                                            color: theme === "dark" ? "white" : "black"
                                        }}
                                    >
                                        Last Edited Time:
                                    </span>

                                    <span
                                        style={{
                                            marginRight: "auto",
                                            fontSize: "14px",
                                            color: theme === "dark" ? "white" : "black"
                                        }}
                                    >
                                        {comments?.comment ? comments?.editedTime : ""}
                                    </span>
                                </div>

                                <div>
                                    <Button
                                        key="delete"
                                        type="danger"
                                        onClick={handleDelete}
                                        disabled={confirmLoading}
                                        style={{ border: "1px solid #e3e3da" }}
                                    >
                                        Delete
                                    </Button>

                                    <Button
                                        key="cancel"
                                        onClick={handleCancels}
                                        disabled={confirmLoading}
                                        style={{ marginLeft: "4px", backgroundColor: "transparent", color: theme === "dark" ? "white" : "black" }}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        key="ok"
                                        onClick={handleOks}
                                        disabled={confirmLoading}
                                        style={{
                                            marginLeft: "4px",
                                            backgroundColor: "#91C25F"
                                        }}
                                    >
                                        Ok
                                    </Button>
                                </div>
                            </div>
                        ]}
                    >
                        <Spin spinning={confirmLoading}>
                            <Input.TextArea
                                placeholder="Enter your comments here"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{
                                    color: theme === "dark" ? "white" : "black",
                                    backgroundColor: theme === "dark" ? "#1e1e1e" : "white",
                                    borderColor: theme === "dark" ? "#555" : "#d9d9d9",
                                }}
                            />
                        </Spin>
                    </Modal>
                </Col>
            </Col>
            {loading && (
                <div style={{ height: 400, backgroundColor: theme === "dark" ? "#000" : "#e6e6e6" }}>
                    <GridLoading theme={theme} />
                </div>
            )}
            <div
                style={{
                    width: '100%', borderRadius: 12, backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6', padding: 5,
                    height: 'auto', boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.6)' : '0 1px 6px rgba(0,0,0,0.08)',
                    display: loading ? "none" : "block"
                }}>

                <Col style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "28px",
                    width: "100%",
                    padding: "0px 5px 0px 5px"
                }}>
                    <div style={{ width: '100%', display: 'flex', }}>
                        <Tooltip
                            styles={{
                                container: {
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                    fontSize: 12
                                    // fontWeight: 500,
                                },
                            }}
                            title={copied ? 'Copied!' : 'Click to copy'}
                        >
                            <p
                                style={{ cursor: 'pointer', marginRight: '5px', fontSize: 12, color: theme === "dark" ? "white" : "black" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // e.preventDefault();
                                    handleCopy();
                                }}
                            >
                                {budgetObject?.adset_name}
                            </p>
                        </Tooltip>
                        {comments?.comment && (
                            <Tooltip
                                styles={{
                                    container: {
                                        backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        border: '1px solid #ccc',
                                        borderRadius: 6,
                                        fontSize: 12
                                        // fontWeight: 500,
                                    },
                                }}
                                title={comments.comment}
                            >
                                <p
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '300px',
                                        cursor: 'pointer',
                                        marginBottom: '15px',
                                        fontSize: 12,
                                        color: theme === "dark" ? "white" : "black"
                                    }}
                                >
                                    ({comments.comment})
                                </p>
                            </Tooltip>
                        )}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "10px",
                            justifyContent: "center"
                        }}
                    >
                        <div>
                            <Switch
                                size='small'
                                checked={budgetObject?.status === "ACTIVE"}
                                style={{
                                    backgroundColor: budgetObject?.status === "ACTIVE" ? "#91c25f" : theme === "dark" ? "beige" : undefined
                                }}
                                onChange={(checked) => {
                                    setNextChecked(checked);
                                    setIsCampaignModalVisibles(true);
                                }}
                            />
                            <Modal
                                title="Confirm Action"
                                open={isCampaignModalVisibles}
                                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                                onOk={handlePauseOk}
                                closable={!confirmLoading}
                                okButtonProps={{
                                    disabled: confirmLoading,
                                    style: {
                                        backgroundColor: theme === 'dark' ? '#91C25F' : '#91C25F',
                                        color: '#fff',
                                        borderColor: '#91C25F',
                                    },
                                }}
                                cancelButtonProps={{
                                    disabled: confirmLoading,
                                    style: {
                                        backgroundColor: theme === 'dark' ? '#444' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        borderColor: theme === 'dark' ? '#666' : '#d9d9d9',
                                    },
                                }}
                                mask={{
                                    closable: false,
                                }}
                                styles={{
                                    container: {
                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                    },
                                    content: {
                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                    header: {
                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                    body: {
                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                    footer: {
                                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                                    },
                                    close: {
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                }}
                                onCancel={handlePauseCancel}
                            >
                                <Spin spinning={confirmLoading}>
                                    <div>
                                        <p style={{ color: theme === "dark" ? "white" : "black" }}>
                                            Are you sure you want to turn {nextChecked ? "ON" : "OFF"} this adset?
                                        </p>
                                        <p style={{ color: theme === "dark" ? "white" : "black" }}>Adset ID: {adset_id}</p>
                                        <p style={{ color: theme === "dark" ? "white" : "black" }}>Adset Name: {budgetObject?.adset_name}</p>
                                    </div>
                                </Spin>
                            </Modal>
                        </div>

                        <div>
                            <DollarOutlined style={{ fontSize: "15px", color: theme === "dark" ? "white" : "black" }} onClick={() => setIsBudgetModalVisible(true)} />
                            {isBudgetModalVisible && (
                                <Modal
                                    title={budgetObject.adset_name}
                                    open={isBudgetModalVisible}
                                    onOk={handleOk}
                                    onCancel={() => setIsBudgetModalVisible(false)}
                                    width={600}
                                    okButtonProps={{
                                        style: { backgroundColor: '#91C25F', borderColor: '#91C25F' },
                                        disabled: confirmLoading || (changeBudget == null && bidAmount === null)
                                    }}
                                    cancelButtonProps={{
                                        disabled: confirmLoading,
                                        style: {
                                            backgroundColor: theme === 'dark' ? '#444' : '#fff',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            borderColor: theme === 'dark' ? '#666' : '#d9d9d9',
                                        },
                                    }}
                                    className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                                >
                                    <Spin spinning={confirmLoading}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }} >
                                            {/* Adset ID */}
                                            <div style={{ display: 'flex', alignItems: 'center' }} >
                                                <span> Adset ID:&nbsp; </span>
                                                <span style={{ fontWeight: 'normal' }}>
                                                    {budgetObject?.adset_id || "-"}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }} >
                                                <span> Budget Type:&nbsp; </span>
                                                <span style={{ fontWeight: 'normal' }}>
                                                    {budgetObject?.budget?.budgetType || "-"}
                                                </span>
                                            </div>

                                            {/* Budget Amount */}
                                            <div style={{ display: 'flex', flexDirection: 'column', margin: 0 }} >
                                                <Input
                                                    type="number"
                                                    disabled={budgetObject?.budget?.budget_amount == null}
                                                    value={changeBudget}
                                                    onChange={(e) => onChangeBudget(e.target.value)}
                                                    placeholder="0"
                                                    style={{
                                                        backgroundColor: theme === "dark" ? "#333" : "white",
                                                        color: theme === "dark" ? "white" : "#333", borderColor: '#91C25F',
                                                    }}
                                                />
                                            </div>

                                            {/* Bid Amount */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>

                                                <p style={{ margin: '0px' }}> Bid Amount: </p>
                                                <Input
                                                    type="number"
                                                    value={bidAmount}
                                                    disabled={budgetObject?.bid_amount == null}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    placeholder="0"
                                                    style={{
                                                        backgroundColor: theme === "dark" ? "#333" : "white",
                                                        color: theme === "dark" ? "white" : "#333", borderColor: '#91C25F',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Spin>
                                </Modal>
                            )}
                        </div>
                    </div>
                </Col>
                <div
                    className={theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz"}
                    style={{ height: 375, width: "100%" }}
                >
                    <ReusableAgGrid
                        rowData={campaignData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        // autoGroupColumnDef={autoGroupColumnDef}
                        gridOptions={gridOptions}
                        dataLoader={dataLoader}
                        setLoading={setLoading}
                        updatePinnedBottomRow={updatePinnedBottomRow}
                        pagination={true}
                        paginationPageSize={200}
                        getRowHeight={getRowHeight}
                        headerHeight={30}
                        // processCellForClipboard={processCellForClipboard}
                        // onSelectionChanged={onSelectionChanged}
                        ref={gridRef}
                        onGridReady={onGridReady}
                        onColumnMoved={onColumnMoved}
                        getMainMenuItems={getMainMenuItems}
                    />
                </div>
            </div>
            <Modal
                title="Add New Column"
                open={isModalOpen}
                onOk={handleOkCustomColumn}
                onCancel={handleCancel}
                okText="Add"
                cancelText="Cancel"
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
            >
                <Input value={newColumnName} placeholder="Enter Column Name" style={{ marginBottom: "10px", }}
                    onChange={(e) => setNewColumnName(e.target.value)} />
                <Input value={formula} placeholder="Enter Formula" onChange={(e) => setFormula(e.target.value)} />
            </Modal>

        </div>
    )

}