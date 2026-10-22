
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Button,
    Card,
    Empty,
    Input,
    Modal,
    Select,
    Spin,
    Typography,
    message,
} from "antd";
import { FaPenToSquare, FaShareFromSquare, FaTrashCan } from "react-icons/fa6";

const { Text } = Typography;
const API = "https://fblaunching.vyaktimetrics.com/open/templates";

export default function CampaignTemplates({
    accounts = [],
    draftsByAccount = {},
    onSelectTemplate,
    theme = "light",
}) {
    const isDark = theme === "dark";
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [accountFilter, setAccountFilter] = useState("ALL");
    const [objectiveFilter, setObjectiveFilter] = useState("ALL");
    const [token, setToken] = useState("");
    const [deletedGroups, setDeletedGroups] = useState([]);

    const [shareOpen, setShareOpen] = useState(false);
    const [shareTemplate, setShareTemplate] = useState(null);
    const [shareAccounts, setShareAccounts] = useState([]);
    const [shareLoading, setShareLoading] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTemplate, setDeleteTemplate] = useState(null);
    const [deleteAccounts, setDeleteAccounts] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [accountsLoading, setAccountsLoading] = useState(false);

    useEffect(() => {
        setToken(localStorage.getItem("token") || "");
    }, []);

    const headers = useCallback(
        (json = false) => ({
            ...(json ? { "Content-Type": "application/json" } : {}),
            Authorization: token,
        }),
        [token]
    );

    const accountOptions = useMemo(() => {
        const list = Array.isArray(accounts) ? accounts : [accounts];

        const normalized = list
            .filter((item) => item != null && item !== "")
            .map((item) => {
                const value =
                    typeof item === "object"
                        ? item.accountNumber ??
                        item.Account_Number ??
                        item.value
                        : item;

                const label =
                    typeof item === "object"
                        ? item.accountName ??
                        item.Account_Name ??
                        item.label ??
                        value
                        : value;

                return value == null || value === ""
                    ? null
                    : {
                        value: String(value),
                        label: String(label ?? value),
                    };
            })
            .filter(Boolean);

        return [
            { value: "ALL", label: "All Accounts" },
            ...normalized.filter(
                (item, index) =>
                    normalized.findIndex(
                        (other) => other.value === item.value
                    ) === index
            ),
        ];
    }, [accounts]);

    // Read drafts exclusively from the account-wise response.
    const accountDrafts = useMemo(() => {
        if (
            !draftsByAccount ||
            typeof draftsByAccount !== "object" ||
            Array.isArray(draftsByAccount)
        ) {
            return [];
        }

        return Object.entries(draftsByAccount).flatMap(
            ([accountNumber, list]) =>
                (Array.isArray(list) ? list : []).map((draft) => ({
                    ...draft,
                    Account_Number:
                        draft.Account_Number ??
                        draft.accountNumber ??
                        accountNumber,
                }))
        );
    }, [draftsByAccount]);

    // Group copies of the same template across accounts.
    const groupedTemplates = useMemo(() => {
        const groups = new Map();

        accountDrafts.forEach((draft, index) => {
            const groupId =
                draft.groupId ??
                draft.draftId ??
                `${draft.Account_Number}-${draft.Draft_Name}-${index}`;

            const key = String(groupId);

            if (!groups.has(key)) {
                groups.set(key, {
                    ...draft,
                    groupId,
                    accounts: [],
                    accountDrafts: [],
                });
            }

            const group = groups.get(key);
            const account = draft.Account_Number;

            if (
                account != null &&
                !group.accounts.some(
                    (value) => String(value) === String(account)
                )
            ) {
                group.accounts.push(account);
            }

            group.accountDrafts.push(draft);
        });

        return [...groups.values()].filter(
            (draft) => !deletedGroups.includes(String(draft.groupId))
        );
    }, [accountDrafts, deletedGroups]);

    const objectiveOptions = useMemo(() => {
        const labels = {
            OUTCOME_LEADS: "Leads",
            OUTCOME_SALES: "Sales",
            OUTCOME_ENGAGEMENT: "Engagement",
            OUTCOME_AWARENESS: "Awareness",
            OUTCOME_TRAFFIC: "Traffic",
            OUTCOME_APP_PROMOTION: "App promotion",
        };

        const objectives = [
            ...new Set(
                accountDrafts
                    .map((draft) => draft.camapaignlevel?.Objectives)
                    .filter(Boolean)
            ),
        ];

        return [
            { value: "ALL", label: "All" },
            ...objectives.map((value) => ({
                value,
                label: labels[value] || value,
            })),
        ];
    }, [accountDrafts]);

    const filteredTemplates = useMemo(() => {
        const query = search.trim().toLowerCase();

        return groupedTemplates.filter((draft) => {
            const budget = Number(draft.camapaignlevel?.Daily_amount);
            const budgetText = Number.isFinite(budget)
                ? `${budget / 100} $${budget / 100} ${budget / 100}/day`
                : "";

            const matchesSearch =
                !query ||
                String(draft.Draft_Name || "")
                    .toLowerCase()
                    .includes(query) ||
                budgetText.toLowerCase().includes(query);

            const matchesAccount =
                accountFilter === "ALL" ||
                draft.accounts.some(
                    (account) => String(account) === String(accountFilter)
                );

            const matchesObjective =
                objectiveFilter === "ALL" ||
                draft.accountDrafts.some(
                    (item) =>
                        item.camapaignlevel?.Objectives === objectiveFilter
                );

            return matchesSearch && matchesAccount && matchesObjective;
        });
    }, [groupedTemplates, search, accountFilter, objectiveFilter]);

    const openTemplates = () => {
        setSearch("");
        setAccountFilter("ALL");
        setObjectiveFilter("ALL");
        setOpen(true);
    };

    const selectTemplate = (draft, action) => {
        const selectedDraft =
            accountFilter !== "ALL"
                ? draft.accountDrafts.find(
                    (item) =>
                        String(item.Account_Number) ===
                        String(accountFilter)
                )
                : draft.accountDrafts[0];

        if (!selectedDraft) {
            messageApi.error("No draft found for the selected account.");
            return;
        }

        setOpen(false);

        onSelectTemplate?.(
            {
                ...selectedDraft,
                accounts: [...draft.accounts],
            },
            action
        );
    };

    const openShare = (draft) => {
        setShareTemplate(draft);
        setShareAccounts([]);
        setShareOpen(true);
    };

    const shareTemplateNow = async () => {
        if (!token) {
            messageApi.error(
                "Authentication token not found. Please log in again."
            );
            return;
        }

        if (!shareTemplate) return;

        if (!shareAccounts.length) {
            messageApi.warning("Please select at least one account.");
            return;
        }

        setShareLoading(true);

        try {
            const response = await fetch(`${API}/share`, {
                method: "POST",
                headers: headers(true),
                body: JSON.stringify({
                    draftData: {
                        groupId: shareTemplate.groupId,
                        Draft_Name: shareTemplate.Draft_Name,
                        camapaignlevel: shareTemplate.camapaignlevel,
                        adsetlevel_1: shareTemplate.adsetlevel_1,
                    },
                    targetAccounts: shareAccounts,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data?.ok) {
                throw new Error(
                    data?.message || "Failed to share template."
                );
            }

            const shared = Array.isArray(data.accountsShared)
                ? data.accountsShared
                : [];

            messageApi.success(
                shared.length
                    ? `Template shared to: ${shared.join(", ")}`
                    : "Template shared successfully."
            );

            const skipped = shareAccounts.filter(
                (account) =>
                    !shared.some(
                        (value) => String(value) === String(account)
                    )
            );

            if (skipped.length) {
                messageApi.info(`Skipped accounts: ${skipped.join(", ")}`);
            }

            setShareOpen(false);
            setShareTemplate(null);
            setShareAccounts([]);
        } catch (error) {
            messageApi.error(error.message || "Failed to share template.");
        } finally {
            setShareLoading(false);
        }
    };

    const openDelete = async (draft) => {
        if (!token) {
            messageApi.error(
                "Authentication token not found. Please log in again."
            );
            return;
        }

        setDeleteTemplate(draft);
        setDeleteAccounts(draft.accounts.map(String));
        setDeleteOpen(true);
        setAccountsLoading(true);

        try {
            const response = await fetch(
                `${API}/group/${encodeURIComponent(draft.groupId)}`,
                {
                    method: "GET",
                    headers: headers(true),
                }
            );

            const data = await response.json();

            if (!response.ok || !data?.ok) {
                throw new Error(
                    data?.message || "Failed to load template accounts."
                );
            }

            const list = Array.isArray(data.data) ? data.data : [];

            const matched = list
                .filter(
                    (item) =>
                        !Array.isArray(item.Drafts) ||
                        item.Drafts.some(
                            (record) =>
                                String(record.groupId) ===
                                String(draft.groupId)
                        )
                )
                .map(
                    (item) =>
                        item.accountNumber ?? item.Account_Number
                )
                .filter((value) => value != null);

            setDeleteAccounts(
                matched.length
                    ? matched.map(String)
                    : draft.accounts.map(String)
            );
        } catch (error) {
            messageApi.error(
                error.message || "Failed to load template accounts."
            );
        } finally {
            setAccountsLoading(false);
        }
    };

    const deleteTemplateNow = async () => {
        if (!token || !deleteTemplate?.groupId) {
            messageApi.error(
                "Missing authentication token or template group ID."
            );
            return;
        }

        setDeleteLoading(true);

        try {
            const response = await fetch(API, {
                method: "DELETE",
                headers: headers(true),
                body: JSON.stringify({
                    groupId: deleteTemplate.groupId,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data?.ok) {
                throw new Error(
                    data?.message || "Failed to delete template."
                );
            }

            setDeletedGroups((current) => [
                ...new Set([
                    ...current,
                    String(deleteTemplate.groupId),
                ]),
            ]);

            setDeleteOpen(false);
            setDeleteTemplate(null);
            setDeleteAccounts([]);

            messageApi.success(
                "Template deleted successfully across all accounts."
            );
        } catch (error) {
            messageApi.error(error.message || "Failed to delete template.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatBudget = (draft) => {
        const amount = Number(draft.camapaignlevel?.Daily_amount);

        return Number.isFinite(amount)
            ? `$${(amount / 100).toLocaleString()}/day`
            : "—";
    };

    const modalTheme = {
        content: {
            display: "flex",
            flexDirection: "column",
            maxHeight: "90dvh",
            overflow: "hidden",
            background: isDark ? "#1f1f1f" : "#ffffff",
            color: isDark ? "#f5f5f5" : "#222222",
        },
        header: {
            flex: "0 0 auto",
            marginBottom: 4,
            paddingInlineEnd: 32,
            background: isDark ? "#1f1f1f" : "#ffffff",
            color: isDark ? "#f5f5f5" : "#222222",
        },
        body: {
            minHeight: 0,
            overflowY: "auto",
            paddingTop: 0,
            background: isDark ? "#1f1f1f" : "#ffffff",
            color: isDark ? "#f5f5f5" : "#222222",
        },
    };

    const modalClass = `campaign-templates-modal ${isDark ? "campaign-templates-dark" : "campaign-templates-light"
        }`;

    return (
        <>
            {contextHolder}
            <Button onClick={openTemplates}>Templates</Button>
            <Modal
                title="Campaign Templates"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                // centered
                style={{ top: 40 }}
                width="80%"
                destroyOnHidden
                className={modalClass}
                styles={modalTheme}
                mask={{ closable: false, }}
            >
                <div className="campaign-templates-filters">
                    <div>
                        <Input
                            allowClear
                            placeholder="Search..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            style={{ height: 25, textAlign: "center" }}
                        />
                    </div>

                    <div className="campaign-templates-filter">
                        <Select
                            value={accountFilter}
                            onChange={setAccountFilter}
                            options={accountOptions}
                            style={{ width: "100%", height: 25 }}
                        />
                    </div>

                    <div className="campaign-templates-filter">
                        <Select
                            value={objectiveFilter}
                            onChange={setObjectiveFilter}
                            options={objectiveOptions}
                            style={{ width: "100%", height: 25 }}
                        />
                    </div>
                </div>

                {filteredTemplates.length === 0 ? (
                    <Empty description="No campaign templates found" />
                ) : (
                    <div className="campaign-templates-grid">
                        {filteredTemplates.map((draft) => (
                            <Card
                                key={String(draft.groupId)}
                                size="small"
                                className="campaign-template-card"
                                title={
                                    <Text ellipsis style={{ fontSize: 12.5 }} >
                                        {draft.Draft_Name ||
                                            "Untitled template"}
                                    </Text>
                                }
                                extra={
                                    <div className="campaign-template-actions">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<FaShareFromSquare style={{ fontSize: 12 }} />}
                                            title="Share template"
                                            onClick={() => openShare(draft)}
                                        />
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<FaPenToSquare style={{ fontSize: 12 }} />}
                                            title="Edit template"
                                            onClick={() =>
                                                selectTemplate(draft, "edit")
                                            }
                                        />
                                        <Button
                                            style={{ height: 24 }}
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<FaTrashCan style={{ fontSize: 12, }} />}
                                            title="Delete template"
                                            onClick={() => openDelete(draft)}
                                        />
                                    </div>
                                }
                            >
                                <div className="campaign-template-details">
                                    <Text type="secondary" style={{ fontSize: 11 }}>Account</Text>
                                    <Text className="campaign-template-value" style={{ fontSize: 11 }}>
                                        {accountFilter !== "ALL"
                                            ? accountFilter
                                            : draft.accounts.join(", ") || "—"}
                                    </Text>

                                    <Text type="secondary" style={{ fontSize: 11 }}>Objective</Text>
                                    <Text className="campaign-template-value" style={{ fontSize: 11 }}>
                                        {draft.camapaignlevel?.Objectives || "—"}
                                    </Text>

                                    <Text type="secondary" style={{ fontSize: 11 }}>Budget</Text>
                                    <Text className="campaign-template-value" style={{ fontSize: 11 }}>
                                        {formatBudget(draft)}
                                    </Text>
                                </div>

                                <Button
                                    type="primary"
                                    block
                                    className="campaign-template-select"
                                    onClick={() =>
                                        selectTemplate(draft, "select")
                                    }
                                    style={{ fontSize: 12, height: 24 }}
                                >
                                    Use This Template
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal>

            <Modal
                title={`Share Template: ${shareTemplate?.Draft_Name || ""}`}
                open={shareOpen}
                onCancel={() => setShareOpen(false)}
                onOk={shareTemplateNow}
                okText="Share"
                cancelText="Close"
                confirmLoading={shareLoading}
                destroyOnHidden
                className={modalClass}
                styles={modalTheme}
            >
                <Text style={{ display: "block", marginBottom: 8 }}>
                    Select target accounts
                </Text>

                <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Select accounts"
                    value={shareAccounts}
                    onChange={setShareAccounts}
                    options={accountOptions.filter(
                        (account) => account.value !== "ALL"
                    )}
                    style={{ width: "100%" }}
                />
            </Modal>

            <Modal
                title="Delete Campaign Template"
                open={deleteOpen}
                onCancel={() => setDeleteOpen(false)}
                onOk={deleteTemplateNow}
                okText="Yes, Delete"
                cancelText="Close"
                okButtonProps={{ danger: true }}
                confirmLoading={deleteLoading}
                destroyOnHidden
                className={modalClass}
                styles={modalTheme}
            >
                <p>
                    Delete{" "}
                    <Text strong>
                        {deleteTemplate?.Draft_Name || "this template"}
                    </Text>{" "}
                    across all accounts where it is saved?
                </p>

                <Text strong>Accounts containing this template:</Text>

                {accountsLoading ? (
                    <div style={{ padding: 16, textAlign: "center" }}>
                        <Spin />
                    </div>
                ) : deleteAccounts.length ? (
                    <ul>
                        {deleteAccounts.map((account, index) => (
                            <li key={`${account}-${index}`}>{account}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No matching accounts found.</p>
                )}

                <Text type="secondary">
                    This action cannot be undone.
                </Text>
            </Modal>

            <style jsx global>{`
                .campaign-templates-modal .ant-modal-close {
                    top: 16px;
                }

                .campaign-templates-dark .ant-modal-close,
                .campaign-templates-dark .ant-modal-close:hover {
                    color: #f5f5f5;
                }

                .campaign-templates-dark .ant-modal-content,
                .campaign-templates-dark .ant-modal-header {
                    background: #1f1f1f;
                }

                .campaign-templates-dark .ant-modal-title,
                .campaign-templates-dark .ant-modal-body {
                    color: #f5f5f5;
                }

                .campaign-templates-dark .ant-input,
                .campaign-templates-dark .ant-input-affix-wrapper,
                .campaign-templates-dark .ant-select-selector {
                    color: #f5f5f5 !important;
                    background: #262626 !important;
                    border-color: #434343 !important;
                }

                .campaign-templates-dark .ant-input::placeholder {
                    color: #a6a6a6;
                }

                .campaign-templates-dark .ant-select-selection-item,
                .campaign-templates-dark .ant-select-selection-placeholder,
                .campaign-templates-dark .ant-select-arrow {
                    color: #f5f5f5;
                }

                /* FILTER ALIGNMENT */
                .campaign-templates-filters {
                    display: grid;
                    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
                    gap: 12px;
                    align-items: end;
                    width: 100%;
                    margin: 0 0 8px;
                    padding: 0;
                }

                .campaign-templates-search,
                .campaign-templates-filter {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                    margin: 0;
                    padding: 0;
                }

                .campaign-templates-search {
                    justify-content: flex-end;
                }

                .campaign-templates-search .ant-input,
                .campaign-templates-search .ant-input-affix-wrapper {
                    box-sizing: border-box;
                    width: 100%;
                    min-width: 0;
                    height: 28px;
                    margin: 0;
                }

                .campaign-templates-filter label {
                    display: block;
                    margin: 0;
                    padding: 0;
                    line-height: 18px;
                    font-size: 13px;
                    color: inherit;
                }

                .campaign-templates-filter .ant-select {
                    position: relative;
                    display: inline-flex;
                    width: 100%;
                    min-width: 0;
                    height: 28px;
                    vertical-align: bottom;
                }

                .campaign-templates-filter .ant-select-selector {
                    display: flex !important;
                    align-items: center !important;
                    width: 100%;
                    height: 28px !important;
                    min-height: 28px !important;
                    box-sizing: border-box;
                }

                .campaign-templates-filter .ant-select-selection-wrap {
                    display: flex;
                    align-items: center;
                    min-width: 0;
                }

                .campaign-templates-filter .ant-select-selection-item,
                .campaign-templates-filter .ant-select-selection-placeholder {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 26px !important;
                }

                .campaign-templates-filter .ant-select-arrow {
                    position: absolute;
                    top: 50%;
                    inset-inline-end: 11px;
                    transform: translateY(-50%);
                    margin: 0;
                }

                /* TEMPLATE GRID */
                .campaign-templates-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 8px;
                    max-height: min(72vh, calc(100dvh - 200px));
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 2px 4px 4px 2px;
                    align-content: start;
                }

                .campaign-template-card {
                    min-width: 0;
                    height: 100%;
                }

                .campaign-template-card .ant-card-head {
                    min-height: 36px;
                    padding-inline: 14px;
                }

                .campaign-template-card .ant-card-head-title {
                    min-width: 0;
                    overflow: hidden;
                }

                .campaign-template-card .ant-card-extra {
                    padding-block: 8px;
                    padding-inline-start: 6px;
                }

                .campaign-template-card .ant-card-body {
                    display: flex;
                    flex-direction: column;
                    padding: 14px;
                }

                .campaign-template-actions {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .campaign-template-details {
                    display: grid;
                    grid-template-columns: auto minmax(0, 1fr);
                    gap: 12px 16px;
                    margin-bottom: 16px;
                }

                .campaign-template-value {
                    min-width: 0;
                    text-align: right;
                    overflow-wrap: anywhere;
                }

                .campaign-template-select {
                    min-height: 24px;
                    margin-top: auto;
                    font-weight: 600;
                    white-space: normal;
                    background: #91c25f;
                    border-color: #91c25f;
                }

                .campaign-template-select:hover {
                    background: #7eaf4e !important;
                    border-color: #7eaf4e !important;
                }

                @media (min-width: 1400px) {
                    .campaign-templates-grid {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
                }

                @media (min-width: 576px) and (max-width: 991px) {
                    .campaign-templates-filters {
                        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
                        gap: 5px;
                    }

                    .campaign-templates-filters > div {
                        min-width: 0;
                    }

                    .campaign-templates-filters .ant-input,
                    .campaign-templates-filters .ant-input-affix-wrapper,
                    .campaign-templates-filters .ant-select {
                        width: 100%;
                        min-width: 0;
                    }

                    .campaign-templates-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        max-height: min(72vh, calc(100dvh - 180px));
                    }
                }

                @media (max-width: 575px) {
                    .campaign-templates-modal {
                        max-width: calc(100vw - 16px);
                        margin-inline: auto;
                    }

                    .campaign-templates-modal .ant-modal-content {
                        padding: 16px;
                    }

                    .campaign-templates-modal .ant-modal-title {
                        font-size: 16px;
                    }

                    .campaign-templates-filters {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 8px;
                    }

                    .campaign-templates-search {
                        grid-column: 1 / -1;
                    }

                    .campaign-templates-grid {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 12px;
                        max-height: calc(100dvh - 220px);
                    }

                    .campaign-template-card .ant-card-head {
                        padding-inline: 10px;
                    }

                    .campaign-template-card .ant-card-body {
                        padding: 12px;
                    }

                    .campaign-template-actions {
                        gap: 0;
                    }

                    .campaign-template-details {
                        gap: 10px;
                    }
                }
            `}</style>
        </>
    );
}
