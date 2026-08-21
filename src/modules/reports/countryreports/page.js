"use client"
import axios from 'axios';
import { useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
// import { Button, Result } from 'antd';
// import { SmileOutlined } from '@ant-design/icons';
import { CountryColumnDefs } from "../columndefs/page"
import GridLoading from '@/components/common/skeletonloading';
import { newtworkCollections } from "../livereports/networksandtimezones";
import 'antd/dist/reset.css';
import "@/lib/agGridSetup";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
const contentStyle = { color: '#66fc03', lineHeight: '160px', textAlign: 'center', background: '#fbfcfa' };

const CountryReports = ({ theme, activeTab, userData, updatedRevenuePartner, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, refreshTabs }) => {
    const gridThemeClass = theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

    const [BMNameData, setBMNameData] = useState([]);

    const [apiStatus, setApiStatus] = useState(false);

    const [selectedCells, setSelectedCells] = useState([]);

    const columnDefsObject = useMemo(() => {
        const allColumns = CountryColumnDefs({ updatedTime });
        return allColumns.filter(Boolean);
    }, [updatedTime]);

    // const [BMNameFixedFooter, setBMNameFixedFooter] = useState([]);
    const [dataLoader, setDataLoader] = useState(false);

    const [isLoading, setLoading] = useState(true);

    const lastAgencyFetch = useRef(null);

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
    const autoGroupColumnDef = {
        headerName: 'Channel', // Display name for the grouped column
        minWidth: 150, // Set width for grouped rows
        resizable: true, // Enable resizing
        sortable: true, // Enable sorting
        cellRendererParams: { suppressCount: true },
    };

    const memorizedBMNameData = useMemo(() => BMNameData, [BMNameData]);

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
                [`${updatedTime}Date`]: "Totals",
                spend: 0,
                revenue: 0,
                profit: 0,
                margin: 0,
                rpc: 0,
                cpl: 0,
                conversions: 0,
                impressions: 0
            });

            api.refreshCells({ rowNodes: [pinnedNode], force: true, });

            return;
        }

        const revenue = rows.reduce((acc, curr) => acc + Number(curr?.revenue || 0), 0);
        const spend = rows.reduce((acc, curr) => acc + Number(curr?.spend || 0), 0);
        const profit = rows.reduce((acc, curr) => acc + Number(curr?.profit || 0), 0);
        const conversions = rows.reduce((acc, curr) => acc + Number(curr?.conversions || 0), 0);
        const fbleads = rows.reduce((acc, curr) => acc + Number(curr?.fbleads || 0), 0);
        const impressions = rows.reduce((acc, curr) => acc + Number(curr?.impressions || 0), 0);
        const rpc = conversions ? revenue / conversions : 0;
        const cpl = fbleads ? spend / fbleads : 0;
        const margin = revenue ? ((revenue - spend) / revenue) * 100 : 0;
        const row = {
            [`${updatedTime}Date`]: "Totals",
            spend: Number(spend.toFixed(2)),
            revenue: Number(revenue.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            conversions: Number(conversions.toFixed(2)),
            impressions: impressions,
            fbleads: Number(fbleads.toFixed(2)),
            rpc: Number(rpc.toFixed(2)),
            cpl: Number(cpl.toFixed(2)),
            margin: Number(margin.toFixed(2)),
        };

        Object.assign(pinnedNode.data, row);

        api.refreshCells({ rowNodes: [pinnedNode], force: true, });
    };

    const functionCall1 = async () => {
        try {
            const fetchData = await axios.get(`api/reports/countryreports?start=${updatedStartDate}&end=${updatedEndDate}&time=${updatedTime}`);
            const mainData = fetchData.data.data;
            const countryCodeList = fetchData.data.countryCodes;
            const mainData1 = mainData.map(item => ({ ...item, country_code: `${countryCodeList.find(code => code.key === item.country_code)?.value ?? item.country_code}(${item.country_code})`, revenue: item.estimated_revenue, conversions: item.ad_clicks, impressions: item.impression }));
            // const mainData1 = mainData.map(item => ({ ...item, revenue: item.estimated_revenue }))

            if (fetchData.status === 200 && mainData.length > 0) {
                setDataLoader(true)
                setBMNameData(mainData1);
                // const totalWithTax = groupAndCalculateBMName1?.reduce((acc, curr) => {
                //     const spend = Number(curr.spend) || 0;

                //     const accountTax = taxDetails?.find(
                //         item =>
                //             String(item.accountNumber) ===
                //             String(curr.accountNumber)
                //     );

                //     const taxRate =
                //         parseFloat(
                //             String(accountTax?.tax || "0").replace("%", "")
                //         ) || 0;

                //     return acc + spend + (spend * taxRate) / 100;
                // }, 0);
                // setBMNameColumnDefs();
                // setBMNameFixedFooter([
                //     {
                //         // domain:'Totals',
                //         [`${newtime}Date`]: 'Totals',
                //         spend: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.spend), 0).toFixed(2)),
                //         revenue: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.revenue), 0).toFixed(2)),
                //         profit: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0).toFixed(2)),
                //         margin: parseFloat((groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.profit), 0) / groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr.revenue), 0) * 100).toFixed(2)),
                //         rpc: parseFloat((groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.rpc), 0) / groupAndCalculateBMName1?.length).toFixed(2)),
                //         cpl: parseFloat((groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.cpl), 0) / groupAndCalculateBMName1?.length).toFixed(2)),
                //         conversions: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.conversions), 0).toFixed(2)),
                //         // tax: Number(totalWithTax.toFixed(2)),
                //         // clicks: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.clicks), 0).toFixed(2)),
                //         // impressions: parseFloat(groupAndCalculateBMName1?.reduce((acc, curr) => acc + parseFloat(curr?.impressions), 0).toFixed(2)),
                //     }
                // ]);
                // console.log("hihi");
            }
            else {
                setDataLoader(true)
                setBMNameData([]);
                // setBMNameFixedFooter([]);
            }
            // setLoading(false);
            fetchData.status === 200 && setApiStatus(false);
        }
        catch (error) {
            setDataLoader(true)
            setApiStatus(true);
            setLoading(false);
        }

    }
    const handleReFetchData = () => {
        functionCall1();
        setApiStatus(false);
    }
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

        if (lastAgencyFetch.current === currentKey) {
            return;
        }

        lastAgencyFetch.current = currentKey;

        setLoading(true);
        setDataLoader(false);
        functionCall1();
    }, [activeTab, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, refreshTabs]);

    // useEffect(() => {
    //     if (refreshpage === "Refresh4") {
    //         handleReFetchData();
    //     }
    // }
    //     , [refreshpage]);
    // console.log(BMNameData);
    return (
        <div style={{ height: "100%", }}>
            <div style={contentStyle}>
                {isLoading && (
                    <div style={{ height: 400, backgroundColor: theme === "dark" ? "#000" : "#e6e6e6" }}>
                        <GridLoading theme={theme} />
                    </div>
                )}

                <div className={`${gridThemeClass}`}
                    style={{
                        height: 400,
                        width: "100%",
                        display: isLoading ? "none" : "block"
                    }}>
                    <AgGridReact
                        rowData={memorizedBMNameData}
                        columnDefs={columnDefsObject}
                        rowHeight={28}
                        headerHeight={28}
                        groupAggFiltering={(params) => params.node.level === 0}
                        autoGroupColumnDef={autoGroupColumnDef}
                        gridOptions={{
                            // groupDefaultExpanded: -1, // Expands all groups by default
                            ensureDomOrder: false,
                            suppressRowClickSelection: true,
                            suppressClipboardPaste: false, // ✅ Allow AG Grid clipboard functionality
                            enableRangeSelection: true, // ✅ Enables Shift + Arrow for selection
                        }}
                        suppressAggFuncInHeader={true}
                        enableCharts={true}
                        enableRangeSelection={true}
                        onCellKeyDown={onCellKeyDown}
                        getRowStyle={(params) => {
                            if (params.node.rowPinned) {
                                return {
                                    fontWeight: 'bold',
                                };
                            }
                            return null;
                        }}
                        getCellStyle={(params) => {
                            const isSelected = selectedCells.some(
                                (cell) => cell.rowIndex === params.node.rowIndex && cell.columns.includes(params.column.getId())
                            );
                            return isSelected ? { backgroundColor: "#007bff", color: "#fff" } : {}; // ✅ Highlight only selected cells
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

export default CountryReports;
