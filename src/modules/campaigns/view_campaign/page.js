"use client";

import { useEffect, useState } from "react";
import { Modal, Collapse, Form, Button, Tooltip, Select, Switch, Spin, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { FaRegClone } from "react-icons/fa";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import CampaignLevel from "@/components/campaigns/campaignlevel";
import AdSetLevel from "@/components/campaigns/adsetlevel";
import ReportCategoryTreeSelect from "@/components/campaigns/reportcategorytreeselect";
import moment from "moment-timezone";
import dayjs from "dayjs";

const formatContinent = value => value.replace(/[_-]+/g, " ").replace(/^./, c => c.toUpperCase());

const createInitialAdset = () => ({
    id: uuidv4(),
    AdsetName: "",
    action_source: "",
    optimization_goal: "",
    custom_event_type: "",
    billing_event: "",
    DailyAdd_amount: 0,
    DatePicker: undefined,
    DatePickerEnd: undefined,
    bid_amount: 0,
    timezone_type: "ADVERTISER",
    countries: [],
    Min_Age: "18",
    minAgeEnabled: true,
    Max_Age: "65",
    Gender: "0",
    adSchedulingEnabled: false,
    selectedScheduleCells: {},
    ad_schedule: [],
    Language: [6],
    placements: "manual",
    platforms: [],
    positions: [],
    device_platforms: [],
    page_id: [],
    pixel_id: [],
    isDynamicCreative: false
});

const cloneValue = value => {
    if (Array.isArray(value)) {
        return value.map(cloneValue);
    }

    if (
        value &&
        typeof value === "object" &&
        Object.getPrototypeOf(value) === Object.prototype
    ) {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                cloneValue(item)
            ])
        );
    }

    return value;
};

