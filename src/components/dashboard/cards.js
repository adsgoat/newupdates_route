"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import { Card, Tooltip, Skeleton } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons"
function getTotalEstimatedRevenue(fullData) {
    const total = fullData?.reduce((sum, item) => {
        // Check if 'estimated_revenue' exists in the object and is a number
        if (item.estimated_revenue && typeof item.estimated_revenue === 'number') {
            return sum + item.estimated_revenue;
        }
        return sum;
    }, 0); // Start the sum at 0

    // Round the final total to 2 decimal places
    return Math.round(total * 100) / 100;
}
function getTotalEstimatedSpend(fullData) {
    const total = fullData?.reduce((sum, item) => {
        // Check if 'estimated_revenue' exists in the object and is a number
        if (item.spend) {
            return sum + parseFloat(item.spend);
        }
        return sum;
    }, 0); // Start the sum at 0

    // Round the final total to 2 decimal places
    return Math.round(total * 100) / 100;
}
function getTotalEstimatedProfit(fullData) {
    return Math.round((getTotalEstimatedRevenue(fullData) - getTotalEstimatedSpend(fullData)) * 100) / 100;
}
function getTotalLeads(fullData) {
    const total = fullData?.reduce((sum, item) => {
        // Check if 'estimated_revenue' exists in the object and is a number
        if (item.fbLeads) {
            return sum + parseInt(item.fbLeads);
        }
        return sum;
    }, 0); // Start the sum at 0

    // Round the final total to 2 decimal places
    return total;
}
function getTotalConversions(fullData, collectionName) {
    if (collectionName?.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC") {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.ad_clicks) {
                return sum + parseInt(item.ad_clicks);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;

    }
    else {
        const total = fullData?.reduce((sum, item) => {
            // Check if 'estimated_revenue' exists in the object and is a number
            if (item.conversions) {
                return sum + parseInt(item.conversions);
            }
            return sum;
        }, 0); // Start the sum at 0

        // Round the final total to 2 decimal places
        return total;
    }
}
function getTotalFbClicks(fullData) {
    const total = fullData?.reduce((sum, item) => {
        // Check if 'estimated_revenue' exists in the object and is a number
        if (item.fbClicks) {
            return sum + parseInt(item.fbClicks);
        }
        return sum;
    }, 0); // Start the sum at 0

    // Round the final total to 2 decimal places
    return total;
}
function getAverageEstimatedCpc(fullData) {
    return Math.round((getTotalEstimatedSpend(fullData) / getTotalFbClicks(fullData)) * 100) / 100;
}
function getTotalImpressions(fullData) {
    const total = fullData?.reduce((sum, item) => {
        // Check if 'estimated_revenue' exists in the object and is a number
        if (item.impressions) {
            return sum + parseInt(item.impressions);
        }
        return sum;
    }, 0);
    return total;
}
function getTotalNcpl(fullData, collectionName) {
    return getTotalConversions(fullData, collectionName) > 0 ? Math.round((getTotalEstimatedSpend(fullData) / getTotalConversions(fullData, collectionName)) * 100) / 100 : 0;
}
function getTotalRpc(fullData, collectionName) {
    return getTotalConversions(fullData, collectionName) > 0 ? Math.round((getTotalEstimatedRevenue(fullData) / getTotalConversions(fullData, collectionName)) * 100) / 100 : 0;
}
function getTotalCpl(fullData) {
    return Math.round((getTotalEstimatedSpend(fullData) / getTotalLeads(fullData)) * 100) / 100;
}
function getTotalROI(fullData) {
    return getTotalEstimatedSpend(fullData) > 0 ? Math.round((((getTotalEstimatedRevenue(fullData) - getTotalEstimatedSpend(fullData)) / getTotalEstimatedSpend(fullData)) * 100) * 100) / 100 : 0;
}
function getAverageFilteration(fullData, collectionName) {
    return Math.round((((getTotalLeads(fullData) - (getTotalConversions(fullData, collectionName))) / (getTotalLeads(fullData))) * 100) * 100) / 100
}
function getTotalCtr(fullData) {
    return Math.round(((getTotalFbClicks(fullData) / getTotalImpressions(fullData)) * 100) * 100) / 100;
}
export default function Cards({ skeletonLoading, previousDataDates, theme, data, previousData, selectedItems }) {


    const transformObjectKeys = (obj) => {
        const transformedObject = {};

        Object.keys(obj).forEach((key) => {
            // Split the key by underscore
            const splitKey = key.split('_');

            // Join the array back into a string for the new key
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

    const emptyMetrics = {
        revenue: 0,
        spend: 0,
        profit: 0,
        leads: 0,
        conversions: 0,
        cpc: 0,
        ncpl: 0,
        cpl: 0,
        ctr: 0,
        rpc: 0,
        roi: 0,
        filteration: 0,
    };

    const metricsData = useMemo(() => {
        if (data === null) return {
            current: emptyMetrics,
            previous: emptyMetrics,
        }
        if (!data?.length) {
            return {
                current: emptyMetrics,
                previous: emptyMetrics,
            };
        }

        return {
            current: {
                revenue: getTotalEstimatedRevenue(data),
                spend: getTotalEstimatedSpend(data),
                profit: getTotalEstimatedProfit(data),
                leads: getTotalLeads(data),
                conversions: getTotalConversions(data, collectionName),
                cpc: getAverageEstimatedCpc(data),
                ncpl: getTotalNcpl(data, collectionName),
                cpl: getTotalCpl(data),
                ctr: getTotalCtr(data),
                rpc: getTotalRpc(data, collectionName),
                roi: getTotalROI(data),
                filteration: getAverageFilteration(data, collectionName),
            },
            previous: {
                revenue: getTotalEstimatedRevenue(previousData),
                spend: getTotalEstimatedSpend(previousData),
                profit: getTotalEstimatedProfit(previousData),
                leads: getTotalLeads(previousData),
                conversions: getTotalConversions(previousData, collectionName),
                cpc: getAverageEstimatedCpc(previousData),
                ncpl: getTotalNcpl(previousData, collectionName),
                cpl: getTotalCpl(previousData),
                ctr: getTotalCtr(previousData),
                rpc: getTotalRpc(previousData, collectionName),
                roi: getTotalROI(previousData),
                filteration: getAverageFilteration(previousData, collectionName),
            },
        };
    }, [data, previousData, collectionName]);

    const percentage = (current, previous) =>
        previous === 0
            ? 0
            : ((Number(current) - Number(previous)) / Math.abs(Number(previous))) * 100;
    const hasData = Array.isArray(data) && data.length > 0;
    const metrics = [
        {
            key: "revenue",
            label: "Revenue",
            color: "#00C853",
            prefix: "$",
            value: hasData ? metricsData.current.revenue : 0,
            comparater: hasData ? metricsData.previous.revenue : 0,
            camparisionPercentage: percentage(metricsData.current.revenue, metricsData.previous.revenue)
        },
        {
            key: "profit",
            label: "Profit",
            color: "#26A69A",
            prefix: "$",
            value: hasData ? metricsData.current.profit : 0,
            comparater: hasData ? metricsData.previous.profit : 0,
            camparisionPercentage: percentage(metricsData.current.profit, metricsData.previous.profit)
        },
        {
            key: "spend",
            label: "Amount Spent",
            color: "#3F51B5",
            prefix: "$",
            value: hasData ? metricsData.current.spend : 0,
            comparater: hasData ? metricsData.previous.spend : 0,
            camparisionPercentage: percentage(metricsData.current.spend, metricsData.previous.spend)
        },
        {
            key: "leads",
            label: "Leads",
            color: "#FFC107",
            value: hasData ? metricsData.current.leads : 0,
            comparater: hasData ? metricsData.previous.leads : 0,
            camparisionPercentage: percentage(metricsData.current.leads, metricsData.previous.leads)
        },
        {
            key: "conversions",
            label: "Conversions",
            color: "#673AB7",
            value: hasData ? metricsData.current.conversions : 0,
            comparater: hasData ? metricsData.previous.conversions : 0,
            camparisionPercentage: percentage(metricsData.current.conversions, metricsData.previous.conversions)
        },
        {
            key: "ncpl",
            label: "NCPL",
            color: "#AED581",
            value: hasData ? metricsData.current.ncpl : 0,
            comparater: hasData ? metricsData.previous.ncpl : 0,
            camparisionPercentage: percentage(metricsData.current.ncpl, metricsData.previous.ncpl)
        },
        {
            key: "cpl",
            label: "CPL",
            color: "#FF9800",
            value: hasData
                ? (metricsData.current.cpl === Infinity ? 0 : metricsData.current.cpl)
                : 0,
            comparater: hasData ? metricsData.previous.cpl : 0,
            camparisionPercentage: percentage(metricsData.current.cpl, metricsData.previous.cpl)
        },
        {
            key: "ctr",
            label: "CTR",
            color: "#2196F3",
            value: hasData ? metricsData.current.ctr : 0,
            comparater: hasData ? metricsData.previous.ctr : 0,
            camparisionPercentage: percentage(metricsData.current.ctr, metricsData.previous.ctr)
        },
        {
            key: "cpc",
            label: "CPC",
            color: "#F44336",
            value: hasData ? metricsData.current.cpc : 0,
            comparater: hasData ? metricsData.previous.cpc : 0,
            camparisionPercentage: percentage(metricsData.current.cpc, metricsData.previous.cpc)
        },
        {
            key: "rpc",
            label: "RPC",
            color: "#00ACC1",
            value: hasData ? metricsData.current.rpc : 0,
            comparater: hasData ? metricsData.previous.rpc : 0,
            camparisionPercentage: percentage(metricsData.current.rpc, metricsData.previous.rpc)
        },
        {
            key: "roi",
            label: "ROI",
            color: "#00C853",
            value: hasData ? metricsData.current.roi : 0,
            comparater: hasData ? metricsData.previous.roi : 0,
            camparisionPercentage: percentage(metricsData.current.roi, metricsData.previous.roi)
        },
        {
            key: "filteration",
            label: "Filteration",
            color: "#AED581",
            value: hasData ? `${metricsData.current.filteration}%` : 0,
            comparater: hasData ? `${metricsData.previous.filteration}%` : 0,
            camparisionPercentage: percentage(
                metricsData.current.filteration,
                metricsData.previous.filteration
            )
        }
    ];


    return (
        skeletonLoading
            ?
            (<div>
                <Skeleton active
                    title={false}
                    paragraph={{
                        rows: 2,
                    }}
                    className={theme === "dark" ? "dark-skeleton" : ""}
                />
            </div>)
            :
            (
                <div className="metrics-container">
                    <div className="metrics-grid">
                        {metrics.map((m, i) => (
                            <Card className="metric-card" key={i}
                                // bordered={false}
                                variant="borderless"
                                style={{
                                    backgroundColor: theme === "dark" ? "#2F2F2F" : "white"
                                }}>
                                <div className="metric-title" style={{ color: m.color }}>
                                    <span className="dot" style={{ backgroundColor: m.color }}></span>
                                    {m.label}
                                </div>

                                <div className="metric-value"
                                    style={{
                                        color: theme === "dark" ? "#fff" : "#3A9100"  // <-- VALUE COLOR HERE
                                    }}
                                >
                                    {m.prefix ? m.prefix + " " : ""}{m.value}
                                </div>
                                {m.camparisionPercentage !== undefined && (
                                    <Tooltip
                                        color={theme === "dark" ? "#111" : "#fff"}
                                        styles={{
                                            body: {
                                                backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                                color: theme === 'dark' ? '#fff' : '#000',
                                                border: '1px solid #ccc',
                                                borderRadius: 6,
                                            }
                                        }}
                                        title={<div style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: 10 }}>
                                            Prev : {previousDataDates.start}-{previousDataDates.end}
                                            <br />
                                            Value : {m.comparater}
                                        </div>}>
                                        <div className="metric-comparater" style={{ color: theme === "dark" ? "#fff" : "#666" }}>
                                            {m.camparisionPercentage > 0 ? (<ArrowUpOutlined className="anticon-1" style={{ color: 'green', marginRight: 4 }} />) : (<ArrowDownOutlined className="anticon anticon-2" style={{ color: 'red', marginRight: 4 }} />)}
                                            <span style={{ color: m.camparisionPercentage > 0 ? 'green' : 'red' }}>{Math.abs(Number(m.camparisionPercentage.toFixed(2)))}%</span>
                                        </div>
                                    </Tooltip>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )

    )
}