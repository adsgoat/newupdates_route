"use client";

import { useEffect, useMemo } from "react";
import {
    Form,
    Input,
    InputNumber,
    Select,
    TreeSelect,
    Switch
} from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

const europeanUnionCountryCodes = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI",
    "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
    "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"
];

const CampaignLevel = ({
    form,
    accountis,
    continents = [],
    theme,
    mode,
    budgetType,
    campaignSchedulingEnabled,
    onCampaignSchedulingChange
}) => {
    const objectiveValue = Form.useWatch("Objectives", form);
    const specialCategories = Form.useWatch("Special_categories", form);
    const campaignBudget = Number(Form.useWatch("Daily_amount", form) || 0);

    const watchedCampaignScheduling =
        Form.useWatch("adSchedulingToShowCampaign", form, {
            preserve: true
        }) ?? false;

    const adSchedulingToShowCampaign =
        campaignSchedulingEnabled ?? watchedCampaignScheduling;

    const adsetsValue = Form.useWatch("adsets", form);
    const adsets = Array.isArray(adsetsValue) ? adsetsValue : [];

    const hasAdsetBudget = adsets.some(
        adset => Number(adset?.DailyAdd_amount || 0) > 0
    );

    const isCreate = mode === "create";

    const normalizedCategories = Array.isArray(specialCategories)
        ? specialCategories
        : specialCategories
            ? [specialCategories]
            : [];

    const hasSpecialCategory = normalizedCategories.some( value => value !== "NONE" );

    const geoTreeData = useMemo(() => {
        const source = Array.isArray(continents)
            ? continents
            : Object.entries(
                continents?.countries || continents || {}
            ).map(([key, items]) => ({
                title: key.charAt(0).toUpperCase() + key.slice(1),
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value: key,
                key,
                children: items
            }));

        return [
            {
                title: "Countries",
                label: "Countries",
                value: "all_countries",
                key: "all_countries",
                children: source.map(item => {
                    const value = item.value ?? item.key;
                    const label = item.label ?? item.title ?? value;
                    const children = item.children ?? item.countries ?? [];

                    return {
                        ...item,
                        title: item.title ?? label,
                        label,
                        value,
                        key: item.key ?? value,
                        children: Array.isArray(children)
                            ? children.map(country => {
                                const countryValue =
                                    country.value ?? country.key;
                                const countryLabel =
                                    country.label ??
                                    country.title ??
                                    countryValue;

                                return {
                                    ...country,
                                    title: country.title ?? countryLabel,
                                    label: countryLabel,
                                    value: countryValue,
                                    key: country.key ?? countryValue
                                };
                            })
                            : []
                    };
                })
            }
        ];
    }, [continents]);

    const accountOptions = useMemo(
        () =>
            Array.isArray(accountis)
                ? accountis.map(account => ({
                    value: account,
                    label: account
                }))
                : [],
        [accountis]
    );

    useEffect(() => {
        if (isCreate) {
            if (!accountOptions.length) return;

            const current = form.getFieldsValue([
                "Account_Number",
                "Daily_amount",
                "adSchedulingToShowCampaign",
                "Special_categories",
                "Bid_strategy"
            ]);

            const values = {};

            if (
                !Array.isArray(current.Account_Number) ||
                current.Account_Number.length === 0
            ) {
                values.Account_Number = accountOptions.map(
                    account => account.value
                );
            }

            if (current.Daily_amount == null) {
                values.Daily_amount = 0;
            }

            if (current.adSchedulingToShowCampaign == null) {
                values.adSchedulingToShowCampaign = false;
            }

            if (
                !Array.isArray(current.Special_categories) ||
                current.Special_categories.length === 0
            ) {
                values.Special_categories = ["NONE"];
            }

            if (current.Bid_strategy == null) {
                values.Bid_strategy = "LOWEST_COST_WITHOUT_CAP";
            }

            if (Object.keys(values).length) {
                form.setFieldsValue(values);
            }

            return;
        }

        const current = form.getFieldsValue([
            "Account_Number",
            "Daily_amount",
            "adSchedulingToShowCampaign",
            "Special_categories",
            "Bid_strategy"
        ]);

        const values = {};

        if (current.Account_Number == null) {
            values.Account_Number = [];
        }

        if (current.Daily_amount == null) {
            values.Daily_amount = 0;
        }

        if (current.adSchedulingToShowCampaign == null) {
            values.adSchedulingToShowCampaign = false;
        }

        if (current.Special_categories == null) {
            values.Special_categories = ["NONE"];
        }

        if (current.Bid_strategy == null) {
            values.Bid_strategy = "LOWEST_COST_WITHOUT_CAP";
        }

        if (Object.keys(values).length) {
            form.setFieldsValue(values);
        }
    }, [isCreate, accountOptions, form]);

    useEffect(() => {
        const currentCountries = form.getFieldValue("countries");

        if (
            (!Array.isArray(currentCountries) || currentCountries.length === 0) &&
            geoTreeData.some(continent =>
                continent.children?.some(
                    country =>
                        country.value === "US" ||
                        country.children?.some(child => child.value === "US")
                )
            )
        ) {
            form.setFieldValue("countries", ["US"]);
        }
    }, [form, geoTreeData]);

    useEffect(() => {
        if (
            campaignBudget > 0 ||
            adsets.some(adset => Number(adset?.DailyAdd_amount || 0) > 0)
        ) {
            form.setFields([
                {
                    name: "Daily_amount",
                    errors: []
                }
            ]);
        }
    }, [campaignBudget, adsets, form]);

    const bidStrategyOptions = useMemo(
        () => [
            {
                value: "LOWEST_COST_WITHOUT_CAP",
                label: "Highest Volume"
            },
            {
                value: "LOWEST_COST_WITH_BID_CAP",
                label: "Bid Cap"
            },
            {
                value: "COST_CAP",
                label: "Cost per Result Goal"
            },
            {
                value: "LOWEST_COST_WITH_MIN_ROAS",
                label: "ROAS Goal"
            }
        ],
        []
    );

    const filteredBidStrategies = useMemo(
        () =>
            objectiveValue === "OUTCOME_LEADS"
                ? bidStrategyOptions.filter(
                    option =>
                        option.value !== "LOWEST_COST_WITH_MIN_ROAS"
                )
                : bidStrategyOptions,
        [objectiveValue, bidStrategyOptions]
    );

    const campaignSchema = useMemo(
        () => [
            {
                key: "Account_Number",
                label: "Account number",
                type: "select",
                required: true,
                options: accountOptions,
                props: {
                    mode: "multiple",
                    placeholder: "Select account(s)",
                    optionFilterProp: "label",
                    allowClear: true,
                    maxTagCount: 1
                },
                layout: { row: 1, flex: 0.28 },
                validation: {
                    requiredMessage: "Please select at least one account."
                },
                order: 1
            },
            {
                key: "Name",
                label: "Campaign name",
                type: "input",
                required: true,
                props: {
                    placeholder: "Enter campaign name",
                    maxLength: 255
                },
                layout: { row: 1, flex: 0.5 },
                validation: {
                    requiredMessage: "Please enter a campaign name."
                },
                order: 2
            },
            {
                key: "Daily_amount",
                labelNode: (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <span>
                            {budgetType === "lifetime"
                                ? "Lifetime Budget"
                                : "Daily Budget"}
                        </span>

                        <Switch
                            size="small"
                            checked={Boolean(adSchedulingToShowCampaign)}
                            disabled={
                                budgetType !== "lifetime" || hasAdsetBudget
                            }
                            onChange={checked => {
                                if (onCampaignSchedulingChange) {
                                    onCampaignSchedulingChange(checked);
                                } else {
                                    form.setFieldValue(
                                        "adSchedulingToShowCampaign",
                                        checked
                                    );
                                }

                                form.setFields([
                                    {
                                        name: "Daily_amount",
                                        errors: []
                                    }
                                ]);
                            }}
                        />
                    </span>
                ),
                label:
                    budgetType === "lifetime"
                        ? "Lifetime Budget"
                        : "Daily Budget",
                type: "number",
                required: true,
                props: {
                    min: 0,
                    step: 0.01,
                    precision: 2,
                    placeholder: "$",
                    disabled: hasAdsetBudget
                },
                layout: { row: 1, flex: 0.22 },
                validation: {
                    validator: (_, value) => {
                        const budget = Number(value || 0);
                        const currentAdsets = form.getFieldValue("adsets");
                        const safeAdsets = Array.isArray(currentAdsets)
                            ? currentAdsets
                            : [];

                        const adsetBudgets = safeAdsets.map(
                            adset => Number(adset?.DailyAdd_amount || 0)
                        );

                        return budget > 0 || adsetBudgets.some(value => value > 0)
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                    "Enter a budget at the Campaign or Ad Set level."
                                )
                            );
                    }
                },
                order: 3
            },
            {
                key: "Objectives",
                label: "Objective",
                type: "select",
                required: true,
                options: [
                    { value: "OUTCOME_LEADS", label: "Leads" },
                    { value: "OUTCOME_SALES", label: "Sales" }
                ],
                props: {
                    placeholder: "Select objective"
                },
                layout: { row: 2, flex: 1 },
                validation: {
                    requiredMessage: "Please select an objective."
                },
                order: 4
            },
            {
                key: "Bid_strategy",
                label: "Bid strategy",
                type: "select",
                required: true,
                options: filteredBidStrategies,
                props: {
                    placeholder: "Select bid strategy"
                },
                layout: { row: 2, flex: 1 },
                validation: {
                    requiredMessage: "Please select a bid strategy."
                },
                order: 5
            },
            {
                key: "Special_categories",
                label: "Special categories",
                type: "select",
                required: true,
                options: [
                    { value: "HOUSING", label: "Housing" },
                    {
                        value: "FINANCIAL_PRODUCTS_SERVICES",
                        label: "Credit"
                    },
                    { value: "EMPLOYMENT", label: "Employment" },
                    { value: "NONE", label: "None" }
                ],
                props: {
                    mode: "multiple",
                    allowClear: true,
                    placeholder: "Select category"
                },
                layout: { row: 2, flex: 1 },
                validation: {
                    requiredMessage: "Please select a category."
                },
                order: 6
            },
            {
                key: "countries",
                label: "Countries",
                type: "treeSelect",
                required: true,
                options: geoTreeData,
                visible: () => hasSpecialCategory,
                props: {
                    fieldNames: {
                        label: "label",
                        value: "value",
                        children: "children"
                    },
                    treeCheckable: true,
                    showCheckedStrategy: TreeSelect.SHOW_PARENT,
                    showSearch: true,
                    allowClear: true,
                    treeNodeFilterProp: "label",
                    treeLine: true,
                    switcherIcon: ({ expanded, isLeaf }) =>
                        isLeaf
                            ? null
                            : expanded
                                ? <DownOutlined />
                                : <RightOutlined />,
                    treeDefaultExpandedKeys: ["all_countries"],
                    placeholder: "Select continents or countries",
                    maxTagCount: 2,
                    className: `${
                        theme === "dark" ? "dark-theme" : "light-theme"
                    } green-border-select`,
                    classNames: {
                        popup: {
                            root: `${
                                theme === "dark"
                                    ? "custom-dropdown"
                                    : "custom-dropdown-light"
                            } campaigns-campaign-level-tree-dropdown`
                        }
                    },
                    style: { width: "100%" },
                    treeTitleRender: node => {
                        if (!node) return null;

                        if (node.value === "europe") {
                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%"
                                    }}
                                >
                                    <span>{node.label ?? node.title}</span>

                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 500,
                                            padding: "2px 8px",
                                            borderRadius: 12,
                                            background: "#91c25f",
                                            color: "white",
                                            cursor: "pointer",
                                            border: "1px solid #91caff"
                                        }}
                                        onClick={event => {
                                            event.stopPropagation();

                                            const currentValue =
                                                form.getFieldValue("countries");
                                            const current = Array.isArray(
                                                currentValue
                                            )
                                                ? currentValue
                                                : [];

                                            form.setFieldValue(
                                                "countries",
                                                [
                                                    ...new Set([
                                                        ...current.filter(
                                                            value =>
                                                                value !== "europe"
                                                        ),
                                                        ...europeanUnionCountryCodes
                                                    ])
                                                ]
                                            );
                                        }}
                                    >
                                        EU
                                    </span>
                                </div>
                            );
                        }

                        return node.label ?? node.title ?? null;
                    }
                },
                layout: { row: 2, flex: 1 },
                validation: {
                    requiredMessage: "Please select at least one country."
                },
                order: 7
            },
            {
                key: "adSchedulingToShowCampaign",
                label: "Enable Ad Scheduling",
                type: "switch",
                required: false,
                props: { size: "small" },
                hidden: true,
                order: 8
            }
        ],
        [
            accountOptions,
            geoTreeData,
            filteredBidStrategies,
            hasSpecialCategory,
            form,
            theme,
            budgetType,
            hasAdsetBudget,
            adSchedulingToShowCampaign
        ]
    );

    const handleCategoryChange = value => {
        const selected = Array.isArray(value) ? value : [];

        const normalized = selected.includes("NONE")
            ? selected.length === 1
                ? ["NONE"]
                : selected.filter(item => item !== "NONE")
            : selected.length
                ? selected
                : ["NONE"];

        form.setFieldValue("Special_categories", normalized);

        if (!normalized.some(item => item !== "NONE")) {
            form.setFieldValue("countries", []);
        }
    };

    const getRules = field => {
        const rules = [];

        if (field.required) {
            rules.push({
                required: true,
                message:
                    field.validation?.requiredMessage ||
                    `Please enter ${field.label.toLowerCase()}.`
            });
        }

        if (field.validation?.validator) {
            rules.push({ validator: field.validation.validator });
        }

        return rules;
    };

    const renderField = field => {
        const commonProps = {
            ...field.props,
            style: {
                ...field.props?.style,
                width: "100%",
                minWidth: 0,
                fontSize: 12
            }
        };

        switch (field.type) {
            case "input":
                return <Input {...commonProps} variant="outlined" />;

            case "number":
                return (
                    <InputNumber
                        {...commonProps}
                        variant="outlined"
                        onKeyDown={event => {
                            if (
                                !/[0-9.]/.test(event.key) &&
                                ![
                                    "Backspace",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Tab"
                                ].includes(event.key)
                            ) {
                                event.preventDefault();
                            }
                        }}
                    />
                );

            case "select":
                return (
                    <Select
                        {...commonProps}
                        variant="outlined"
                        options={field.options}
                        onChange={
                            field.key === "Special_categories"
                                ? handleCategoryChange
                                : undefined
                        }
                        classNames={{
                            popup: { root: "campaigns-dropdown" }
                        }}
                    />
                );

            case "treeSelect":
                return (
                    <TreeSelect
                        {...commonProps}
                        variant="outlined"
                        treeData={field.options}
                    />
                );

            case "switch":
                return <Switch {...field.props} />;

            default:
                return null;
        }
    };

    const rows = [
        ...new Set(
            campaignSchema
                .filter(field => field.layout?.row != null)
                .map(field => field.layout.row)
        )
    ]
        .sort((a, b) => a - b)
        .map(row =>
            campaignSchema
                .filter(
                    field =>
                        field.layout?.row === row &&
                        !field.hidden &&
                        (!field.visible || field.visible())
                )
                .sort((a, b) => a.order - b.order)
        )
        .filter(row => row.length);

    return (
        <>
            <style>{`
                .campaigns-campaign-level {
                    width: 100%;
                    min-width: 0;
                }

                .campaigns-campaign-row {
                    display: flex;
                    width: 100%;
                    min-width: 0;
                    gap: 10px;
                    align-items: flex-start;
                }

                .campaigns-campaign-row + .campaigns-campaign-row {
                    margin-top: 4px;
                }

                .campaigns-campaign-item {
                    min-width: 0;
                    margin: 0 !important;
                }

                .campaigns-campaign-item .ant-form-item-label {
                    padding-bottom: 4px;
                }

                .campaigns-campaign-item .ant-form-item-label > label {
                    color: #B4B4B4;
                    font-size: 13px;
                    height: auto;
                }

                .campaigns-campaign-item .ant-select,
                .campaigns-campaign-item .ant-input,
                .campaigns-campaign-item .ant-input-number {
                    width: 100%;
                    min-width: 0;
                }

                .campaigns-campaign-level-tree-dropdown
                .ant-select-tree-switcher {
                    display: inline-flex !important;
                    width: 24px !important;
                    height: 24px !important;
                    align-items: center !important;
                    justify-content: center !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                .campaigns-campaign-level-tree-dropdown
                .ant-select-tree-switcher-icon,
                .campaigns-campaign-level-tree-dropdown
                .ant-select-tree-indent {
                    display: inline-block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                .campaigns-campaign-level-tree-dropdown
                .ant-select-tree-indent-unit {
                    display: inline-block !important;
                    width: 24px !important;
                }

                @media (max-width: 600px) {
                    .campaigns-campaign-row {
                        flex-wrap: wrap;
                    }

                    .campaigns-campaign-item {
                        flex: 1 1 calc(50% - 5px) !important;
                    }
                }

                @media (max-width: 420px) {
                    .campaigns-campaign-item {
                        flex: 1 1 100% !important;
                    }
                }
            `}</style>

            <div className="campaigns-campaign-level">
                {rows.map((row, index) => (
                    <div
                        key={index}
                        className={`campaigns-campaign-row campaigns-campaign-row-${index + 1}`}
                    >
                        {row.map(field => (
                            <Form.Item
                                key={field.key}
                                name={field.key}
                                label={field.labelNode || field.label}
                                className="campaigns-campaign-item"
                                rules={getRules(field)}
                                valuePropName={
                                    field.type === "switch" ? "checked" : "value"
                                }
                                validateTrigger={["onChange", "onBlur"]}
                                style={{
                                    flex: `${field.layout.flex} 1 0`
                                }}
                            >
                                {renderField(field)}
                            </Form.Item>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default CampaignLevel;