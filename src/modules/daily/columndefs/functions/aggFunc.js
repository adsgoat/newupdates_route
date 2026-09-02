const liveSpender = (params) => {
    const total = params.values.reduce((acc, value) => acc + parseFloat(value || 0), 0);
    return Math.round(total * 100) / 100; // Round to 2 decimal places
};
const sanitizeNumericValue = (value) => {
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[%$,]/g, '').trim()) || 0;
    }
    return isNaN(value) || value === undefined || value === null ? 0 : value;
};

const newSpender = (params) => {
    var total = 0;
    params.values.forEach((value) => {
        if (value !== undefined) {
            return (
                (total += parseFloat(value))
            )
        }
    });
    var total1 = total.toString()
    var total2 = total1.split(".")
    if (total2[1] !== undefined && total2[1].length > 2) {
        var total22 = total2[1].slice(0, 2)
        var totalone = total2[0] + '.' + total22
        return parseFloat(totalone).toFixed(2)
    }
    return total;
}

const getCpc = (params) => {
    if (params.data) {
        const { spend, fbclicks } = params.data;

        if (!fbclicks) return 0;

        const cpc = spend / fbclicks;

        return isFinite(cpc) ? Number(cpc.toFixed(2)) : 0;
    }

    if (params.node?.aggData) {
        const { spend, fbclicks } = params.node.aggData;

        if (!fbclicks) return 0;

        const cpc = spend / fbclicks;

        return isFinite(cpc) ? Number(cpc.toFixed(2)) : 0;
    }

    return 0;
};

const getCpl = (params) => {
    if (params.data !== undefined) {
        const { fbleads, spend } = params.data;

        if (fbleads !== 0) {
            const CPL = spend / fbleads;
            if (CPL === Infinity) {
                return 0;
            }
            return Number(CPL.toFixed(2));

        }
    }
    if (params.node.aggData !== undefined) {
        const { fbleads, spend } = params.node.aggData;
        if (fbleads !== 0) {
            const CPL = spend / fbleads;
            if (CPL === Infinity) {
                return 0;
            }
            return Number(CPL.toFixed(2));
        }
    }

    return 0;
};

const getCpm = (params) => {
    if (params.data !== undefined) {
        const { impressions, spend } = params.data;

        if (impressions !== 0) {
            const CPL = (spend / impressions) * 1000;
            if (CPL === Infinity) {
                return 0;
            }
            return Number(CPL.toFixed(2));

        }
    }
    if (params.node.aggData !== undefined) {
        const { impressions, spend } = params.node.aggData;
        if (impressions !== 0) {
            const CPL = (spend / impressions) * 1000;
            if (CPL === Infinity) {
                return 0;
            }
            return Number(CPL.toFixed(2));
        }
    }

    return 0;
};

const getFilteration = (params) => {

    if (params.data !== undefined) {
        const { fbleads, conversions } = params.data;
        if (fbleads !== 0) {
            const RPC = ((parseInt(fbleads) - parseInt(conversions)) / parseInt(fbleads)) * 100;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return `${Number(RPC.toFixed(2))}`;

        }
    }
    if (params.node.aggData !== undefined) {
        const { fbleads, conversions } = params.node.aggData;
        if (fbleads !== 0) {
            const RPC = ((parseInt(fbleads) - parseInt(conversions)) / parseInt(fbleads)) * 100;
            return `${Number(RPC.toFixed(2))}`;
        }
    }

    return 0;
}

