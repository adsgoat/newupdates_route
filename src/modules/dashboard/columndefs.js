const getGroupTotals = (rowNode) => {
    if (!rowNode?.group || !rowNode.allLeafChildren) {
        return {
            spend: 0,
            estimated_revenue: 0,
            conversions: 0,
            fbLeads: 0,
            fbClicks: 0,
            fbLinkClicks: 0,
            impressions: 0,
        };
    }

    const totals = {
        spend: 0,
        estimated_revenue: 0,
        conversions: 0,
        fbLeads: 0,
        fbClicks: 0,
        fbLinkClicks: 0,
        impressions: 0,
    };

    rowNode.allLeafChildren.forEach(({ data }) => {
        totals.spend += Number(data?.spend || 0);
        totals.estimated_revenue += Number(data?.estimated_revenue || 0);
        totals.conversions += Number(data?.conversions || 0);
        totals.fbLeads += Number(data?.fbLeads || 0);
        totals.fbClicks += Number(data?.fbClicks || 0);
        totals.fbLinkClicks += Number(data?.fbLinkClicks || 0);
        totals.impressions += Number(data?.impressions || 0);
    });

    return totals;
};
const rpcAggFunc = (params) => {
    const { estimated_revenue, conversions } = getGroupTotals(params.rowNode);

    if (!conversions) return 0;

    return Number((estimated_revenue / conversions).toFixed(2));
};

const fMarginAggFunc = (params) => {
    const {
        spend,
        estimated_revenue,
        fbLeads,
        conversions,
    } = getGroupTotals(params.rowNode);

    if (!conversions || !fbLeads) return 0;

    const rpc = estimated_revenue / conversions;
    const revenue = rpc * fbLeads;

    if (!revenue) return 0;

    const fMargin = ((estimated_revenue - spend) / revenue) * 100;

    return (!isFinite(fMargin) || isNaN(fMargin))
        ? 0
        : Number(fMargin.toFixed(2));
};

const ncplAggFunc = (params) => {
    const { spend, conversions } = getGroupTotals(params.rowNode);

    if (!conversions) return 0;

    const ncpl = spend / conversions;

    return (!isFinite(ncpl) || isNaN(ncpl))
        ? 0
        : Number(ncpl.toFixed(2));
};

const ctrAggFunc = (params) => {
    const { fbClicks, impressions } = getGroupTotals(params.rowNode);

    if (!impressions) return 0;

    const ctr = (fbClicks / impressions) * 100;

    return (!isFinite(ctr) || isNaN(ctr))
        ? 0
        : Number(ctr.toFixed(2));
};

const cpmAggFunc = (params) => {
    const { spend, impressions } = getGroupTotals(params.rowNode);

    if (!impressions) return 0;

    const cpm = (spend / impressions) * 1000;

    return (!isFinite(cpm) || isNaN(cpm))
        ? 0
        : Number(cpm.toFixed(2));
};

const marginAggFunc = (params) => {
    const { spend, estimated_revenue } = getGroupTotals(params.rowNode);

    if (!estimated_revenue) return 0;

    const margin = ((estimated_revenue - spend) / estimated_revenue) * 100;

    return (!isFinite(margin) || isNaN(margin))
        ? 0
        : Number(margin.toFixed(2));
};

const roiAggFunc = (params) => {
    const { spend, estimated_revenue } = getGroupTotals(params.rowNode);

    if (!spend) return 0;

    const roi = ((estimated_revenue - spend) / spend) * 100;

    return (!isFinite(roi) || isNaN(roi))
        ? 0
        : Number(roi.toFixed(2));
};

const cpcAggFunc = (params) => {
    const { spend, fbClicks } = getGroupTotals(params.rowNode);

    if (!fbClicks) return 0;

    const cpc = spend / fbClicks;

    return (!isFinite(cpc) || isNaN(cpc))
        ? 0
        : Number(cpc.toFixed(2));
};

const cpcLinkClicksAggFunc = (params) => {
    const { spend, fbLinkClicks } = getGroupTotals(params.rowNode);

    if (!fbLinkClicks) return 0;

    const cpcLinkClicks = spend / fbLinkClicks;

    return (!isFinite(cpcLinkClicks) || isNaN(cpcLinkClicks))
        ? 0
        : Number(cpcLinkClicks.toFixed(2));
};

const filterationAggFunc = (params) => {
    const { fbLeads, conversions } = getGroupTotals(params.rowNode);

    if (!fbLeads) return 0;

    const filteration = ((fbLeads - conversions) / fbLeads) * 100;

    return (!isFinite(filteration) || isNaN(filteration))
        ? 0
        : Number(filteration.toFixed(2));
};