const ViewCampaignDrawer = ({
    visible,
    onClose,
    changeRRefrst,
    accountis = [],
    network,
    theme,
    userData,
    auth,
    username,
    networksWithStatus,
    userdetails,
    identifier
}) => {
    const [budgetType, setBudgetType] = useState("daily");
    const [loading, setLoading] = useState(false);
    const [isModalOpenToCreate, setIsModalOpenToCreate] = useState(false);
    const [formValues, setFormValues] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [campaignSchedulingEnabled, setCampaignSchedulingEnabled] = useState(false);
    const [continents, setContinents] = useState([]);
    const [localesdata, setlocalesdata] = useState([]);
    const [adsetConfig, setAdsetConfig] = useState({});
    const [campaignSchema, setCampaignSchema] = useState([]);
    const [adsetSchema, setAdsetSchema] = useState([]);
    const [imageHashArray, setImageHashArray] = useState([]);
    const [pixel_id_list, setPixel_id_list] = useState([]);
    const [page_id_list, setPage_id_list] = useState([]);
    const [pageidList, setPageIdList] = useState([]);
    const [pixelIdList, setPixelIdList] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [errors, setErrors] = useState({
        input1: "",
        input2: "",
        reportCat: ""
    });
    const [reportCategories, setReportCategories] = useState([]);
    const [geo, setGeos] = useState("Geo");
    const [pixel, setPixels] = useState("Pixel");
    const [page, setPages] = useState("Page");

    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [form] = Form.useForm();

    const adSchedulingToShowCampaign = campaignSchedulingEnabled;

    const handleCampaignSchedulingChange = checked => {
        setCampaignSchedulingEnabled(checked);
        form.setFieldValue("adSchedulingToShowCampaign", checked);
    };

    const handleDrawerClose = () => {
        setCampaignSchedulingEnabled(false);
        form.resetFields();
        setBudgetType("daily");
        setPages("Page");
        setPixels("Pixel");
        setGeos("Geo")
        onClose();
    };

    const convertAdScheduleToSelectedCells = (schedule = []) => {
        const selectedCells = {};

        schedule.forEach(slot => {
            const startHour = slot.start_minute / 60;
            const endHour = slot.end_minute / 60;

            slot.days.forEach(facebookDay => {
                const uiDay = (Number(facebookDay) + 6) % 7;

                for (let hour = startHour; hour < endHour; hour++) {
                    selectedCells[`${uiDay}-${hour}`] = true;
                }
            });
        });

        return selectedCells;
    };

    const normalizeList = value => {
        if (Array.isArray(value)) return value;
        if (value === undefined || value === null || value === "") return [];
        return [value];
    };

    const getSelectedPositionObjects = (selected, allPositionOptions) => {
        const selectedValues = new Set(
            normalizeList(selected).map(position =>
                String(
                    typeof position === "object"
                        ? position?.value
                        : position
                )
            )
        );

        return allPositionOptions.filter(position =>
            selectedValues.has(String(position.value))
        );
    };

    const getTheCampaignDetailsAlongWithContinentsAndAccountDetails =
        async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `/api/campaigns/campaign/clone?account=${accountis.join(",")}&id=${identifier}`
                );

                const newCountriesFormat = Object.entries(
                    response?.data?.geos || {}
                ).map(([continent, countries]) => ({
                    title: formatContinent(continent),
                    label: formatContinent(continent),
                    value: continent,
                    key: continent,
                    children: (Array.isArray(countries) ? countries : []).map(
                        country => ({
                            title: country.label,
                            label: country.label,
                            value: country.value,
                            key: country.key || country.value
                        })
                    )
                }));

                const networkData =
                    response?.data?.data?.filter(
                        item => item.Network === network
                    ) || [];

                setImageHashArray(networkData);
                setContinents(newCountriesFormat);
                setReportCategories(response?.data?.categories || []);
                // setDraftsData(response?.data?.drafts || []);
                setlocalesdata(response?.data?.localesdata || [])
                setAdsetConfig(response?.data?.adsetConfig || {})
                setSelectedTemplate(response?.data?.campaigndata || {})
                // setCampaignSchema(
                //     response?.data?.campaign
                //         ? JSON.parse(response.data.campaign)
                //         : []
                // );
                // setAdsetSchema(response?.data?.adset || [])

                const getIdLists = (key) => {
                    const list = networkData.flatMap((item) => {
                        const id = item[key];
                        if (id == null || id === "") return [];

                        const account = String(item.accountNumber);

                        if (typeof id === "object" && !Array.isArray(id)) {
                            return Object.entries(id).map(([label, value]) => ({
                                value: `${account} - ${value}`,
                                label: `${account} - ${label} - ${value}`,
                                accountNumber: account,
                                itemLabel: String(label),
                            }));
                        }

                        const itemLabel = key === "pageID"
                            ? String(item.pageName ?? item.page_name ?? id)
                            : String(id);

                        return [{
                            value: `${account} - ${id}`,
                            label: key === "pageID"
                                ? `${account} - ${itemLabel} - ${id}`
                                : `${account} - ${id}`,
                            accountNumber: account,
                            itemLabel,
                        }];
                    });

                    const defaultsByAccount = {};

                    list.forEach((option) => {
                        const account = option.accountNumber;

                        if (!defaultsByAccount[account]) {
                            defaultsByAccount[account] = option;
                        }

                        if (option.itemLabel.toLowerCase().includes("universal")) {
                            defaultsByAccount[account] = option;
                        }
                    });

                    return {
                        options: list.map(({ accountNumber, itemLabel, ...option }) => option),
                        values: list.map(({ value }) => value).filter(Boolean),
                        defaults: Object.values(defaultsByAccount).map(({ value }) => value),
                    };
                };

                const pixelData = getIdLists("pixelID");
                const pageData = getIdLists("pageID");

                setPixel_id_list(pixelData.options);
                setPage_id_list(pageData.options);

                setPixelIdList(pixelData.defaults);
                setPageIdList(pageData.defaults);
            } catch (error) {
                console.error(
                    "Error fetching campaign details:",
                    error
                );
            }
            finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        if (!visible) return;
        if (visible && accountis.length > 0) {
            getTheCampaignDetailsAlongWithContinentsAndAccountDetails();
        }
        form.setFieldValue("Account_Number", [...accountis]);
    }, [visible, accountis, network, form]);

    useEffect(() => {
        if (selectedTemplate) {
            const { Category, geo, page, pixel, camapaignlevel, Account_Number } = selectedTemplate;
            // First update campaign-level form values
            const categoryObject = reportCategories.find(item => item.name === Category);
            if (camapaignlevel) {
                form.setFieldsValue({
                    ...camapaignlevel,
                    // ...(camapaignlevel.Special_categories && { countries: camapaignlevel.Special_categories_countries || [] }),
                    ...(camapaignlevel.Special_categories !== "NONE" && {
                        countries: Array.isArray(camapaignlevel.Special_categories_countries)
                            ? camapaignlevel.Special_categories_countries
                            : ["US"]
                    }),
                    ...(camapaignlevel.Special_categories === "NONE" ? { Special_categories: ["NONE"] } : { Special_categories: camapaignlevel.Special_categories }),
                    ...(camapaignlevel.Daily_amount && { Daily_amount: (camapaignlevel.Daily_amount / 100) }),
                    // ...(camapaignlevel.is_day_parting_enabled_campign && { adSchedulingToShowCampaign: camapaignlevel.is_day_parting_enabled_campign }),
                    Name: camapaignlevel.Name,
                    Account_Number: [Account_Number],
                    campaignid: camapaignlevel?.campaignid || ""
                    // id: uuidv4(),
                });

                if (camapaignlevel.Budget_type) {
                    setBudgetType(camapaignlevel.Budget_type);
                }
                if (camapaignlevel.is_day_parting_enabled_campign) {
                    setCampaignSchedulingEnabled(camapaignlevel.is_day_parting_enabled_campign);
                }
            }
            const stripOffset = (isoString) => isoString.slice(0, 19);
            const adsets = Object.entries(selectedTemplate)
                .filter(([key]) => key.startsWith("adsetlevel_"))
                .map(([key, adsetLevel]) => {
                    const isDynamicCreative = adsetLevel.is_dynamic_creative;
                    const addLevel = adsetLevel.addlevel;
                    const ads = isDynamicCreative ? [{
                        id: addLevel[0].id,
                        Addid: addLevel[0].Addid || undefined,
                        AddName: addLevel[0].AddName,
                        AdName: addLevel[0].AddName,
                        page_id: [`${Account_Number} - ${addLevel[0].page_id}`],
                        message: addLevel[0].message,
                        primaryText: addLevel[0].message,
                        messages: addLevel[0].message,
                        headline: addLevel[0].headline,
                        Description: addLevel[0].Description,
                        descriptions: addLevel[0].Description,
                        description: addLevel[0].Description,
                        mediaSource: "creatives",
                        accountSettings: {
                            [Account_Number]: {
                                Caption: addLevel[0].Caption,
                                displayLink: addLevel[0].Caption,
                                caption: addLevel[0].Caption,
                                Website_URL: addLevel[0].Website_URL,
                                websiteUrl: addLevel[0].Website_URL
                            }
                        },
                        filename: addLevel[0].filename.map((item, index) => ({
                            uid: `creative-${Date.now()}-${index}`,
                            name: item.filename.split("/").filter(Boolean).pop(),
                            url: item.filename,
                        })),
                        Website_URL: addLevel[0].Website_URL,
                        Caption: addLevel[0].Caption,

                        // Caption: addLevel[]
                    }] : addLevel.map((item, index) => ({
                        id: item.id,
                        Addid: item.Addid || "",
                        AddName: item.AddName,
                        AdName: item.AddName,
                        page_id: [`${Account_Number} - ${item.page_id}`],
                        filename: {
                            uid: `creative-${Date.now()}-${index}`,
                            name: item.filename.split("/").filter(Boolean).pop(),
                            url: item.filename,
                        },
                        mediaSource: "creatives",
                        message: item.message,
                        primaryText: item.message,
                        messages: item.message,
                        headline: item.headline,
                        Description: item.Description,
                        descriptions: item.Description,
                        description: item.Description,
                        accountSettings: {
                            [Account_Number]: {
                                Caption: item.Caption,
                                displayLink: item.Caption,
                                caption: item.Caption,
                                Website_URL: item.Website_URL,
                                websiteUrl: item.Website_URL
                            }
                        },
                        Website_URL: item.Website_URL,
                        Caption: item.Caption,

                    }));
                    const adSchedule = Array.isArray(adsetLevel.adschedule)
                        ? adsetLevel.adschedule
                        : [];

                    const selectedScheduleCells =
                        convertAdScheduleToSelectedCells(adSchedule);

                    const selectedPositions = getSelectedPositionObjects(adsetLevel?.position || [], adsetConfig?.allPositionOptions);
                    const startDate = dayjs();

                    const parsedStartDate = adsetLevel.Adsetid && adsetLevel.start_time
                        ? dayjs(adsetLevel.start_time)
                        : startDate;

                    const parsedEndDate = adsetLevel.Adsetid && adsetLevel.end_time
                        ? dayjs(adsetLevel.end_time)
                        : startDate.add(30, "day").endOf("day");

                    const DatePickerValue = parsedStartDate.isValid()
                        ? parsedStartDate
                        : startDate;

                    const DatePickerEndValue = parsedEndDate.isValid()
                        ? parsedEndDate
                        : startDate.add(30, "day").endOf("day");
                    return ({
                        id: adsetLevel.id,
                        Adsetid: adsetLevel.Adsetid || "",
                        isDynamicCreative: adsetLevel.is_dynamic_creative ? adsetLevel.is_dynamic_creative : false,
                        AdsetName: adsetLevel.AdsetName || "",
                        action_source: adsetLevel.action_source || "",
                        optimization_goal: adsetLevel.optimization_goal || "",
                        custom_event_type: adsetLevel.custom_event_type || "",
                        billing_event: adsetLevel.billing_event || "",
                        DailyAdd_amount: adsetLevel.Daily_amount ? (adsetLevel.Daily_amount / 100) : 0,
                        bid_amount: adsetLevel.bid_amount ? (adsetLevel.bid_amount / 100) : 0,
                        // countries: adsetLevel.countries || [],
                        countries: Array.isArray(adsetLevel.countries)
                            ? adsetLevel.countries
                            : adsetLevel.countries
                                ? [adsetLevel.countries]
                                : [],
                        Min_Age: adsetLevel.Min_Age || "18",
                        minAgeEnabled: adsetLevel.minAgeToggle ? adsetLevel.minAgeToggle : Number(adsetLevel.Min_Age) < 26 ? true : false,
                        Max_Age: adsetLevel.Max_Age || "65",
                        Gender: adsetLevel.Gender || "0",
                        Language: adsetLevel.locales || [6],
                        placements: adsetLevel.placements || "manual",
                        platforms: adsetLevel.publisher_platforms || [],
                        positions: adsetLevel.position || [],
                        device_platforms: adsetLevel.device_platforms || [],
                        pixel_id: adsetLevel.pixel_id ? [`${Account_Number} - ${adsetLevel.pixel_id}`] : [],
                        Beneficiary: {
                            [Account_Number]: adsetLevel.beneficiary ? adsetLevel.beneficiary : ""
                        },
                        Payer: {
                            [Account_Number]: adsetLevel.payer ? adsetLevel.payer : "",
                        },
                        showBeneficiaryPayer: adsetLevel.beneficiary ? true : false,
                        // DatePicker: (adsetLevel.start_time),
                        // ...(adsetLevel.end_time && { DatePickerEnd: (adsetLevel?.end_time) }),
                        // DatePicker: adsetLevel.Adsetid ? dayjs(stripOffset(adsetLevel.start_time)) : startDate,
                        // ...(adsetLevel.end_time ? adsetLevel.Adsetid ? {
                        //     DatePickerEnd: dayjs(stripOffset(adsetLevel.end_time))
                        // } : { DatePickerEnd: startDate.add(30, 'day').endOf('day'), } : { DatePickerEnd: startDate.add(30, 'day').endOf('day'), }),
                        DatePicker: DatePickerValue,
                        DatePickerEnd: DatePickerEndValue,
                        // ...(camapaignlevel.is_day_parting_enabled_campign && { ad_schedule: adsetLevel.adschedule }),
                        // ...(adsetLevel.is_day_parting_enabled && { adSchedulingEnabled: adsetLevel.is_day_parting_enabled, ad_schedule: adsetLevel.adschedule }),
                        adSchedulingEnabled: Boolean(
                            adsetLevel.is_day_parting_enabled
                        ),
                        selectedPositions: selectedPositions ? selectedPositions : [],

                        ad_schedule: Array.isArray(adsetLevel.adschedule)
                            ? [...adsetLevel.adschedule]
                            : [],
                        timezone_type:
                            (Array.isArray(adsetLevel.adschedule) && adsetLevel.adschedule[0]?.timezone_type)
                            || "ADVERTISER",
                        selectedScheduleCells: selectedScheduleCells || {},
                        selectedAccount: Account_Number,
                        ads: ads
                    })
                });

            form.setFieldValue("adsets", adsets);
            if (geo) setGeos(geo);
            if (page) setPages(page);
            if (pixel) setPixels(pixel);
            if (categoryObject) {
                form.setFieldsValue({
                    reportCat: categoryObject?.categoryId,
                });
            } else {
                const newObject = {
                    accountNumber: Account_Number,
                    categoryId: uuidv4(),
                    name: Category
                }
                setReportCategories(prev => [newObject, ...prev]);
                form.setFieldsValue({
                    reportCat: newObject?.categoryId,
                });
            }
        }
    }, [selectedTemplate]);

    const handleFinishFailed = ({ errorFields = [] }) => {
        setValidationErrors(
            errorFields.flatMap(({ name, errors }) =>
                errors.map(message => ({
                    field: name.map(String).join("."),
                    message,
                }))
            )
        );
    };



    const handleSubmit = async () => {
        // setLoading(true);
        setValidationErrors([]);

        try {
            await form.validateFields();

            const values = form.getFieldsValue(true);
            setIsModalOpenToCreate(true);
            setFormValues(values);

        } catch (error) {
            if (error?.errorFields?.length) {
                setValidationErrors(
                    error.errorFields.flatMap(field =>
                        field.errors.map(message => ({
                            field: field.name.join("."),
                            message,
                        }))
                    )
                );
            } else {
                console.error("Campaign validation failed:", error);
            }
        }
        // finally {
        //     setLoading(false);
        // }
    };

    const initialValues = {
        Account_Number: [],
        Name: "",
        Daily_amount: 0,
        adSchedulingToShowCampaign: false,
        Objectives: undefined,
        Special_categories: ["NONE"],
        countries: [],
        Bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        adsets: [createInitialAdset()]
    };

    const getCurrentAdsets = () => {
        const current = form.getFieldValue("adsets");
        return Array.isArray(current) ? current : [];
    };

    const addAdset = () => {
        form.setFieldValue("adsets", [
            ...getCurrentAdsets(),
            createInitialAdset()
        ]);
    };

    const cloneAdset = adsetId => {
        const currentAdsets = getCurrentAdsets();
        const source = currentAdsets.find(
            adset => String(adset?.id) === String(adsetId)
        );

        if (!source) return;

        const cloned = cloneValue({
            ...source,
            id: uuidv4(),
            Adsetid: undefined,
            minAgeEnabled:
                source.minAgeEnabled ?? Number(source.Min_Age ?? 18) <= 25,
            adSchedulingEnabled: source.adSchedulingEnabled ?? false,
            selectedScheduleCells: source.selectedScheduleCells || {},
            ad_schedule: source.ad_schedule || {},
            ads: (source.ads || []).map(ad => {
                return { ...ad, Addid: undefined };
            }),
        });

        form.setFieldValue("adsets", [...currentAdsets, cloned]);
    };

    const deleteAdset = adsetId => {
        const currentAdsets = getCurrentAdsets();

        if (currentAdsets.length <= 1) return;

        form.setFieldValue(
            "adsets",
            currentAdsets.filter(
                adset => String(adset?.id) !== String(adsetId)
            )
        );
    };

    const campaignCollapseItems = [
        {
            key: "campaign-level",
            label: <span style={{ fontSize: 12 }}>CAMPAIGN LEVEL</span>,
            styles: {
                header: {
                    minHeight: 30,
                    backgroundColor: "rgba(237, 241, 238, 0.93)"
                },
                body: {
                    padding: "10px 8px",
                    marginTop: 10,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10
                }
            },
            children: (
                <CampaignLevel
                    form={form}
                    accountis={accountis}
                    continents={continents}
                    theme={theme}
                    mode="view"
                    budgetType={budgetType}
                    campaignSchedulingEnabled={campaignSchedulingEnabled}
                    onCampaignSchedulingChange={handleCampaignSchedulingChange}
                />
            )
        }
    ];


    return (
        <Modal
            title={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        paddingRight: 18
                    }}
                >
                    <span>{selectedTemplate ? selectedTemplate.campaign_name : ""}</span>
                </div>
            }
            className={`campaigns-custom-modal ${theme === "dark" ? "campaigns-dark-theme-modal" : ""
                }`}
            open={visible}
            mask={{ closable: false }}
            onCancel={handleDrawerClose}
            footer={null}
            centered
            width="90%"
            styles={{
                body: {
                    height: "80vh",
                    overflowY: "auto",
                    backgroundColor: theme === "dark" ? "#333" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000"
                }
            }}
            style={{ borderRadius: 12 }}
        >
            {contextHolder}
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={handleSubmit}
                    onFinishFailed={handleFinishFailed}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            marginBottom: 4,
                            flexWrap: "nowrap",
                            overflowX: "auto",
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "nowrap",
                                flex: "1 0 auto",
                            }}
                        >
                            {/* <CampaignTemplates
                                userData={userData}
                                accounts={accountis}
                                draftsByAccount={draftsData}
                                theme={theme}
                                networksWithStatus={networksWithStatus}
                                onSelectTemplate={(template, action) => {
                                    console.log("Selected template:", template, "Action:", action);
                                    setSelectedTemplate(template);
                                }}
                                userdetails={userdetails}
                            /> */}

                            <Form.Item
                                name="reportCat"
                                style={{ margin: 0, flexShrink: 0 }}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a report category.",
                                    },
                                ]}
                            >
                                <ReportCategoryTreeSelect
                                    reportCategories={reportCategories}
                                    theme={theme}
                                    disabled={true}
                                    onChange={() => {
                                        if (errors.reportCat) {
                                            setErrors((previous) => ({
                                                ...previous,
                                                reportCat: "",
                                            }));
                                        }
                                    }}
                                />
                            </Form.Item>

                            <Select
                                size="small"
                                placeholder="Budget Type"
                                style={{
                                    width: 122,
                                    fontSize: 12.5,
                                    fontWeight: 450,
                                    height: 24,
                                    flexShrink: 0,
                                }}
                                disabled
                                options={[
                                    { label: "Daily Budget", value: "daily" },
                                    { label: "Lifetime Budget", value: "lifetime" },
                                ]}
                                value={budgetType}
                                onChange={(nextBudgetType) => {
                                    const nextType = nextBudgetType || "daily";
                                    setBudgetType(nextType);

                                    if (nextType !== "lifetime") {
                                        handleCampaignSchedulingChange(false);
                                    }
                                }}
                            />
                        </div>

                    </div>
                    <Collapse
                        className="campaigns-collapse"
                        defaultActiveKey={["campaign-level"]}
                        items={campaignCollapseItems}
                    />

                    <div style={{ marginTop: 12 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                minHeight: 38,
                                border: "1px solid #d9d9d9",
                                borderRadius: 6,
                                backgroundColor: "rgba(237, 241, 238, 0.93)"
                            }}
                        >
                            <span style={{ fontSize: 12 }}>ADSET LEVEL</span>

                            {/* <Tooltip title="Add ad set">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={addAdset}
                                />
                            </Tooltip> */}
                        </div>

                        <Form.Item
                            name="adSchedulingToShowCampaign"
                            valuePropName="checked"
                            hidden
                        >
                            <Switch />
                        </Form.Item>

                        <Form.List name="adsets">
                            {fields => (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 12,
                                        marginTop: 12
                                    }}
                                >
                                    {fields.map((field, index) => {
                                        const adsetId =
                                            form.getFieldValue([
                                                "adsets",
                                                field.name,
                                                "id"
                                            ]) || field.key;

                                        const existingAdsetId = form.getFieldValue([
                                            "adsets",
                                            field.name,
                                            "Adsetid"
                                        ]);

                                        return (
                                            <Collapse
                                                key={adsetId}
                                                className="campaigns-collapse campaigns-adset-collapse"
                                                defaultActiveKey={[String(adsetId)]}
                                                items={[
                                                    {
                                                        key: String(adsetId),
                                                        label: (
                                                            <span
                                                                style={{
                                                                    fontSize: 12,
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {`AD SET ${index + 1}`}
                                                            </span>
                                                        ),
                                                        extra: (
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 4
                                                                }}
                                                                onClick={event =>
                                                                    event.stopPropagation()
                                                                }
                                                                onMouseDown={event =>
                                                                    event.stopPropagation()
                                                                }
                                                            >
                                                                <span>
                                                                    Dynamic Creative:
                                                                </span>

                                                                <Form.Item
                                                                    name={[
                                                                        field.name,
                                                                        "isDynamicCreative"
                                                                    ]}
                                                                    valuePropName="checked"
                                                                    noStyle
                                                                >
                                                                    <Switch
                                                                        size="small"
                                                                        disabled={true}
                                                                        onClick={(_, event) =>
                                                                            event?.stopPropagation?.()
                                                                        }
                                                                    />
                                                                </Form.Item>

                                                                {/* <Tooltip title="Clone ad set">
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<FaRegClone />}
                                                                        onClick={event => {
                                                                            event.stopPropagation();
                                                                            cloneAdset(adsetId);
                                                                        }}
                                                                    />
                                                                </Tooltip>

                                                                <Tooltip
                                                                    title={
                                                                        fields.length <= 1
                                                                            ? "At least one ad set is required"
                                                                            : "Delete ad set"
                                                                    }
                                                                >
                                                                    <Button
                                                                        type="text"
                                                                        danger
                                                                        size="small"
                                                                        disabled={fields.length <= 1 || !!existingAdsetId}
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={event => {
                                                                            event.stopPropagation();
                                                                            deleteAdset(adsetId);
                                                                        }}
                                                                    />
                                                                </Tooltip> */}
                                                            </div>
                                                        ),
                                                        styles: {
                                                            header: {
                                                                minHeight: 38,
                                                                padding: "8px 12px",
                                                                backgroundColor:
                                                                    "rgba(237, 241, 238, 0.93)"
                                                            },
                                                            body: {
                                                                padding: "10px 12px",
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius: 8
                                                            }
                                                        },
                                                        children: (
                                                            <Form.Item
                                                                noStyle
                                                                shouldUpdate={() => true}
                                                            >
                                                                {() => (
                                                                    <AdSetLevel
                                                                        key={form.getFieldValue(["adsets", field.name, "id"])}
                                                                        form={form}
                                                                        adsetId={form.getFieldValue(["adsets", field.name, "id"])}
                                                                        index={field.name}
                                                                        mode="view"
                                                                        theme={theme}
                                                                        network={network}
                                                                        accountis={accountis}
                                                                        campaignCountries={continents}
                                                                        continents={continents}
                                                                        localesdata={localesdata}
                                                                        adsetConfig={adsetConfig}
                                                                        page_id_list={page_id_list}
                                                                        pixel_id_list={pixel_id_list}
                                                                        pageidList={pageidList}
                                                                        pixelIdList={pixelIdList}
                                                                        budgetType={budgetType}
                                                                        adSchedulingToShowCampaign={
                                                                            adSchedulingToShowCampaign
                                                                        }
                                                                        isDynamicCreative={
                                                                            form.getFieldValue([
                                                                                "adsets",
                                                                                field.name,
                                                                                "isDynamicCreative"
                                                                            ]) ?? false
                                                                        }
                                                                        username={username}
                                                                        auth={auth}
                                                                        userData={userData}
                                                                        selectedAccounts={accountis}
                                                                        multipleGeo={geo}
                                                                        multiplePixel={pixel}
                                                                        multiplePage={page}
                                                                    />
                                                                )}
                                                            </Form.Item>
                                                        )
                                                    }
                                                ]}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </Form.List>
                    </div>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ViewCampaignDrawer;