const getCpcLc = (params) => {
    if (params.data !== undefined) {
        const { spend, fblinkclicks } = params.data;
        if (fblinkclicks !== 0) {
            const RPC = spend / fblinkclicks;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));

        }
    }
    if (params.node.aggData !== undefined) {
        const { spend, fblinkclicks } = params.node.aggData;
        if (fblinkclicks !== 0) {
            const RPC = spend / fblinkclicks;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
}

const getRpc = (params) => {
    if (params.data !== undefined) {
        const { revenue, conversions } = params.data;
        if (conversions !== 0) {
            const RPC = revenue / conversions;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));

        }
    }
    if (params.node.aggData !== undefined) {
        const { revenue, conversions } = params.node.aggData;
        if (conversions !== 0) {
            const RPC = revenue / conversions;
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
}
const getCtr = (params) => {
    const data = params.node.group ? params.node.aggData : params.data;
    if (!data) return 0;

    const impressions = sanitizeNumericValue(data.impressions);
    const fbclicks = sanitizeNumericValue(data.fbclicks);

    if (isNaN(impressions) || impressions <= 0) return 0;

    const margin = (fbclicks / impressions) * 100;
    const roundedMargin = isFinite(margin) && !isNaN(margin) ? Math.round(margin * 100) / 100 : 0;

    if (params.node.group) {
        params.node.aggData["ctr"] = roundedMargin;
    }

    return roundedMargin;
}
const getDev = (params) => {
    const rpc = getRpc(params);
    if (params.data !== undefined) {
        const { fbleads } = params.data;

        if (fbleads !== 0) {
            const CPL = rpc * fbleads;
            if (CPL === Infinity) {
                return 0;
            }
            return CPL;

        }
    }
    if (params.node.aggData !== undefined) {
        const { fbleads } = params.node.aggData;
        if (fbleads !== 0) {
            const CPL = rpc * fbleads;
            return CPL;
        }
    }

    return 0;

}
const getFmargin = (params) => {
    const revenue = getDev(params);
    if (params.data !== undefined) {
        const { profit } = params.data;
        if (revenue !== 0) {
            const RPC = (profit / revenue) * 100;
            if (RPC === Infinity || isNaN(RPC) || RPC === -Infinity) {
                return 0;
            }
            return `${Number(RPC.toFixed(2))}`;

        }
    }
    if (params.node.aggData !== undefined) {
        const { profit } = params.node.aggData;
        if (revenue !== 0) {
            const RPC = (profit / revenue) * 100;
            return `${Number(RPC.toFixed(2))}`;
        }
    }

    return 0;
}
const getNcpl = (params) => {
    if (params.data !== undefined) {
        const { spend, conversions } = params.data;
        if (conversions !== 0) {
            const RPC = spend / conversions;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));

        }
    }
    if (params.node.aggData !== undefined) {
        const { spend, conversions } = params.node.aggData;
        if (conversions !== 0) {
            const RPC = spend / conversions;
            if (RPC === Infinity || isNaN(RPC)) {
                return 0;
            }
            return Number(RPC.toFixed(2));
        }
    }

    return 0;
}
const getMargin = (params) => {
    const data = params.node.group ? params.node.aggData : params.data;
    if (!data) return 0;

    const revenue = sanitizeNumericValue(data.revenue);
    const spend = sanitizeNumericValue(data.spend);

    if (isNaN(revenue) || revenue <= 0) return 0;

    const margin = ((revenue - spend) / revenue) * 100;
    const roundedMargin = isFinite(margin) && !isNaN(margin) ? Math.round(margin * 100) / 100 : 0;

    if (params.node.group) {
        params.node.aggData["margin"] = roundedMargin;
    }

    return roundedMargin;
};
const getROI = (params) => {
    const data = params.node.group ? params.node.aggData : params.data;
    if (!data) return 0;

    const revenue = sanitizeNumericValue(data.revenue);
    const spend = sanitizeNumericValue(data.spend);

    if (isNaN(spend) || spend <= 0) return 0;

    const margin = ((revenue - spend) / spend) * 100;
    const roundedMargin = isFinite(margin) && !isNaN(margin) ? Math.round(margin * 100) / 100 : 0;

    if (params.node.group) {
        params.node.aggData["roi"] = roundedMargin;
    }

    return roundedMargin;
}

export { liveSpender, newSpender, getCpm,  getFilteration, getCpc, getCpl, getRpc, getCtr, getFmargin, getNcpl, getMargin, getROI, getCpcLc }