const cplAggFunc = (params) => {
    const { spend, fbLeads } = getGroupTotals(params.rowNode);

    if (!fbLeads) return 0;

    const cpl = spend / fbLeads;

    return (!isFinite(cpl) || isNaN(cpl))
        ? 0
        : Number(cpl.toFixed(2));
};
const spender = (params) => {
    const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
    return Math.round(total * 100) / 100; // Round to 2 decimal places
};
const currencyFormatter = (params) => {
    return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
};
const avgRpcCpl = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { conversions, estimated_revenue } = params.data;
        if (estimated_revenue !== 0) {
            const RPC = estimated_revenue / conversions;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { conversions, estimated_revenue } = params.node.aggData;
        if (estimated_revenue !== 0) {
            const RPC = estimated_revenue / conversions;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const getDev = (params) => {
    const rpc = avgRpcCpl(params);
    if (params.data !== undefined) {
        const { fbLeads } = params.data;

        if (fbLeads !== 0) {
            const CPL = rpc * fbLeads;
            if (CPL === Infinity) {
                return 0;
            }
            return CPL;

        }
    }
    if (params.node.aggData !== undefined) {
        const { fbLeads } = params.node.aggData;
        if (fbLeads !== 0) {
            const CPL = rpc * fbLeads;
            return CPL;
        }
    }

    return 0;

}
const avgFMARGIN = (params) => {
    const revenue = getDev(params);
    if (params.data !== undefined) {
        const { spend, estimated_revenue } = params.data;
        if (revenue !== 0) {
            const RPC = ((estimated_revenue - spend) / revenue) * 100;
            if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                return 0;
            }
            return `${Number(RPC.toFixed(2))}`;

        }
    }
    if (params.node.aggData !== undefined) {
        const { spend, estimated_revenue } = params.node.aggData;
        if (revenue !== 0) {
            const RPC = ((estimated_revenue - spend) / revenue) * 100;
            return `${Number(RPC.toFixed(2))}`;
        }
    }

    return 0;
}
const avgNCPL = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { conversions, spend } = params.data;
        if (conversions !== 0) {
            const RPC = spend / conversions;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { conversions, spend } = params.node.aggData;
        if (conversions !== 0) {
            const RPC = spend / conversions;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgCTR = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { fbClicks, impressions } = params.data;
        if (impressions !== 0) {
            const RPC = (fbClicks / impressions) * 100;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { fbClicks, impressions } = params.node.aggData;
        if (impressions !== 0) {
            const RPC = (fbClicks / impressions) * 100;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgCPM = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { spend, impressions } = params.data;
        if (impressions !== 0) {
            const RPC = (spend / impressions) * 1000;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { spend, impressions } = params.node.aggData;
        if (impressions !== 0) {
            const RPC = (spend / impressions) * 1000;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgMARGIN = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { spend, estimated_revenue } = params.data;
        if (estimated_revenue !== 0) {
            const RPC = ((estimated_revenue - spend) / estimated_revenue) * 100;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { spend, estimated_revenue } = params.node.aggData;
        if (estimated_revenue !== 0) {
            const RPC = ((estimated_revenue - spend) / estimated_revenue) * 100;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgROI = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { spend, estimated_revenue } = params.data;
        if (estimated_revenue !== 0) {
            const RPC = ((estimated_revenue - spend) / spend) * 100;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { spend, estimated_revenue } = params.node.aggData;
        if (estimated_revenue !== 0) {
            const RPC = ((estimated_revenue - spend) / spend) * 100;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgCPC = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { fbClicks, spend } = params.data;
        if (fbClicks !== 0) {
            const RPC = spend / fbClicks;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { fbClicks, spend } = params.node.aggData;
        if (fbClicks !== 0) {
            const RPC = spend / fbClicks;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgCPCLinkClikcs = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { fbLinkClicks, spend } = params.data;
        if (fbLinkClicks !== 0) {
            const RPC = spend / fbLinkClicks;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { fbLinkClicks, spend } = params.node.aggData;
        if (fbLinkClicks !== 0) {
            const RPC = spend / fbLinkClicks;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};
const avgFilteration = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { fbLeads, conversions } = params.data;
        if (fbLeads !== 0) {
            const RPC = ((parseInt(fbLeads) - parseInt(conversions)) / parseInt(fbLeads)) * 100;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { fbLeads, conversions } = params.node.aggData;
        if (fbLeads !== 0) {
            const RPC = ((parseInt(fbLeads) - parseInt(conversions)) / parseInt(fbLeads)) * 100;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};

const avgCpl = (params) => {
    // For non-grouped rows (individual row data)
    if (params.data !== undefined) {
        // console.log(params.data);
        const { spend, fbLeads } = params.data;
        if (spend !== 0) {
            const RPC = spend / fbLeads;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    // For grouped rows (aggregation)
    if (params.node?.aggData !== undefined) {
        // console.log(params.node?.aggData);
        const { spend, fbLeads } = params.node.aggData;
        if (spend !== 0) {
            const RPC = spend / fbLeads;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
};

const columnDefs = [
    {
        headerName: 'Project name',
        field: "revenuePartner",
        resizable: true,
        sortable: true,
        minWidth: 150,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
    },
    {
        field: "holder",
        resizable: true,
        sortable: true,
        minWidth: 100,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
    {
        field: 'accountNumber',
        colId: 'accountNumber',
        headerName: 'Account number',
        resizable: true,
        minWidth: 170,
        sortable: true,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
    {
        field: 'specifiedDate', headerName: 'Date',
        minWidth: 115,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: 'agDateColumnFilter',
        valueGetter: params => {
            const dateStr = params.data?.specifiedDate;
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: params => {
            const d = params.value;
            return d ? d.toLocaleDateString() : '';
        }
    },
    {
        headerName: 'User',
        field: "mediaBuyerName",
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agTextColumnFilter",
    },
    {
        field: "spend",
        aggFunc: spender,
        valueFormatter: params => {
            return `$${parseFloat(params.value || 0).toFixed(2)}`;
        },
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Revenue',
        field: "estimated_revenue",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: "profit",
        aggFunc: spender,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: avgRpcCpl,
        aggFunc: rpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        valueGetter: avgCpl,
        aggFunc: cplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ncpl',
        headerName: 'NCPL',
        valueGetter: avgNCPL,
        aggFunc: ncplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpc',
        headerName: 'CPC',
        valueGetter: avgCPC,
        aggFunc: cpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpclinkclicks',
        headerName: 'CPCLinkClicks',
        valueGetter: avgCPCLinkClikcs,
        aggFunc: cpcLinkClicksAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'Filteration',
        headerName: 'Filteration',
        valueGetter: avgFilteration,
        aggFunc: filterationAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ctr',
        headerName: 'CTR',
        valueGetter: avgCTR,
        aggFunc: ctrAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'conversions',
        headerName: 'Conv',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbLeads',
        headerName: 'Fb leads',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbClicks',
        headerName: 'Fb clicks',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 105,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'impressions',
        headerName: 'Imp',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: "fbLinkClicks",
        headerName: 'Fb link clicks',
        aggFunc: spender,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpm',
        headerName: 'CPM',
        valueGetter: avgCPM,
        aggFunc: cpmAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'roi',
        headerName: 'ROI',
        valueGetter: avgROI,
        aggFunc: roiAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'margin',
        headerName: 'Margin',
        valueGetter: avgMARGIN,
        aggFunc: marginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fmargin',
        headerName: 'FMargin',
        valueGetter: avgFMARGIN,
        aggFunc: fMarginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
]
const columnDefs1 = [
    {
        headerName: "Account number",
        field: "accountNumber",
        resizable: true,
        sortable: true,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        minWidth: 170


    },
    {
        field: 'specifiedDate', headerName: 'Date',
        suppressMenu: true,
        minWidth: 108,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: 'agDateColumnFilter',
        valueGetter: params => {
            const dateStr = params.data?.specifiedDate;
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: params => {
            const d = params.value;
            return d ? d.toLocaleDateString() : '';
        }
    },
    {
        field: "spend",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Revenue',
        field: "estimated_revenue",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: "profit",
        aggFunc: spender,
        sort: 'desc',
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        valueFormatter: currencyFormatter,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: avgRpcCpl,
        aggFunc: rpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        valueGetter: avgCpl,
        aggFunc: cplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ncpl',
        headerName: 'NCPL',
        valueGetter: avgNCPL,
        aggFunc: ncplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpc',
        headerName: 'CPC',
        valueGetter: avgCPC,
        aggFunc: cpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpclinkclicks',
        headerName: 'CPCLinkClicks',
        valueGetter: avgCPCLinkClikcs,
        aggFunc: cpcLinkClicksAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'Filteration',
        headerName: 'Filteration',
        valueGetter: avgFilteration,
        aggFunc: filterationAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ctr',
        headerName: 'CTR',
        valueGetter: avgCTR,
        aggFunc: ctrAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'conversions',
        headerName: 'Conv',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbLeads',
        headerName: 'Fb leads',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbClicks',
        headerName: 'Fb clicks',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'impressions',
        headerName: 'Imp',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: "fbLinkClicks",
        headerName: 'Fb link clicks',
        aggFunc: spender,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpm',
        headerName: 'CPM',
        valueGetter: avgCPM,
        aggFunc: cpmAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'roi',
        headerName: 'ROI',
        valueGetter: avgROI,
        aggFunc: roiAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'margin',
        headerName: 'Margin',
        valueGetter: avgMARGIN,
        aggFunc: marginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fmargin',
        headerName: 'FMargin',
        valueGetter: avgFMARGIN,
        aggFunc: fMarginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Project name',
        field: "revenuePartner",
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agTextColumnFilter",
    },
    {
        field: "holder",
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agTextColumnFilter",
    },
    {
        field: "mediaBuyerName", headerName: 'User',
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agTextColumnFilter",
    },
]
const columnDefs2 = [
    {
        headerName: 'Campaign name',
        field: 'campaign_id',
        sortable: true,
        filter: "agTextColumnFilter",
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 170,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
    },
    {
        field: "accountNumber", minWidth: 170, headerName: "Account number",
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",

    },
    {
        field: 'Date',
        minWidth: 112,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: 'agDateColumnFilter',
        valueGetter: params => {
            const dateStr = params.data?.Date;
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: params => {
            const d = params.value;
            return d ? d.toLocaleDateString() : '';
        }
    },
    {
        field: "spend",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        minWidth: 108,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Revenue',
        field: "estimated_revenue",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        minWidth: 108,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: "profit",
        aggFunc: spender,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        valueFormatter: currencyFormatter,
        minWidth: 108,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: avgRpcCpl,
        aggFunc: rpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        valueGetter: avgCpl,
        aggFunc: cplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ncpl',
        headerName: 'NCPL',
        valueGetter: avgNCPL,
        aggFunc: ncplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpc',
        headerName: 'CPC',
        valueGetter: avgCPC,
        aggFunc: cpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpclinkclicks',
        headerName: 'CPCLinkClicks',
        valueGetter: avgCPCLinkClikcs,
        aggFunc: cpcLinkClicksAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'Filteration',
        headerName: 'Filteration',
        valueGetter: avgFilteration,
        aggFunc: filterationAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ctr',
        headerName: 'CTR',
        valueGetter: avgCTR,
        aggFunc: ctrAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'conversions',
        headerName: 'Conv',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbLeads',
        headerName: 'Fb leads',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbClicks',
        headerName: 'Fb clicks',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'impressions',
        headerName: 'Imp',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: "fbLinkClicks",
        headerName: 'Fb link clicks',
        aggFunc: spender,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpm',
        headerName: 'CPM',
        valueGetter: avgCPM,
        aggFunc: cpmAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'roi',
        headerName: 'ROI',
        valueGetter: avgROI,
        aggFunc: roiAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'margin',
        headerName: 'Margin',
        valueGetter: avgMARGIN,
        aggFunc: marginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fmargin',
        headerName: 'FMargin',
        valueGetter: avgFMARGIN,
        aggFunc: fMarginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Project name',
        field: "revenuePartner",
        minWidth: 150,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
    {
        field: "holder",
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
    {
        field: "mediaBuyerName", headerName: 'User',
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
]
const columnDefs3 = [
    {
        field: 'domain', minWidth: 200, suppressAutoSize: true,
        resizable: true,
        sortable: true,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        filter: "agTextColumnFilter",
    },
    {
        field: "accountNumber", minWidth: 180, headerName: 'Account number',
        resizable: true,
        sortable: true,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",

    },
    {
        field: 'specifiedDate', headerName: "Date",
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: 'agDateColumnFilter',
        valueGetter: params => {
            const dateStr = params.data?.specifiedDate;
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: params => {
            const d = params.value;
            return d ? d.toLocaleDateString() : '';
        }
    },
    {
        field: "spend",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Revenue',
        field: "estimated_revenue",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: "profit",
        aggFunc: spender,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        valueFormatter: currencyFormatter,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: avgRpcCpl,
        aggFunc: rpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        valueGetter: avgCpl,
        aggFunc: cplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ncpl',
        headerName: 'NCPL',
        valueGetter: avgNCPL,
        aggFunc: ncplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpc',
        headerName: 'CPC',
        valueGetter: avgCPC,
        aggFunc: cpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpclinkclicks',
        headerName: 'CPCLinkClicks',
        valueGetter: avgCPCLinkClikcs,
        aggFunc: cpcLinkClicksAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'Filteration',
        headerName: 'Filteration',
        valueGetter: avgFilteration,
        aggFunc: filterationAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ctr',
        headerName: 'CTR',
        valueGetter: avgCTR,
        aggFunc: ctrAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'conversions',
        headerName: 'Conv',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbLeads',
        headerName: 'Fb leads',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbClicks',
        headerName: 'Fb clicks',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'impressions',
        headerName: 'Imp',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: "fbLinkClicks",
        headerName: 'Fb link clicks',
        aggFunc: spender,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpm',
        headerName: 'CPM',
        valueGetter: avgCPM,
        aggFunc: cpmAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'roi',
        headerName: 'ROI',
        valueGetter: avgROI,
        aggFunc: roiAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'margin',
        headerName: 'Margin',
        valueGetter: avgMARGIN,
        aggFunc: marginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fmargin',
        headerName: 'FMargin',
        valueGetter: avgFMARGIN,
        aggFunc: fMarginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Project name',
        field: "revenuePartner",
        minWidth: 180,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    }, // Group by Holder
    {
        field: "Holder",
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
    {
        field: "MediaBuyerName", headerName: 'User',
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
]
const columnDefs4 = [
    {
        field: 'BMName', minWidth: 200, suppressAutoSize: true, headerName: 'BM name',
        resizable: true,
        sortable: true,
        hide: true,
        rowGroup: true,
        enableRowGroup: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",
    },
    {
        field: "AgencyName", minWidth: 180, headerName: 'Agency name',
        resizable: true,
        sortable: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",

    }, // Group by Network
    {
        field: "accountNumber", minWidth: 180, headerName: 'Account number',
        resizable: true,
        sortable: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",

    },
    {
        field: "accountName", minWidth: 180, headerName: 'Account name',
        resizable: true,
        sortable: true,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agTextColumnFilter",

    },
    {
        field: 'specifiedDate', headerName: "Date",
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: 'agDateColumnFilter',
        valueGetter: params => {
            const dateStr = params.data?.specifiedDate;
            if (!dateStr) return null;
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        },
        valueFormatter: params => {
            const d = params.value;
            return d ? d.toLocaleDateString() : '';
        }
    },
    {
        field: "spend",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        headerName: 'Revenue',
        field: "estimated_revenue",
        aggFunc: spender,
        valueFormatter: currencyFormatter,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: "profit",
        aggFunc: spender,
        cellClassRules: {
            'font-red': p => p.value < 0,
            'font-green': params => params.value > 0,
        },
        valueFormatter: currencyFormatter,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'rpc',
        headerName: 'RPC',
        valueGetter: avgRpcCpl,
        aggFunc: rpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpl',
        headerName: 'CPL',
        valueGetter: avgCpl,
        aggFunc: cplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ncpl',
        headerName: 'NCPL',
        valueGetter: avgNCPL,
        aggFunc: ncplAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpc',
        headerName: 'CPC',
        valueGetter: avgCPC,
        aggFunc: cpcAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpclinkclicks',
        headerName: 'CPCLinkClicks',
        valueGetter: avgCPCLinkClikcs,
        aggFunc: cpcLinkClicksAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'Filteration',
        headerName: 'Filteration',
        valueGetter: avgFilteration,
        aggFunc: filterationAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'ctr',
        headerName: 'CTR',
        valueGetter: avgCTR,
        aggFunc: ctrAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'conversions',
        headerName: 'Conv',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbLeads',
        headerName: 'Fb leads',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: "fbLinkClicks",
        aggFunc: spender,
        minWidth: 125,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fbClicks',
        headerName: 'Fb clicks',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 108,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'impressions',
        headerName: 'Imp',
        aggFunc: spender,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'cpm',
        headerName: 'CPM',
        valueGetter: avgCPM,
        aggFunc: cpmAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'roi',
        headerName: 'ROI',
        valueGetter: avgROI,
        aggFunc: roiAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'margin',
        headerName: 'Margin',
        valueGetter: avgMARGIN,
        aggFunc: marginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
    {
        field: 'fmargin',
        headerName: 'FMargin',
        valueGetter: avgFMARGIN,
        aggFunc: fMarginAggFunc,
        suppressMenu: true,
        menuTabs: [],
        headerClass: 'hide-menu',
        minWidth: 95,
        filter: "agNumberColumnFilter",
    },
]

export { columnDefs, columnDefs1, columnDefs2, columnDefs3, columnDefs4 }