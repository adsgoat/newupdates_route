"use client";
import { AgGridReact } from "ag-grid-react";
const ReusableAgGrid = ({
    rowData = [], dataLoader, columnDefs = [], defaultColDef = {}, autoGroupColumnDef = {}, gridOptions = {}, setLoading,
    updatePinnedBottomRow, pagination = true, paginationPageSize = 200,
    paginationPageSizeSelector = [20, 40, 60, 80, 100, 150, 200], getRowHeight = () => 25, headerHeight = 28,
    processCellForClipboard, onSelectionChanged, ref, onGridReady, onColumnMoved, groupAggFiltering = false, getMainMenuItems
}) => {

    const handlePinnedBottomRowUpdate = (api, source) => {
        if (updatePinnedBottomRow) {
            updatePinnedBottomRow(api, source);
        }
    };

    return (
        <AgGridReact
            ref={ref}
            rowData={rowData}
            getRowHeight={getRowHeight}
            headerHeight={headerHeight}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            suppressAggFuncInHeader={true}
            autoGroupColumnDef={autoGroupColumnDef}
            groupAggFiltering={groupAggFiltering}
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={paginationPageSizeSelector}
            onFirstDataRendered={(params) => {
                params.api.setGridOption("pinnedBottomRowData", [{}]);
                handlePinnedBottomRowUpdate(params.api, "onFirstDataRendered");
            }}
            onFilterChanged={(params) => {
                handlePinnedBottomRowUpdate(params.api, "onFilterChanged");
            }}
            onSortChanged={(params) => {
                handlePinnedBottomRowUpdate(params.api, "onSortChanged");
            }}
            onRowDataUpdated={(params) => {
                handlePinnedBottomRowUpdate(params.api, "onRowDataUpdated");
                if (dataLoader) { setLoading(false); }
            }}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            processCellForClipboard={processCellForClipboard}
            gridOptions={{
                ...gridOptions,
                ensureDomOrder: false,
                enableCharts: true,
                suppressRowClickSelection: true,
                suppressClipboardPaste: false,
                enableRangeSelection: true,
                groupSelectsChildren: true,
            }}
            onSelectionChanged={onSelectionChanged}
            onGridReady={onGridReady}
            onColumnMoved={onColumnMoved}
            getMainMenuItems={getMainMenuItems}
        />
    );
};

export default ReusableAgGrid;