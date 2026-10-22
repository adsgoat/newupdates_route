"use client";

import { useEffect, useState } from "react";
import {
    Modal,
    Collapse,
    Form,
    Button,
    Tooltip,
    Select,
    Switch
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import { FaRegClone } from "react-icons/fa";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import CampaignLevel from "@/components/campaigns/campaignlevel";
import AdSetLevel from "@/components/campaigns/adsetlevel";
import ReportCategoryTreeSelect from "@/components/campaigns/reportcategorytreeselect";
import CampaignTemplates from "@/components/campaigns/campaigntemplates";

const formatContinent = value =>
    value.replace(/[_-]+/g, " ").replace(/^./, c => c.toUpperCase());

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

const localesdata = [
    { name: "English (US)", key: 6 },
    { name: "Catalan", key: 1 },
    { name: "Czech", key: 2 },
    { name: "Cebuano", key: 56 },
    { name: "Welsh", key: 3 },
    { name: "Danish", key: 4 },
    { name: "German", key: 5 },
    { name: "Basque", key: 59 },
    { name: "Spanish", key: 23 },
    { name: "Spanish (Spain)", key: 7 },
    { name: "Guarani", key: 66 },
    { name: "Finnish", key: 8 },
    { name: "French (France)", key: 9 },
    { name: "Galician", key: 65 },
    { name: "Hungarian", key: 30 },
    { name: "Italian", key: 10 },
    { name: "Japanese", key: 11 },
    { name: "Korean", key: 12 },
    { name: "Norwegian (bokmal)", key: 13 },
    { name: "Norwegian (nynorsk)", key: 84 },
    { name: "Dutch", key: 14 },
    { name: "Frisian", key: 63 },
    { name: "Polish", key: 15 },
    { name: "Portuguese (Brazil)", key: 16 },
    { name: "Portuguese (Portugal)", key: 31 },
    { name: "Romanian", key: 32 },
    { name: "Russian", key: 17 },
    { name: "Slovak", key: 33 },
    { name: "Slovenian", key: 34 },
    { name: "Swedish", key: 18 },
    { name: "Thai", key: 35 },
    { name: "Turkish", key: 19 },
    { name: "Northern Kurdish (Kurmanji)", key: 76 },
    { name: "Simplified Chinese (China)", key: 20 },
    { name: "Traditional Chinese (Hong Kong)", key: 21 },
    { name: "Traditional Chinese (Taiwan)", key: 22 },
    { name: "Afrikaans", key: 36 },
    { name: "Albanian", key: 87 },
    { name: "Armenian", key: 68 },
    { name: "Azerbaijani", key: 53 },
    { name: "Belarusian", key: 54 },
    { name: "Bengali", key: 45 },
    { name: "Bosnian", key: 55 },
    { name: "Bulgarian", key: 37 },
    { name: "Croatian", key: 38 },
    { name: "Flemish", key: 83 },
    { name: "English (UK)", key: 24 },
    { name: "Esperanto", key: 57 },
    { name: "Estonian", key: 58 },
    { name: "Faroese", key: 62 },
    { name: "French (Canada)", key: 44 },
    { name: "Georgian", key: 72 },
    { name: "Greek", key: 39 },
    { name: "Gujarati", key: 67 },
    { name: "Icelandic", key: 69 },
    { name: "Indonesian", key: 25 },
    { name: "Irish", key: 64 },
    { name: "Javanese", key: 71 },
    { name: "Kannada", key: 75 },
    { name: "Kazakh", key: 73 },
    { name: "Latvian", key: 78 },
    { name: "Lithuanian", key: 40 },
    { name: "Macedonian", key: 79 },
    { name: "Malay", key: 41 },
    { name: "Marathi", key: 81 },
    { name: "Mongolian", key: 80 },
    { name: "Nepali", key: 82 },
    { name: "Punjabi", key: 47 },
    { name: "Serbian", key: 42 },
    { name: "Swahili", key: 88 },
    { name: "Filipino", key: 26 },
    { name: "Tamil", key: 48 },
    { name: "Telugu", key: 49 },
    { name: "Malayalam", key: 50 },
    { name: "Ukrainian", key: 52 },
    { name: "Uzbek", key: 91 },
    { name: "Vietnamese", key: 27 },
    { name: "Khmer", key: 74 },
    { name: "Tajik", key: 89 },
    { name: "Arabic", key: 28 },
    { name: "Hebrew", key: 29 },
    { name: "Urdu", key: 90 },
    { name: "Persian", key: 60 },
    { name: "Pashto", key: 85 },
    { name: "Sinhala", key: 86 },
    { name: "Japanese (Kansai)", key: 70 },
    { name: "English (All)", key: 1001 },
    { name: "Spanish (All)", key: 1002 },
    { name: "French (All)", key: 1003 },
    { name: "Chinese (All)", key: 1004 },
    { name: "Portuguese (All)", key: 1005 }
];

const CreateCampaignDrawer = ({
    visible,
    onClose,
    changeRRefrst,
    accountis = [],
    network,
    theme,
    userData,
    auth,
    username
}) => {
    const [budgetType, setBudgetType] = useState("daily");
    const [campaignSchedulingEnabled, setCampaignSchedulingEnabled] =
        useState(false);
    const [continents, setContinents] = useState([]);
    const [imageHashArray, setImageHashArray] = useState([]);
    const [pixel_id_list, setPixel_id_list] = useState([]);
    const [page_id_list, setPage_id_list] = useState([]);
    const [pageidList, setPageIdList] = useState([]);
    const [pixelIdList, setPixelIdList] = useState([]);
    const [popupInputs, setPopupInputs] = useState({
        input1: "",
        input2: "",
        reportCat: ""
    });
    const [errors, setErrors] = useState({
        input1: "",
        input2: "",
        reportCat: ""
    });
    const [reportCategories, setReportCategories] = useState([]);
    const [draftsData, setDraftsData] = useState({});

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
        onClose();
    };

    const getTheCampaignDetailsAlongWithContinentsAndAccountDetails =
        async () => {
            try {
                const response = await axios.get(
                    `/api/campaigns/campaign/structure?account=${accountis.join(",")}`
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
                setDraftsData(response?.data?.drafts || []);

                const getIdLists = key => {
                    const list = networkData.flatMap(item => {
                        const id = item[key];

                        if (id == null || id === "") return [];

                        if (typeof id === "object" && !Array.isArray(id)) {
                            return Object.entries(id).map(([label, value]) => ({
                                value: `${item.accountNumber} - ${value}`,
                                label: `${item.accountNumber} - ${label} - ${value}`
                            }));
                        }

                        return [{
                            value: `${item.accountNumber} - ${id}`,
                            label: `${item.accountNumber} - ${id}`
                        }];
                    });

                    return [
                        list,
                        list.map(({ value }) => value).filter(Boolean)
                    ];
                };

                const [
                    [pixelIdList, pixelIdListFiltered],
                    [pageIdList, pageIdListFiltered]
                ] = ["pixelID", "pageID"].map(getIdLists);

                setPixel_id_list(pixelIdList);
                setPage_id_list(pageIdList);
                setPixelIdList(pixelIdListFiltered);
                setPageIdList(pageIdListFiltered);
            } catch (error) {
                console.error(
                    "Error fetching campaign details:",
                    error
                );
            }
        };

    useEffect(() => {
        if (visible && accountis.length > 0) {
            getTheCampaignDetailsAlongWithContinentsAndAccountDetails();
        }
    }, [visible, accountis, network]);

    // const handleSubmit = async values => {
    //     console.log("Campaign Form Values:", values);
    //     console.log(JSON.stringify(values, null, 2));
    // };
    const handleSubmit = async () => {
        try {
            await form.validateFields();

            const values = form.getFieldsValue(true);

            console.log("Campaign form values:", values);
            console.log("Ad data:", values.adsets?.map(adset => ({
                id: adset.id,
                ads: adset.ads || [],
            })));
        } catch (error) {
            console.error("Campaign validation failed:", error);
        }
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

    const cloneAdset = index => {
        const currentAdsets = getCurrentAdsets();
        const source = currentAdsets[index];

        if (!source) return;

        const cloned = cloneValue({
            ...source,
            id: uuidv4(),
            minAgeEnabled:
                source.minAgeEnabled ?? Number(source.Min_Age ?? 18) <= 25,
            adSchedulingEnabled: source.adSchedulingEnabled ?? false,
            selectedScheduleCells: source.selectedScheduleCells || {},
            ad_schedule: source.ad_schedule || []
        });

        form.setFieldValue("adsets", [...currentAdsets, cloned]);
    };

    const deleteAdset = index => {
        const currentAdsets = getCurrentAdsets();

        if (currentAdsets.length <= 1) return;

        form.setFieldValue(
            "adsets",
            currentAdsets.filter((_, currentIndex) => currentIndex !== index)
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
                    mode="create"
                    budgetType={budgetType}
                    campaignSchedulingEnabled={campaignSchedulingEnabled}
                    onCampaignSchedulingChange={handleCampaignSchedulingChange}
                />
            )
        }
    ];

    console.log(draftsData, "draftsData");

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
                    <span>Create a new campaign</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CampaignTemplates
                            accounts={accountis}
                            draftsByAccount={draftsData}
                            theme={theme}
                            onSelectTemplate={(template, action) => {
                                // template contains the selected template object.
                                // action is "select" or "edit".
                            }}
                        />

                        <ReportCategoryTreeSelect
                            reportCategories={reportCategories}
                            value={popupInputs.reportCat}
                            theme={theme}
                            error={errors.reportCat}
                            onChange={id => {
                                setPopupInputs(previous => ({
                                    ...previous,
                                    reportCat: id
                                }));

                                if (errors.reportCat) {
                                    setErrors(previous => ({
                                        ...previous,
                                        reportCat: ""
                                    }));
                                }
                            }}
                        />

                        <Select
                            size="small"
                            placeholder="Budget Type"
                            style={{
                                width: 122,
                                fontSize: 12.5,
                                fontWeight: 450,
                                height: 24
                            }}
                            options={[
                                { label: "Daily Budget", value: "daily" },
                                { label: "Lifetime Budget", value: "lifetime" }
                            ]}
                            value={budgetType}
                            onChange={nextBudgetType => {
                                const nextType = nextBudgetType || "daily";
                                setBudgetType(nextType);

                                if (nextType !== "lifetime") {
                                    handleCampaignSchedulingChange(false);
                                }
                            }}
                        />
                    </div>
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
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
            >
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

                        <Tooltip title="Add ad set">
                            <Button
                                type="text"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={addAdset}
                            />
                        </Tooltip>
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
                                                                    onClick={(_, event) =>
                                                                        event?.stopPropagation?.()
                                                                    }
                                                                />
                                                            </Form.Item>

                                                            <Tooltip title="Clone ad set">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<FaRegClone />}
                                                                    onClick={event => {
                                                                        event.stopPropagation();
                                                                        cloneAdset(index);
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
                                                                    disabled={fields.length <= 1}
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={event => {
                                                                        event.stopPropagation();
                                                                        deleteAdset(index);
                                                                    }}
                                                                />
                                                            </Tooltip>
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
                                                                    form={form}
                                                                    index={field.name}
                                                                    mode="create"
                                                                    theme={theme}
                                                                    network={network}
                                                                    accountis={accountis}
                                                                    campaignCountries={continents}
                                                                    continents={continents}
                                                                    localesdata={localesdata}
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

                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                        marginTop: 16
                    }}
                >
                    <Button onClick={handleDrawerClose}>
                        Cancel
                    </Button>

                    <Button type="primary" htmlType="submit">
                        Create Campaign
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateCampaignDrawer;