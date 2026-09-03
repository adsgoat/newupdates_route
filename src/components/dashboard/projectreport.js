"use client"
import { useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Skeleton } from "antd";
import "@/lib/agGridSetup";
import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import 'ag-grid-enterprise';
import GridLoading from "../common/skeletonloading";
import { Grid } from "antd";
const { useBreakpoint } = Grid;
export default function ProjectReports({ theme, skeletonLoading, rowData, func, columnDefs, defaultColDef, autoGroupColumnDef, onCellClicked, onFilterChanged, selectedItems, time, updatePinnedBottomRow, }) {
    const [loading, setLoading] = useState(true);
    const gridApiRef = useRef(null);
    const screens = useBreakpoint();
    const onGridReady = (params) => {
        gridApiRef.current = params.api;
    };
    const transformObjectKeys = (obj) => {
        const transformedObject = {};

        Object.keys(obj).forEach((key) => {
            const splitKey = key.split('_');
            let newKey;
            if (key === "Newsbreak_DA") {
                newKey = "Newsbreak_DomainActive"
            } else if (key === "FB_DomainActive") {
                newKey = "Facebook_DActive_Names"
            } else if (key === "FB_Mnet") {
                newKey = "Facebook_Mnet_Daily"
            } else if (key === "FB_MnetBing") {
                newKey = "Facebook_MnetBing_Daily"
            } else if (key === "FB_InuvoPrism") {
                newKey = "Facebook_InuvoPrismDaily"
            }
            else if (key === "FB_CodeFuel") {
                newKey = "Facebook_CodeFuel_Daily"
            }
            else if (key === "FB_Predicto") {
                newKey = "Facebook_Predicto_Daily"
            }
            else if (key === "FB_Affinity") {
                newKey = "Facebook_Affinity_Daily"
            } else if (key === "FB_Botup") {
                newKey = "Facebook_Botup_Daily"
            } else if (key === "Outbrain_TonicRsoc") {
                newKey = "Outbrain_TonicRsoc"
            } else if (key === "FB_MWG") {
                newKey = "Facebook_Mwg_Daily"
            } else if (key === "Taboola_Inuvoprism") {
                newKey = "Taboola_InuvoPrismDaily"
            }
            else { newKey = "Facebook_" + splitKey[1]; }

            // Initialize the array if the key doesn't exist
            if (!transformedObject[newKey]) {
                transformedObject[newKey] = [];
            }

            // Check if the value is an array
            if (Array.isArray(obj[key])) {
                // Loop through the array and extract each accountNumber
                obj[key].forEach(item => {
                    if (item.accountNumber) {
                        transformedObject[newKey].push(item.accountNumber);
                    }
                });
            } else if (obj[key]?.accountNumber) {
                // If it's an object, directly push the accountNumber
                transformedObject[newKey].push(obj[key].accountNumber);
            }
        });

        return transformedObject;
    };
    const collectionName = useMemo(() => { return Object.keys(transformObjectKeys(selectedItems)); }, [selectedItems]);
    const tableData = useMemo(() => {
        return func(rowData, time, collectionName);
    }, [rowData, time, collectionName]);

    const handleRowClicked = (params) => {
        if (!screens.sm) {
            params.node.setSelected(true);
        }
    };

    return (
        <div>
            {loading && (
                <div style={{ height: 300, backgroundColor: theme === "dark" ? "#000" : "#e6e6e6" }}>
                    <GridLoading theme={theme} />
                </div>
            )}

            <div className={theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz"} style={{ height: 300, width: "100%", display: loading ? "none" : "block" }}>
                <AgGridReact
                    rowData={tableData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        ...defaultColDef, wrapText: true, autoHeight: true,
                        cellStyle: { fontSize: "11px", paddingTop: "2px", paddingBottom: "2px", }
                    }}
                    gridOptions={{ ensureDomOrder: false, suppressRowClickSelection: true, suppressClipboardPaste: false, enableRangeSelection: true, }}
                    getMainMenuItems={(params) => {
                        return params.defaultItems.filter(item => item !== 'resetColumns');
                    }}
                    autoGroupColumnDef={autoGroupColumnDef}
                    rowGroupPanelShow="always"
                    suppressAggFuncInHeader={true}
                    // groupIncludeFooter={true}
                    // groupIncludeTotalFooter={true}
                    getRowHeight={() => 25} // ✅ consistent row height
                    // getRowHeight={() => (!screens.sm ? 18 : 25)}
                    headerHeight={28}
                    onCellClicked={onCellClicked}
                    enableCharts={true}
                    cellSelection={true}
                    onFirstDataRendered={(params) => {
                        params.api.setGridOption("pinnedBottomRowData", [{}]);
                        updatePinnedBottomRow(params.api, "onFirstDataRendered");
                        // setLoading(false);
                    }}
                    // groupAggFiltering={true}
                    // groupAggFiltering={(params) => {
                    //     console.log(params.node.group, params.node.key);
                    //     return true;
                    // }}
                    // groupAggFiltering={(params) => !!params.node.group}
                    groupAggFiltering={(params) => params.node.level === 0}
                    onColumnRowGroupChanged={(params) => {
                        const groupCount = params.api.getRowGroupColumns().length;
                        params.api.setGridOption( "groupAggFiltering", groupCount > 0 ? (p) => p.node.level === 0 : false );
                        params.api.onFilterChanged();
                    }}
                    onGridReady={onGridReady}
                    onFilterChanged={(params) => {
                        updatePinnedBottomRow(params.api, "onFilterChanged");
                    }}
                    onSortChanged={(params) => {
                        updatePinnedBottomRow(params.api, "onSortChanged");
                    }}
                    onRowDataUpdated={(params) => {
                        setLoading(false);
                        updatePinnedBottomRow(params.api, "onRowDataUpdated");
                    }}
                    overlayNoRowsTemplate="<span>No data available for the selected date</span>"
                    rowSelection="single"
                    onRowClicked={handleRowClicked}
                    scrollbarWidth={5}
                />
            </div>
        </div>
    )
}