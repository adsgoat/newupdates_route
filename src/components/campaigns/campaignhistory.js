"use client";

import { useEffect, useState } from "react";
import { Table, Empty, Typography, Space, Tag, Select, Skeleton, Tooltip } from "antd";
import { ClockCircleOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment-timezone";

const { Text, Title } = Typography;

const timeZoneShortToFull = {
    EDT: "America/New_York",
    UTC: "Atlantic/Azores",
    EEST: "Europe/Athens",
    CST: "America/Mexico_City",
    PDT: "America/Los_Angeles",
    BST: "Europe/London",
    GMT: "Africa/Accra",
    IST: "Asia/Kolkata",
    MST: "America/Dawson",
    CDT: "America/Chicago",
    AST: "America/Puerto_Rico",
    DST: "Asia/Dubai",
    HST: "Pacific/Honolulu",
    EST: "America/Toronto",
    CEST: "Europe/Paris",
    CET: "Europe/Berlin",
};

export default function CampaignHistory({ account, id, type, theme, userData }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activityFilter, setActivityFilter] = useState("All");
    const [storageData, setStorageData] = useState([]);
    const [changedByOptions, setChangedByOptions] = useState([
        { label: "Anyone", value: "all" },
    ]);
    const [activityTypeFilter, setActivityTypeFilter] = useState("all");
    const [changedByFilter, setChangedByFilter] = useState("all");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const getAccountTimezone = (accountNumber, adAccounts) => {
        const accounts = Object.values(adAccounts || {}).flat();
        const acc = accounts.find(
            (a) => String(a.accountNumber) === String(accountNumber)
        );
        return timeZoneShortToFull[acc?.timeZone] || "Asia/Kolkata";
    };

    const convertToTimezoneAndFormat = (date, targetTz) => {
        const m = moment.tz(date, "DD-MM-YYYY hh:mm A", "Asia/Kolkata");

        return m
            .tz(targetTz)
            .isSame(moment().tz(targetTz), "year")
            ? m.tz(targetTz).format("DD MMM [at] HH:mm")
            : m.tz(targetTz).format("MMM DD, YYYY [at] h:mm A");
    };

    useEffect(() => {
        if (!account || !id) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/campaigns/campaign/history?id=${id}`);
                // console.log(res?.data)
                const history = res?.data?.data?.activityHistory || [];
                const accountNumber = history?.[0]?.accountNumber || history?.[0]?.Account;
                const accountTz = getAccountTimezone(accountNumber, userData);

                const formattedHistory = history.map((item, index) => ({
                    ...item,
                    _rawUpdateAt: item.updateAt,
                    updateAt: convertToTimezoneAndFormat(item.updateAt, "Asia/Kolkata"),
                    account: convertToTimezoneAndFormat(item.updateAt, accountTz),
                    _rowKey: index
                }));



                const updatedByOptions = Array.from(
                    new Map(
                        formattedHistory
                            .filter((i) => i.updatedBy)
                            .map((i) => [
                                i.updatedBy.trim().toLowerCase(),
                                { label: i.updatedBy.trim(), value: i.updatedBy.trim() },
                            ])
                    ).values()
                );

                setChangedByOptions([
                    { label: "Anyone", value: "all" },
                    ...updatedByOptions,
                ]);

                setStorageData(formattedHistory);
                setData(formattedHistory);
                // setData(res?.data?.data?.activityHistory || []);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [account, id]);

    const textColor = {
        color: theme === "dark" ? "#fff" : "#000"
    };

    const renderReadableExtraData = (extra, eventType) => {
        if (!extra || typeof extra !== "object" || !Object.keys(extra).length)
            return <Text style={textColor}>—</Text>;

        const safeVal = v =>
            v == null ? "-" : typeof v === "object" ? JSON.stringify(v) : String(v);

        const extractValue = (obj, key) =>
            !obj
                ? "-"
                : typeof obj !== "object"
                    ? obj
                    : obj[key] ?? obj.new_value ?? obj.old_value ?? safeVal(obj);

        if (eventType?.startsWith("create_"))
            return <Text style={textColor}>—</Text>;

        let sentence = "";

        if (extra.type === "run_status" || extra.run_status) {
            const oldV =
                extra.old_value || extractValue(extra.run_status, "old_value");
            const newV =
                extra.new_value || extractValue(extra.run_status, "new_value");

            sentence =
                !oldV || oldV === "-" || oldV === newV
                    ? `Status set to ${newV}`
                    : `Status changed from ${oldV} → ${newV}`;
        } else if (extra.type === "composite_data") {
            const oldVal = extra.old_value || {};
            const newVal = extra.new_value || {};

            if (!extra.old_value && !extra.new_value && Object.keys(extra).length === 1) {
                sentence = "—";
            } else {
                const oldBudget = extractValue(oldVal, "old_value");
                const newBudget = extractValue(newVal, "new_value");

                if (
                    oldVal.type === "payment_amount" &&
                    newVal.type === "payment_amount"
                ) {
                    sentence = `Budget changed from ${oldBudget} ${oldVal.currency || ""
                        } → ${newBudget} ${newVal.currency || ""}${newVal.additional_value ? ` (${newVal.additional_value})` : ""
                        }`;
                } else if (newVal.type === "payment_amount") {
                    sentence = `Budget set to ${newBudget} ${newVal.currency || ""
                        }${newVal.additional_value ? ` (${newVal.additional_value})` : ""
                        }`;
                } else {
                    sentence = "Composite data updated";
                }
            }
        } else if (
            extra.type === "targets_spec" ||
            extra.type === "target_spec" ||
            Array.isArray(extra.old_value) ||
            Array.isArray(extra.new_value)
        ) {
            try {
                const oldTargets = Array.isArray(extra.old_value)
                    ? extra.old_value
                    : [];
                const newTargets = Array.isArray(extra.new_value)
                    ? extra.new_value
                    : [];

                const shorten = str =>
                    str.length > 120 ? `${str.slice(0, 120)}...` : str;

                const changes = [];

                oldTargets.forEach((item, i) => {
                    const field =
                        item.content?.replace(":", "")?.trim() || "Field";
                    const oldText = (item.children || []).join(", ");
                    const newText = (newTargets[i]?.children || []).join(", ");

                    if (oldText !== newText) {
                        changes.push(
                            `${field}: ${shorten(oldText || "-")} → ${shorten(
                                newText || "-"
                            )}`
                        );
                    }
                });

                sentence = changes.length
                    ? `Targeting updated — ${changes.join("; ")}`
                    : "Targeting updated";
            } catch {
                sentence = "Targeting updated";
            }
        } else if (extra.type === "optimization_goal") {
            const oldVal = extractValue(extra, "old_value");
            const newVal = extractValue(extra, "new_value");

            sentence =
                !oldVal || oldVal === "-" || oldVal === newVal
                    ? `Optimization goal set to ${newVal}`
                    : `Optimization goal changed from ${oldVal} → ${newVal}`;
        } else if (
            extra.old_value !== undefined &&
            extra.new_value !== undefined
        ) {
            const oldVal = extractValue(extra, "old_value");
            const newVal = extractValue(extra, "new_value");

            sentence =
                !oldVal || oldVal === "-" || oldVal === newVal
                    ? `Set to ${newVal}`
                    : `Changed from ${oldVal} → ${newVal}`;
        }

        if (!sentence) {
            for (const [key, value] of Object.entries(extra)) {
                if (
                    value &&
                    typeof value === "object" &&
                    value.old_value !== undefined &&
                    value.new_value !== undefined
                ) {
                    const oldVal = extractValue(value, "old_value");
                    const newVal = extractValue(value, "new_value");

                    sentence =
                        !oldVal || oldVal === "-" || oldVal === newVal
                            ? `${key.replace(/_/g, " ")} set to ${newVal}`
                            : `${key.replace(
                                /_/g,
                                " "
                            )} changed from ${oldVal} → ${newVal}`;

                    break;
                }
            }
        }

        return (
            <Text style={textColor}>
                {sentence?.trim() && sentence !== "{}" ? sentence : "—"}
            </Text>
        );
    };

    const renderActivityDetails = record => (
        <div className="campaigns-history-details">
            {(record.old_value || record.new_value) && (
                <Text style={textColor}>
                    From{" "}
                    <Tag color={theme === "dark" ? "#444" : "default"}>
                        {record.old_value || "-"}
                    </Tag>
                    {" → "}
                    <Tag color={theme === "dark" ? "#595959" : "#91c25f"}>
                        {record.new_value || "-"}
                    </Tag>
                </Text>
            )}

            {renderReadableExtraData(record.extra_data, record.event_type)}
        </div>
    );

    const columns = [
        {
            title: "Activity", dataIndex: "updateType",
            width: 150,
            render: value => {
                return (
                    <Text style={{ fontSize: 11, color: theme === "dark" ? "white" : "" }}>
                        {value}
                    </Text>
                )
            }
        },

        {
            title: "Activity details",
            dataIndex: "updateDetail",
            width: 320,
            render: (value) => {
                if (!value) return null;

                const items = Array.isArray(value) ? value : [value];
                const filtered = items.filter((item) => {
                    const text = item.replace(/\s/g, "");
                    return !(
                        text.includes("null→null") ||
                        text.includes("null→[]") ||
                        text.includes("[]→[]")
                    );
                });

                if (!filtered.length) return null;

                const isLong = filtered.length > 2 || filtered.join("").length > 80;

                const tooltipContent = (
                    <div style={{ maxHeight: 250, overflowY: "auto" }}>
                        {filtered.map((item, i) => (
                            <div key={i}>{item}</div>
                        ))}
                    </div>
                );

                if (isLong) {
                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                            <span
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 220,
                                }}
                            >
                                {filtered[0]}
                            </span>
                            <Tooltip
                                title={tooltipContent}
                                placement="topLeft"
                                styles={{
                                    container: {
                                        backgroundColor:
                                            theme === "dark" ? "#2b2b2b" : "#ffffff",
                                        color: theme === "dark" ? "#ffffff" : "#000000",
                                        fontSize: 11
                                    }
                                }}
                            >
                                <InfoCircleOutlined
                                    style={{ fontSize: 14, color: "#1890ff", cursor: "pointer" }}
                                />
                            </Tooltip>
                        </div>
                    );
                }

                return (
                    <div style={{ fontSize: 11 }}>
                        {filtered.map((item, i) => (
                            <div key={i}>{item}</div>
                        ))}
                    </div>
                );
            },
        },

        {
            title: "Item changed",
            render: (_, record) => {
                let name = "";
                let type = "";
                let id = "";

                if (record.level === "campaign") {
                    name = record.campaignname;
                    type = "Campaign ID";
                    id = record.campaignid;
                } else if (record.level === "adset") {
                    name = record.adsetname;
                    type = "Ad Set ID";
                    id = record.adsetid;
                } else if (record.level === "ad") {
                    name = record.adname;
                    type = "Ad ID";
                    id = record.adid;
                }

                return (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11 }}>{name}</div>
                        {id && (
                            <div style={{ fontSize: 12 }}>
                                {type}: {id}
                            </div>
                        )}
                    </div>
                );
            },
        },

        {
            title: "Changed by", dataIndex: "updatedBy",
            width: 120,
            render: value => {
                return (
                    <Text style={{ fontSize: 11, color: theme === "dark" ? "white" : "" }}>
                        {value}
                    </Text>
                )
            }
        },

        {
            title: "Date and time",
            align: "center",
            render: (_, record) => (
                <div style={{ fontSize: 10 }}>
                    <div>IST: {record.updateAt}</div>
                    <div>Acc TZ: {record.account}</div>
                </div>
            ),
        },
    ];

    useEffect(() => {
        let filtered = [...storageData];

        switch (activityTypeFilter) {
            case "campaigns":
                filtered = filtered.filter((i) => i.level === "campaign");
                break;
            case "adsets":
                filtered = filtered.filter((i) => i.level === "adset");
                break;
            case "ads":
                filtered = filtered.filter((i) => i.level === "ad");
                break;
            case "budget":
                filtered = filtered.filter((i) => i.editType === "BUDGET");
                break;
            case "status":
                filtered = filtered.filter((i) => i.editType === "STATUS");
                break;
            case "approve":
                filtered = filtered.filter((i) => i.editType === "APPROVE");
                break;
            case "reject":
                filtered = filtered.filter((i) => i.editType === "REJECT");
                break;
            case "comment":
                filtered = filtered.filter((i) => i.editType === "COMMENT");
                break;
            case "edit":
                filtered = filtered.filter((i) => i.editType === "EDIT");
                break;
            case "category":
                filtered = filtered.filter((i) => i.editType === "CATEGORY");
                break;
            default:
                break;
        }

        if (changedByFilter !== "all") {
            filtered = filtered.filter((i) => i.updatedBy === changedByFilter);
        }

        setData(filtered);
    }, [activityTypeFilter, changedByFilter, storageData]);

    const filteredData = data
        .map((item, index) => ({
            ...item,
            _rowKey: index
        }))
        .filter(item => {
            if (activityFilter === "All") return true;

            const name = (item.event_type || "").toLowerCase();

            return (
                {
                    Bid: name.includes("bid"),
                    Budget: name.includes("budget"),
                    Schedule:
                        name.includes("schedule") || name.includes("time"),
                    "Run Status":
                        name.includes("run_status") || name.includes("status"),
                    Targeting: name.includes("target")
                }[activityFilter] ?? true
            );
        });

    return (
        <div
            className={`campaigns-history ${theme === "dark"
                ? "campaigns-history-dark"
                : "campaigns-history-light"
                }`}
            style={{ height: "100%" }}
        >
            <div className="campaigns-history-header">

                <Select
                    size="small"
                    labelInValue
                    defaultValue={{ label: "All", value: "all" }}
                    labelRender={(o) => `Activity history: ${o.label}`}
                    options={[
                        { label: "All", value: "all" },
                        { label: "Campaigns", value: "campaigns" },
                        { label: "Ad Sets", value: "adsets" },
                        { label: "Ads", value: "ads" },
                        { label: "Budget", value: "budget" },
                        { label: "Status", value: "status" },
                        { label: "Category", value: "category" },
                        { label: "Comment", value: "comment" },
                        { label: "Approve", value: "approve" },
                        { label: "Reject", value: "reject" },
                        { label: "Edit", value: "edit" },
                    ]}
                    onChange={(v) => setActivityTypeFilter(v.value)}
                    style={{ width: 180 }}
                    className="campaigns-history-select"
                    classNames={{
                        popup: {
                            root: theme === "dark"
                                ? "campaigns-history-select-dropdown-dark"
                                : "campaigns-history-select-dropdown-light"
                        }
                    }}
                />

                <Select
                    size="small"
                    labelInValue
                    defaultValue={{ label: "Anyone", value: "all" }}
                    labelRender={(o) => `Changed by: ${o.label}`}
                    options={changedByOptions}
                    onChange={(v) => setChangedByFilter(v.value)}
                    style={{ width: 180 }}
                    className="campaigns-history-select"
                    classNames={{
                        popup: {
                            root: theme === "dark"
                                ? "campaigns-history-select-dropdown-dark"
                                : "campaigns-history-select-dropdown-light"
                        }
                    }}
                />
            </div>

            {loading ? (
                <div className="campaigns-history-loading">
                    <Skeleton active paragraph={{ rows: 12 }} />
                </div>
            ) : data.length ? (
                <div className="campaigns-history-table">
                    <Table
                        columns={columns}
                        dataSource={[...data].sort(
                            (a, b) =>
                                moment(b._rawUpdateAt, "DD-MM-YYYY hh:mm A").valueOf() -
                                moment(a._rawUpdateAt, "DD-MM-YYYY hh:mm A").valueOf()
                        )}
                        rowKey="_rowKey"
                        bordered
                        pagination={false}
                        scroll={{
                            x: "max-content",
                            y: "calc(90vh - 120px)"
                        }}
                    />
                </div>
            ) : (
                <Empty
                    description={
                        <span style={textColor}>No activity found</span>
                    }
                />
            )}
        </div>
    );
}