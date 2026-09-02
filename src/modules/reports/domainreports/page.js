"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import React from 'react';
import moment from 'moment-timezone';
import { Button, Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { DomainColumnDefs } from "../columndefs/page"
import GridLoading from '@/components/common/skeletonloading';
import { newtworkCollections } from "../dailyreports/networksandtimezones";
import 'antd/dist/reset.css';
import 'ag-grid-enterprise';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
const contentStyle = { color: '#66fc03', lineHeight: '160px', textAlign: 'center', background: '#fbfcfa' };

const DomainReports = ({ theme, activeTab, userData, updatedRevenuePartner, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, taxDetails, refreshTabs }) => {
    const gridThemeClass = theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

    const [domainData, setDomainData] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [firstSelectedCell, setFirstSelectedCell] = useState(null);
    const [dataLoader, setDataLoader] = useState(false);
    const [isLoading, setLoading] = useState(true);

    const lastDomainFetch = useRef(null);

    function groupAndCalculateProfit(data) {
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.domain}-${item.accountNumber}-${item[`${updatedTime}Date`]}`;

            if (!acc[key]) {
                acc[key] = {
                    domain: item.domain,
                    [`${updatedTime}Date`]: item[`${updatedTime}Date`],
                    revenue: 0,
                    spend: 0,
                    conversions: 0,
                    fbleads: 0,
                    adClicks: 0, // Store total ad_clicks
                    fblinkclicks: 0,
                    impressions: 0,
                    fbclicks: 0,
                    accountNumber: item.accountNumber
                };
            }

            acc[key].revenue += item.estimated_revenue || 0;
            acc[key].spend += parseFloat(item.spend) || 0;
            acc[key].conversions += item.conversions || 0;
            acc[key].fbleads += parseInt(item.fbLeads) || 0;
            acc[key].adClicks += item.adClicks || 0; // Sum ad_clicks separately
            acc[key].fblinkclicks += parseInt(item.fbLinkClicks || 0);
            acc[key].impressions += parseInt(item.impressions || 0);
            acc[key].fbclicks += parseInt(item.fbClicks || 0);
            return acc;
        }, {});

        return Object.values(groupedData).map(item => {
            const finalConversions = item.adClicks > 0 ? item.adClicks : item.conversions; // ✅ Ensure correct conversions

            return {
                ...item,
                conversions: finalConversions, // ✅ Set correct conversions before using in rpc
                profit: item.revenue - item.spend,
                margin: item.revenue > 0 ? ((item.revenue - item.spend) / item.revenue) * 100 : 0,
                rpc: finalConversions > 0 ? (item.revenue / finalConversions) : 0, // ✅ Now uses correct conversions
                cpl: item.fbLeads > 0 ? (item.spend / item.fbLeads) : 0,  // Cost per Lead
                cpm: item.impressions > 0 ? (item.spend / item.impressions) * 1000 : 0,  // Cost per Mille
                cpc: item.cpc,
                impressions: item.impressions, // Ensure impressions are included in the final output
                fbclicks: item.fbclicks, // Ensure fbClicks are included in the final output
                fbleads: item.fbleads, // Ensure fbLeads are included in the final output
                fblinkclicks: item.fblinkclicks, // Ensure fbLinkClicks are included in the final output

            };
        });
    }

    const onCellClickedLive = (event) => {
        // ✅ Keep your existing functionality
        if (event.colDef.field === "adsetname") {
            const value = event.value;
            if (value !== undefined) {
                const url = `/LiveHistory/LiveAdsetHistory/${value.replace(/\//g, "*").replace(/-/g, "^")}-${updatedAccountsValue}-${updatedTime}-${newtworkCollections[updatedRevenuePartner]}`;
                window.open(url, "_blank", "noopener,noreferrer");
            }
        }

        // ✅ Ensure first selected cell gets highlighted
        if (event.event.shiftKey || event.event.ctrlKey) {
            // Add to selection when Shift/Ctrl is pressed
            setSelectedCells((prev) => [...prev, { rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        } else {
            // Single click selects only one cell
            setFirstSelectedCell({ rowIndex: event.node.rowIndex, colId: event.column.getId() });
            setSelectedCells([{ rowIndex: event.node.rowIndex, colId: event.column.getId() }]);
        }
    };
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
        headerName: 'Domain', // Display name for the grouped column
        minWidth: 200, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: {
            suppressCount: true, // Suppress row count in the grouped column
        },
    };

    const columnDefsObject = useMemo(() => {
        const allColumns = DomainColumnDefs({ updatedTime, taxDetails });
        return allColumns.filter(Boolean);
    }, [updatedTime, taxDetails]);

    const memorizedDomainData = useMemo(() => domainData, [domainData]);

    const functionCall1 = async () => {
        console.log("hey");
        try {
            setLoading(true);
            // console.log(updateRevenuePartner);
            const collectionName = newtworkCollections[updatedRevenuePartner];
            const fetchData = await axios.get(`api/reports/domain?start=${updatedStartDate}&end=${updatedEndDate}&accounts=${updatedAccountsValue}&time=${updatedTime}&network=${collectionName}`);
            const mainData1 = fetchData.data.data;
            if (fetchData.status === 200 && mainData1.length > 0) {
                const groupAndCalculateProfit1 = groupAndCalculateProfit(mainData1);
                setDataLoader(true)
                setDomainData(groupAndCalculateProfit1);
            }
            else {
                setDataLoader(true)
                setDomainData([]);
            }
            setLoading(false);
        }
        catch (error) {
            console.error(error)
            setDataLoader(true)
            setLoading(false);
        }

    }

    const onCellKeyDown = (params) => {
        if (params.event.ctrlKey && params.event.key === "c") {
            params.event.preventDefault(); // Prevent default copy behavior

            // ✅ Ensure `selectedCells` is not empty
            if (!selectedCells.length) return;

            // ✅ Prepare data to copy: Rows separated by \n, Columns by \t
            const copiedText = selectedCells
                .map(({ rowIndex, columns }) => {
                    if (!columns || !Array.isArray(columns)) {
                        // ✅ Handle case where only one cell is selected
                        const singleColId = selectedCells[0]?.colId;
                        const row = params.api.getDisplayedRowAtIndex(rowIndex);
                        return row && singleColId ? params.api.getValue(singleColId, row) : "";
                    }

                    // ✅ Multi-cell copying logic
                    return columns
                        .map((colId) => {
                            const row = params.api.getDisplayedRowAtIndex(rowIndex);
                            return row ? params.api.getValue(colId, row) : "";
                        })
                        .join("\t");
                })
                .join("\n"); // Each row on a new line

            // ✅ Copy text to clipboard
            navigator.clipboard.writeText(copiedText).then(() => {
                // console.log("Copied to clipboard:", copiedText);
            }).catch((err) => {
                console.error("Clipboard copy failed:", err);
            });

            // ✅ Trigger AG Grid’s built-in copy effect (blinking dark blue selection)
            params.api.copySelectedRangeToClipboard();
        }
    };

    const handleReFetchData = () => {
        functionCall1();
    }

    // useEffect(() => {
    //     if (refreshpage === "Refresh5" && updatedRevenuePartner === "FB_Mnet") {
    //         handleReFetchData();
    //     }
    // }, [refreshpage]);
    useEffect(() => {
        console.log(activeTab);
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

        if (lastDomainFetch.current === currentKey) {
            return;
        }

        lastDomainFetch.current = currentKey;

        setLoading(true);
        setDataLoader(false);
        functionCall1();
    }, [activeTab, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, refreshTabs]);
    return (
        <div style={{ height: "100%", marginBottom: '20px' }}>
            <div style={contentStyle}>
                {isLoading && (
                    <div style={{ height: 400, backgroundColor: theme === "dark" ? "#000" : "#e6e6e6" }}>
                        <GridLoading theme={theme} />
                    </div>
                )}
                <div
                    className={`ag-theme-quartz ${gridThemeClass}`}
                    style={{
                        height: 400,
                        width: "100%",
                        display: isLoading ? "none" : "block"
                    }}
                >
                    <AgGridReact
                        rowData={memorizedDomainData}
                        columnDefs={columnDefsObject}
                        rowHeight={29}
                        headerHeight={28}
                        suppressAggFuncInHeader={true}
                        enableCharts={true}
                        autoGroupColumnDef={autoGroupColumnDef}
                        enableRangeSelection={true}
                        getRowStyle={(params) => {
                            if (params.node.rowPinned) {
                                return {
                                    fontWeight: 'bold',
                                    // backgroundColor: theme === "dark" ? '#000' : '#fff',
                                    // color: theme === "dark" ? '#fff' : '#000',
                                };
                            }
                            return null;
                        }}
                        gridOptions={{
                            ensureDomOrder: false,
                            suppressRowClickSelection: true,
                            suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                            enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                            groupSelectsChildren: true, // ✅ Ensures child rows are selected properly
                        }}
                        onCellKeyDown={onCellKeyDown}
                        onCellClicked={onCellClickedLive}
                        getCellStyle={(params) => {
                            const isSelected = selectedCells.some(
                                (cell) => cell.rowIndex === params.node.rowIndex && cell.columns.includes(params.column.getId())
                            );

                            // ✅ Ensure first cell inside a group is highlighted
                            const isFirstSelected = firstSelectedCell &&
                                firstSelectedCell.rowIndex === params.node.rowIndex &&
                                firstSelectedCell.colId === params.column.getId();

                            return isSelected || isFirstSelected ? { backgroundColor: "#007bff", color: "#fff" } : {};
                        }}
                        onFirstDataRendered={(params) => {
                            params.api.setGridOption("pinnedBottomRowData", [{}]);
                            updatePinnedBottomRow(params.api);
                        }}

                        onFilterChanged={(params) => {
                            updatePinnedBottomRow(params.api);
                        }}

                        onSortChanged={(params) => {
                            updatePinnedBottomRow(params.api);
                        }}

                        onRowDataUpdated={(params) => {
                            updatePinnedBottomRow(params.api);
                            if (dataLoader) {
                                setLoading(false);
                            }
                        }}
                    />
                </div>
            </div>
        </div>

    );
};

export default DomainReports;
