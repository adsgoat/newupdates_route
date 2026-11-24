"use client";

import { useEffect, useState } from "react";
import { Modal, Collapse, Form, Button, Tooltip, Select, Switch, Spin, message, Popconfirm, Input } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { FaRegClone } from "react-icons/fa";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import CampaignLevel from "@/components/campaigns/campaignlevel";
import AdSetLevel from "@/components/campaigns/adsetlevel";
import ReportCategoryTreeSelect from "@/components/campaigns/reportcategorytreeselect";
import CampaignTemplates from "@/components/campaigns/campaigntemplates";
import moment from "moment-timezone";
import { Dayjs } from "dayjs";

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

const CreateCampaignDrawer = ({
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
    userdetails
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
    const [isEditingDraft, setIsEditingDraft] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isEditAccountsModalOpen, setIsEditAccountsModalOpen] = useState(false);
    const [matchedAccounts, setMatchedAccounts] = useState([]);
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
    const groupId = uuidv4();
    const [reportCategories, setReportCategories] = useState([]);
    const [draftsData, setDraftsData] = useState({});
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
        setOpen(false);
        setPopupInputs({
            input1: "",
            input2: "",
            reportCat: ""
        });

        setErrors({
            input1: "",
            input2: "",
            reportCat: ""
        });
        setCampaignSchedulingEnabled(false);
        form.resetFields();
        setBudgetType("daily");
        setPages("Page");
        setPixels("Pixel");
        setGeos("Geo")
        setErrors({
            input1: "",
            input2: "",
            reportCat: ""
        });
        setSelectedTemplate(null);
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
                setlocalesdata(response?.data?.localesdata || [])
                setAdsetConfig(response?.data?.adsetConfig || {})
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
        };

    const handleConfirmWithValidation = async () => {
        if (!popupInputs.input2?.trim()) {
            setErrors((prev) => ({
                ...prev,
                input2: "Please enter a Template Name.",
            }));
            return;
        }

        // Clear previous error
        setErrors((prev) => ({
            ...prev,
            input2: "",
        }));

        const allValues = form.getFieldsValue(true);

        if (isEditingDraft) {
            // const trimmedCat = popupInputs.input1.trim();
            const trimmedName = popupInputs.input2.trim();

            const newErrors = {
                // input1: trimmedCat ? "" : "Template category is required",
                input2: trimmedName ? "" : "Template name is required",
            };
            setErrors(newErrors);
            if (Object.values(newErrors).some(msg => msg !== "")) return Promise.reject();

            try {
                // Call your API that fetches all accounts with drafts
                const res = await axios.get(`/api/campaigns/templates/edit/groupid?groupId=${selectedTemplate?.groupId}`);

                const json = res.data;
                const matchedAccounts = json.data
                    .filter(account => account.Drafts.some(draft => draft.groupId === selectedTemplate.groupId))
                    .map(account => account.accountNumber);

                if (matchedAccounts.length === 0) {
                    messageApi.info("No accounts have drafts with this groupId");
                    return;
                }


                setMatchedAccounts(matchedAccounts);
                setIsEditAccountsModalOpen(true);

            } catch (err) {
                console.error(err);
                messageApi.error(err.message || "Failed to fetch matched accounts");
            }
            // const data = await CreateTemplate(allValues);
            // try {

            //     for (const template of data) {
            //         const response = await axios.post("/api/campaigns/templates/create", {
            //             accountNumber: template?.Account_Number,
            //             draftData: { ...template, groupId },
            //             email: userdetails?.email,
            //             userName: username,
            //         })
            //         messageApi.success(`Template ${template?.Draft_Name ?? ""} created successfully`);
            //     }
            //     setConfirmLoading(false);
            //     onClose();
            // }
            // catch (err) {
            //     messageApi.error("Template creation failed");
            // }
            // finally {
            //     setConfirmLoading(false);
            // }
        } else {
            setConfirmLoading(true)
            const data = await CreateTemplate(allValues);
            console.log(data);
            try {

                for (const template of data) {
                    const response = await axios.post("/api/campaigns/templates/create", {
                        accountNumber: template?.Account_Number,
                        draftData: { ...template, groupId },
                        email: userdetails?.email,
                        userName: username,
                    })
                    messageApi.success(`Template ${template?.Draft_Name ?? ""} created successfully`);
                }
                setConfirmLoading(false);
                setOpen(false)
                // onClose();
                form.resetFields();
                setSelectedTemplate(null);
                changeRRefrst();
                await getTheCampaignDetailsAlongWithContinentsAndAccountDetails();
            }
            catch (err) {
                console.log(err);
                messageApi.error("Template creation failed");
            }
            finally {
                setConfirmLoading(false);
            }
        }
    };

    const handleEditDraft = async () => {
        // setIsEditAccountsModalOpen(false);
        setConfirmLoading(true);

        try {
            const allValues = form.getFieldsValue(true);
            const accountsToUpdate = matchedAccounts;

            for (const accountNumber of accountsToUpdate) {
                const draftData = await CreateTemplate(allValues);
                if (!draftData) continue;
                // console.log({
                //     accountNumber: accountNumber,
                //     groupId: selectedTemplate.groupId,
                //     payload: { ...draftData[0], Account_Number: accountNumber, Draft_Name: popupInputs.input2 },
                // })
                await axios.post("/api/campaigns/templates/edit", {
                    accountNumber: accountNumber,
                    groupId: selectedTemplate.groupId,
                    payload: { ...draftData[0], Account_Number: accountNumber, Draft_Name: popupInputs.input2 },
                })

                // let filteredPayload;
                // if (Array.isArray(draftData)) {
                //     filteredPayload = draftData.find(d => d.Account_Number === accountNumber);
                // } else {
                //     filteredPayload = Object.values(draftData).find(d => d.Account_Number === accountNumber);
                // }
                // if (!filteredPayload) continue;
                // filteredPayload = {
                //     ...filteredPayload,
                //     Category: popupInputs.input1,
                //     Draft_Name: popupInputs.input2,
                // };
                // for (const accountNumber of matchedAccounts) {
                //     const draftData = await MultipleAdsetsDraftFetching(allValues, accountNumber);
                //     if (!draftData) continue;

                //     let filteredPayload = Array.isArray(draftData)
                //         ? draftData.find(d => d.Account_Number === accountNumber)
                //         : Object.values(draftData).find(d => d.Account_Number === accountNumber);

                //     if (!filteredPayload) continue;

                //     filteredPayload = {
                //         ...filteredPayload,
                //         Category: popupInputs.input1,
                //         Draft_Name: popupInputs.input2,
                //     };

                //     await fetch(
                //         // "https://www.testapi.adsgoat.in/api/NewupdateDraftSmartnew", 
                //         "https://fb.com/open/templates/update-smart",
                //         {
                //             method: "PATCH",
                //             headers: { "Content-Type": "application/json", Authorization: token },
                //             body: JSON.stringify({
                //                 accountNumber: accountNumber,
                //                 groupId: selectedRef.current.groupId,
                //                 payload: filteredPayload,
                //             }),
                //         });
                // }
                // messageApi.success("Draft updated successfully for all accounts in this group");
                // setIsEditAccountsModalOpen(false);
                // await postDraftSaveCleanup();
            }
            setOpen(false)
            // onClose();
            form.resetFields();
            setSelectedTemplate(null);
            changeRRefrst();
            await getTheCampaignDetailsAlongWithContinentsAndAccountDetails();
            setIsEditingDraft(false);
            setIsEditAccountsModalOpen(false);


        } catch (err) {
            console.error("Save draft (edit) error:", err);
            messageApi.error(err?.message || "Failed to update draft");
        } finally {
            setConfirmLoading(false);
        }
    };

    useEffect(() => {
        if (!visible) {
            setOpen(false);
            return;
        };
        if (visible && accountis.length > 0) {
            getTheCampaignDetailsAlongWithContinentsAndAccountDetails();
        }
        form.setFieldValue("Account_Number", [...accountis]);
    }, [visible, accountis, network, form]);

    const toFileName = (p) =>
        typeof p === "string" ? p.split(/[?#]/)[0].split("/").filter(Boolean).pop() || "" : "";

    const toFile = (item, index = 0) => {
        const url = typeof item === "string" ? item : item?.filename || item?.url || "";
        if (typeof url !== "string" || !url.trim()) return "";
        return { uid: `creative-${Date.now()}-${index}`, name: toFileName(url), url };
    };

    const toFileList = (value) =>
        (Array.isArray(value) ? value : value ? [value] : [])
            .map((item, index) => toFile(item, index))
            .filter(Boolean);
    useEffect(() => {
        if (selectedTemplate) {
            const { Category, geo, page, pixel, camapaignlevel, Account_Number } = selectedTemplate;
            // First update campaign-level form values
            const categoryObject = reportCategories.find(item => item.name === Category);
            if (camapaignlevel) {
                form.setFieldsValue({
                    // ...camapaignlevel,
                    // ...(camapaignlevel.Special_categories && { countries: camapaignlevel.Special_categories_countries || [] }),
                    // ...(camapaignlevel.Daily_amount && { Daily_amount: (camapaignlevel.Daily_amount / 100) })
                    ...camapaignlevel,
                    ...(camapaignlevel.Special_categories !== "NONE" && {
                        countries: Array.isArray(camapaignlevel.Special_categories_countries)
                            ? camapaignlevel.Special_categories_countries
                            : ["US"]
                    }),
                    ...(camapaignlevel.Special_categories === "NONE" ? { Special_categories: ["NONE"] } : { Special_categories: camapaignlevel.Special_categories }),
                    ...(camapaignlevel.Daily_amount && { Daily_amount: (camapaignlevel.Daily_amount / 100) }),
                });

                if (camapaignlevel.Budget_type) {
                    setBudgetType(camapaignlevel.Budget_type);
                }
                if (camapaignlevel.is_day_parting_enabled_campign) {
                    setCampaignSchedulingEnabled(camapaignlevel.is_day_parting_enabled_campign);
                }
            }
            const adsets = Object.entries(selectedTemplate)
                .filter(([key]) => key.startsWith("adsetlevel_"))
                .map(([key, adsetLevel]) => {
                    const isDynamicCreative = adsetLevel.is_dynamic_creative;
                    // const addLevel = adsetLevel.addlevel;
                    // const Ads = addLevel.Ads;
                    // const NewAds = addLevel.NewAds;
                    const addLevel = adsetLevel.addlevel || {};
                    const Ads = Array.isArray(addLevel.Ads) ? addLevel.Ads : [];
                    const NewAds = Array.isArray(addLevel.NewAds) ? addLevel.NewAds : [];
                    const newAds = isDynamicCreative && NewAds.length ? [{
                        id: uuidv4(),
                        AddName: NewAds[0].AddName || "",
                        AdName: NewAds[0].AddName || "",
                        page_id: [`${Account_Number} - ${NewAds[0].page_id}`],
                        message: NewAds[0].message || "",
                        primaryText: NewAds[0].message || "",
                        messages: NewAds[0].message || "",
                        headline: NewAds[0].headline || "",
                        Description: NewAds[0].Description || "",
                        descriptions: NewAds[0].Description || "",
                        description: NewAds[0].Description || "",
                        mediaSource: "creatives",
                        accountSettings: {
                            [Account_Number]: {
                                Caption: NewAds[0].Caption || "",
                                displayLink: NewAds[0].Caption || "",
                                caption: NewAds[0].Caption || "",
                                Website_URL: NewAds[0].Website_URL || "",
                                websiteUrl: NewAds[0].Website_URL || ""
                            }
                        },
                        filename: toFileList(NewAds[0].filename),
                        Website_URL: NewAds[0].Website_URL,
                        Caption: NewAds[0].Caption,

                        // Caption: addLevel[]
                    }] : NewAds.length ? NewAds.map((item, index) => ({
                        id: uuidv4(),
                        AddName: item.AddName,
                        AdName: item.AddName,
                        page_id: [`${Account_Number} - ${item.page_id}`],
                        filename: toFile(item.filename, index),
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

                    })) : []
                    const ads = isDynamicCreative ? [{
                        id: uuidv4(),
                        AddName: addLevel.AddName || "",
                        AdName: addLevel.AddName || "",
                        page_id: [`${Account_Number} - ${addLevel.page_id}`],
                        message: addLevel.message || "",
                        primaryText: addLevel.message || "",
                        messages: addLevel.message || "",
                        headline: addLevel.headline || "",
                        Description: addLevel.Description || "",
                        descriptions: addLevel.Description || "",
                        description: addLevel.Description || "",
                        mediaSource: "creatives",
                        accountSettings: {
                            [Account_Number]: {
                                Caption: addLevel.Caption || "",
                                displayLink: addLevel.Caption || "",
                                caption: addLevel.Caption || "",
                                Website_URL: addLevel.Website_URL || "",
                                websiteUrl: addLevel.Website_URL || ""
                            }
                        },
                        filename: toFileList(Ads),
                        Website_URL: addLevel.Website_URL,
                        Caption: addLevel.Caption,

                        // Caption: addLevel[]
                    }] : Ads.length ? Ads.map((item, index) => ({
                        id: uuidv4(),
                        AddName: addLevel.AddName,
                        AdName: addLevel.AddName,
                        page_id: [`${Account_Number} - ${addLevel.page_id}`],
                        filename: toFile(item, index),
                        mediaSource: "creatives",
                        message: addLevel.message,
                        primaryText: addLevel.message,
                        messages: addLevel.message,
                        headline: addLevel.headline,
                        Description: addLevel.Description,
                        descriptions: addLevel.Description,
                        description: addLevel.Description,
                        accountSettings: {
                            [Account_Number]: {
                                Caption: addLevel.Caption,
                                displayLink: addLevel.Caption,
                                caption: addLevel.Caption,
                                Website_URL: addLevel.Website_URL,
                                websiteUrl: addLevel.Website_URL
                            }
                        },
                        Website_URL: addLevel.Website_URL,
                        Caption: addLevel.Caption,

                    })) :

                        [{
                            id: uuidv4(),
                            AddName: addLevel.AddName || "",
                            AdName: addLevel.AddName || "",
                            page_id: [`${Account_Number} - ${addLevel.page_id}`],
                            message: addLevel.message || "",
                            primaryText: addLevel.message || "",
                            messages: addLevel.message || "",
                            headline: addLevel.headline || "",
                            Description: addLevel.Description || "",
                            descriptions: addLevel.Description || "",
                            description: addLevel.Description || "",
                            mediaSource: "creatives",
                            accountSettings: {
                                [Account_Number]: {
                                    Caption: addLevel.Caption || "",
                                    displayLink: addLevel.Caption || "",
                                    caption: addLevel.Caption || "",
                                    Website_URL: addLevel.Website_URL || "",
                                    websiteUrl: addLevel.Website_URL || ""
                                }
                            },
                            filename: "",
                            Website_URL: addLevel.Website_URL,
                            Caption: addLevel.Caption,
                        }];
                    const adSchedule = Array.isArray(adsetLevel.adschedule)
                        ? adsetLevel.adschedule
                        : [];

                    const selectedScheduleCells =
                        convertAdScheduleToSelectedCells(adSchedule);

                    const selectedPositions = getSelectedPositionObjects(adsetLevel?.position || [], adsetConfig?.allPositionOptions);
                    return ({
                        id: uuidv4(),
                        isDynamicCreative: adsetLevel.is_dynamic_creative ? adsetLevel.is_dynamic_creative : false,
                        AdsetName: adsetLevel.AdsetName || "",
                        action_source: adsetLevel.action_source || "",
                        optimization_goal: adsetLevel.optimization_goal || "",
                        custom_event_type: adsetLevel.custom_event_type || "",
                        billing_event: adsetLevel.billing_event || "",
                        DailyAdd_amount: adsetLevel.DailyAdd_amount ? (adsetLevel.DailyAdd_amount / 100) : 0,
                        DatePicker: adsetLevel.DatePicker ? Dayjs(adsetLevel.DatePicker) : undefined,
                        DatePickerEnd: adsetLevel.DatePickerEnd ? Dayjs(adsetLevel.DatePickerEnd) : undefined,
                        bid_amount: adsetLevel.bid_amount ? (adsetLevel.bid_amount / 100) : 0,
                        // countries: adsetLevel.countries || [],
                        countries: Array.isArray(adsetLevel.countries)
                            ? adsetLevel.countries
                            : adsetLevel.countries
                                ? [adsetLevel.countries]
                                : ["US"],
                        Min_Age: adsetLevel.Min_Age || "18",
                        minAgeEnabled: adsetLevel.minAgeToggle ? adsetLevel.minAgeToggle : false,
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
                        adSchedulingEnabled: Boolean(
                            adsetLevel.is_day_parting_enabled
                        ),
                        selectedPositions: selectedPositions ? selectedPositions : [],

                        ad_schedule: Array.isArray(adsetLevel.adschedule)
                            ? [...adsetLevel.adschedule]
                            : [],
                        selectedScheduleCells: selectedScheduleCells || {},
                        ads: newAds.length ? newAds : ads
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
            }
        }
    }, [selectedTemplate]);

    const customRequest = async (
        campaign_name,
        singleaccount,
        data,
        index,
        onSuccess,
        onError,
        id
    ) => {
        const sleep = ms =>
            new Promise(resolve => setTimeout(resolve, ms));

        const retryApi = async (
            apiCall,
            retries = 3,
            delay = 2000
        ) => {
            let lastError;

            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    return await apiCall();
                } catch (error) {
                    lastError = error;

                    if (attempt < retries - 1) {
                        await sleep(delay);
                    }
                }
            }

            throw lastError;
        };

        const getFileMetadata = file => ({
            ...(file?.uid != null && { uid: file.uid }),
            ...(file?.key != null && { key: file.key }),
            ...(file?.name != null && { name: file.name }),
            ...(file?.type != null && { type: file.type }),
            ...(file?.size != null && { size: file.size }),
            ...(file?.lastModified != null && {
                lastModified: file.lastModified,
            }),
        });

        const getFileType = (file, blob) => {
            const type = file?.type || blob?.type;

            if (
                type &&
                type !== "application/octet-stream"
            ) {
                return type;
            }

            const name = [
                file?.name,
                file?.filename,
                file?.url,
                file?.key,
            ].filter(Boolean).join(" ");

            if (/\.(png|jpe?g|gif|webp|avif|bmp)(?:[?#].*)?$/i.test(name)) {
                return "image/*";
            }

            if (/\.(mp4|mov|avi|webm|m4v|mkv)(?:[?#].*)?$/i.test(name)) {
                return "video/*";
            }

            return "";
        };

        try {
            const accountData = imageHashArray.find(
                item =>
                    String(item.accountNumber) ===
                    String(singleaccount)
            );

            if (!accountData?.launchingToken) {
                throw new Error(
                    `Launching token not found for account ${singleaccount}`
                );
            }

            const {
                launchingToken: token,
                accountNumber: account,
                username = "default-user",
            } = accountData;

            const authToken = localStorage.getItem("token");

            if (!authToken) {
                throw new Error("Authentication token not found");
            }

            // const uploadEndpoint =
            //     "https://app.com/creatives/userfiles/uploaduserfiles";

            const getAuthHeaders = () => ({
                Authorization: authToken,
                username,
            });

            const createS3Folder = async folderPath => {
                // const response = await fetch(uploadEndpoint, {
                //     method: "POST",
                //     headers: {
                //         ...getAuthHeaders(),
                //         "x-folder": `${folderPath.replace(/\/+$/, "")}/`,
                //         "x-action": "create-folder",
                //     },
                // });

                const response = await axios.post("/api/campaigns/s3", null, {
                    headers: {
                        ...getAuthHeaders(),
                        "x-folder": `${folderPath.replace(/\/+$/, "")}/`,
                        "x-action": "create-folder",
                    },
                });

                if (response.status < 200 || response.status >= 300) {
                    throw new Error(
                        `S3 folder creation failed (${response.status})`
                    );
                }
            };

            const uploadFileToS3 = async (
                fileBlob,
                fileName,
                folderPath
            ) => {
                if (!fileBlob) {
                    throw new Error(
                        `Missing file data: ${fileName}`
                    );
                }

                const formData = new FormData();

                formData.append("file", fileBlob, fileName);
                formData.append(
                    "filename",
                    `${folderPath}/${fileName}`
                );

                // const response = await fetch(uploadEndpoint, {
                //     method: "POST",
                //     headers: getAuthHeaders(),
                //     body: formData,
                // });

                const response = await axios.post("/api/campaigns/s3", formData, { headers: getAuthHeaders() });

                // const result = await response.json().catch(() => null);
                const result = response?.data ?? null;

                if (!result?.imageUrl) {
                    throw new Error(
                        result?.message || "S3 upload failed"
                    );
                }

                return result.imageUrl;
            };

            const getVideoThumbnail = async videoid => {
                await sleep(9000);

                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        // const response = await axios.get(
                        //     `https://graph.facebook.com/v23.0/${videoid}`,
                        //     {
                        //         params: {
                        //             access_token: token,
                        //             fields: "thumbnails",
                        //         },
                        //         timeout: 120000,
                        //     }
                        // );
                        // const response = await axios.get(
                        //     "/api/facebook/video/thumbnails",
                        //     {
                        //         params: { videoid },
                        //         timeout: 120000,
                        //     }
                        // );

                        // const data = response.data;

                        // const thumbnails =
                        //     response?.data?.thumbnails?.data || [];

                        const response = await axios.get(
                            "/api/campaigns/facebook/thumbnails",
                            {
                                params: {
                                    videoid,
                                    token,
                                },
                                timeout: 120000,
                            }
                        );

                        const thumbnails = response.data?.thumbnails?.data ?? [];

                        return (
                            thumbnails.find(
                                item => item?.is_preferred && item?.uri
                            )?.uri ||
                            thumbnails.find(item => item?.uri)?.uri ||
                            ""
                        );
                    } catch (error) {
                        console.error(
                            `Thumbnail attempt ${attempt + 1}/3 failed:`,
                            error?.response?.data || error?.message
                        );

                        if (attempt < 2) {
                            await sleep(3000);
                        }
                    }
                }

                return "";
            };

            const processSingleFile = async (
                file,
                fileIndex,
                folderPath
            ) => {
                const metadata = getFileMetadata(file);

                let fileBlob;
                let s3FileUrl = "";

                let fileName =
                    file?.name ||
                    file?.filename?.split("/").pop() ||
                    "media";

                const adName =
                    `${account}_${data?.AddName || "Ad"}_${fileIndex + 1}`;

                try {
                    /*
                     * 1. Read the original media.
                     * Existing S3 media is downloaded and uploaded again
                     * to the new campaign-specific S3 path.
                     */
                    const existingUrl =
                        file?.url ||
                        file?.s3Url ||
                        (
                            typeof file?.filename === "string" &&
                                /^https?:\/\//i.test(file.filename)
                                ? file.filename
                                : ""
                        );

                    if (existingUrl) {
                        const fileUrl = new URL(
                            "https://app.vyaktimetrics.com/creatives/userfiles/s3"
                        );

                        fileUrl.searchParams.set(
                            "s3Url",
                            existingUrl
                        );

                        const response = await retryApi(async () => {
                            const result = await fetch(fileUrl, {
                                headers: {
                                    Authorization: authToken,
                                },
                            });

                            if (!result.ok) {
                                throw new Error(
                                    `Failed to fetch S3 file (${result.status})`
                                );
                            }

                            return result;
                        });

                        fileBlob = await response.blob();
                    } else {
                        const originalFile = file?.originFileObj;

                        if (
                            typeof Blob !== "undefined" &&
                            originalFile instanceof Blob
                        ) {
                            fileBlob = originalFile;
                        } else if (
                            typeof Blob !== "undefined" &&
                            file instanceof Blob
                        ) {
                            fileBlob = file;
                        } else {
                            throw new Error(
                                `Unable to read media: ${fileName}`
                            );
                        }
                    }

                    if (!fileBlob) {
                        throw new Error(
                            `Unable to read media: ${fileName}`
                        );
                    }

                    const fileType = getFileType(file, fileBlob);

                    const isImage = fileType.startsWith("image/");
                    const isVideo = fileType.startsWith("video/");

                    if (!isImage && !isVideo) {
                        throw new Error(
                            `Unsupported media type: ${fileName}`
                        );
                    }

                    /*
                     * 2. Always upload to a new S3 path.
                     */
                    fileName = `blob_${uuidv4()}_${fileName}`;

                    console.log(`[${adName}] Uploading to S3...`);

                    s3FileUrl = await retryApi(
                        () =>
                            uploadFileToS3(
                                fileBlob,
                                fileName,
                                folderPath
                            ),
                        3,
                        2000
                    );

                    /*
                     * 3. Upload media to Facebook.
                     */
                    if (isImage) {
                        console.log(
                            `[${adName}] Generating image hash...`
                        );

                        const fbResponse = await retryApi(async () => {
                            const formData = new FormData();

                            formData.append(
                                "file",
                                fileBlob,
                                fileName
                            );

                            formData.append(
                                "access_token",
                                token
                            );

                            return await axios.post(
                                "/api/campaigns/facebook/image",
                                formData,
                                {
                                    params: { account },
                                    timeout: 120000,
                                }
                            );
                            // axios.post(
                            //     `https://graph.facebook.com/v23.0/act_${account}/adimages`,
                            //     formData,
                            //     { timeout: 120000 }
                            // );
                            // axios.post("/api/facebook/image", {params: {account: account}}, formData)
                        }, 3, 3000);

                        const imag_hash =
                            Object.values(
                                fbResponse?.data?.images || {}
                            )[0]?.hash;

                        if (!imag_hash) {
                            throw new Error(
                                "Facebook image hash not returned"
                            );
                        }

                        onSuccess?.("ok", fbResponse);

                        return {
                            ...metadata,
                            success: true,
                            filename: s3FileUrl,
                            imag_hash,
                        };
                    }

                    console.log(
                        `[${adName}] Generating video ID...`
                    );

                    const formData = new FormData();

                    formData.append("file", fileBlob, fileName);
                    formData.append("access_token", token);

                    const fbResponse = await axios.post(
                        "/api/campaigns/facebook/video",
                        formData,
                        {
                            params: { account },
                            timeout: 300000,
                        }
                    );
                    // (
                    //     `https://graph.facebook.com/v23.0/act_${account}/advideos`,
                    //     formData,
                    //     { timeout: 300000 }
                    // );



                    const videoid = fbResponse?.data?.id;

                    if (!videoid) {
                        throw new Error(
                            "Facebook video ID not returned"
                        );
                    }

                    console.log(
                        `[${adName}] Waiting for thumbnail...`
                    );

                    const thambnailurl =
                        await getVideoThumbnail(videoid);

                    onSuccess?.("ok", fbResponse);

                    return {
                        ...metadata,
                        success: true,
                        filename: s3FileUrl,
                        videoid,
                        thambnailurl,
                    };
                } catch (error) {
                    console.error(
                        "Media processing failed:",
                        error?.response?.data ||
                        error?.message ||
                        error
                    );

                    const errorMessage =
                        error?.response?.data?.error?.message ||
                        error?.message ||
                        "Media upload failed";

                    onError?.("error", error);

                    return {
                        ...metadata,
                        success: false,
                        filename: s3FileUrl,
                        facebookUploadFailed: true,
                        error: errorMessage,
                    };
                }
            };

            /*
             * Extract media from your actual adset structure:
             * data.ads[].filename
             *
             * Each filename may be a File object, an upload object,
             * or an array of upload objects.
             */
            const files = (Array.isArray(data?.ads) ? data.ads : [])
                .flatMap(ad => {
                    const filename = ad?.filename;

                    if (Array.isArray(filename)) {
                        return filename.filter(Boolean);
                    }

                    return filename ? [filename] : [];
                });

            if (!files.length) {
                console.warn(
                    "No media found in data.ads[].filename",
                    data?.ads
                );

                return [];
            }

            const folderPath =
                `${network}/${account}/${campaign_name || "Drafts"}`;

            await createS3Folder(folderPath);

            /*
             * Keep results in the same order as selected media.
             */
            const results = new Array(files.length);

            const processChunk = async (start, end) => {
                const chunk = files.slice(start, end);

                const settled = await Promise.allSettled(
                    chunk.map((file, chunkIndex) =>
                        processSingleFile(
                            file,
                            start + chunkIndex,
                            folderPath
                        )
                    )
                );

                settled.forEach((result, chunkIndex) => {
                    const resultIndex = start + chunkIndex;

                    results[resultIndex] =
                        result.status === "fulfilled"
                            ? result.value
                            : {
                                ...getFileMetadata(chunk[chunkIndex]),
                                success: false,
                                filename: "",
                                facebookUploadFailed: true,
                                error:
                                    result.reason?.message ||
                                    "Media processing failed",
                            };
                });
            };

            // Process in small batches to limit concurrent API requests.
            for (let start = 0; start < files.length; start += 3) {
                await processChunk(
                    start,
                    Math.min(start + 3, files.length)
                );
            }

            console.log("Final uploaded media results:", results);

            return results;
        } catch (error) {
            console.error(
                "customRequest failed:",
                error?.response?.data ||
                error?.message ||
                error
            );

            onError?.("error", error);

            return [];
        }
    };

    function extractValuesByPartialLabel(dataArray, labelName) {
        const searchLabel = String(labelName ?? "").toLowerCase();

        return (Array.isArray(dataArray) ? dataArray : [])
            .filter((item) =>
                String(item?.label ?? "").toLowerCase().includes(searchLabel)
            )
            .map((item) => {
                const key = String(item?.value ?? "");

                if (key.includes("story_")) return "story";
                if (key.includes("profile_feed-") || key.includes("profile_feed_")) return "profile_feed";

                return item.value;
            });
    }

    // const buildAddLevelData = ({
    //     adset,
    //     account,
    //     page_id,
    //     imagesHashArray = [],
    //     isDynamicCreative = false,
    // }) => {
    //     const mediaItems = Array.isArray(imagesHashArray)
    //         ? imagesHashArray
    //         : imagesHashArray &&
    //             typeof imagesHashArray === "object"
    //             ? [imagesHashArray]
    //             : [];

    //     if (!mediaItems.length) return [];

    //     const getAccountValue = field =>
    //         adset?.[account]?.[field];

    //     const hasFailedUpload = media =>
    //         media?.facebookUploadFailed === true ||
    //         (!media?.imag_hash && !media?.videoid);

    //     const getImageHashes = mediaItems
    //         .filter(media => media?.imag_hash)
    //         .map(media => media.imag_hash);

    //     const getVideos = mediaItems
    //         .filter(media => media?.videoid)
    //         .map(media => ({
    //             video_id: media.videoid,
    //             thumbnail_url: media?.thambnailurl || "",
    //         }));

    //     const hasFailedMedia = mediaItems.some(hasFailedUpload);

    //     const baseAdData = {
    //         page_id,
    //         Caption: getAccountValue("Caption"),
    //         Website_URL: getAccountValue("Website_URL"),
    //         displayLink: getAccountValue("displayLink"),
    //         call_to_action_types: ["LEARN_MORE"],
    //     };

    //     // Dynamic creative: exactly ONE ad with multiple filename objects.
    //     if (isDynamicCreative) {
    //         const filename = mediaItems.map(media => ({
    //             // Preserve the original Upload file metadata.
    //             ...(media?.uid != null
    //                 ? { uid: media.uid }
    //                 : {}),

    //             ...(media?.key != null
    //                 ? { key: media.key }
    //                 : {}),

    //             ...(media?.lastModified != null
    //                 ? { lastModified: media.lastModified }
    //                 : {}),

    //             ...(media?.name != null
    //                 ? { name: media.name }
    //                 : {}),

    //             ...(media?.type != null
    //                 ? { type: media.type }
    //                 : {}),

    //             ...(media?.size != null
    //                 ? { size: media.size }
    //                 : {}),

    //             filename: media?.filename || "",

    //             ...(media?.imag_hash
    //                 ? { imag_hash: media.imag_hash }
    //                 : {}),

    //             ...(media?.videoid
    //                 ? {
    //                     video_id: media.videoid,
    //                     thumbnailurl: media?.thambnailurl || "",
    //                 }
    //                 : {}),

    //             ...(hasFailedUpload(media)
    //                 ? {
    //                     facebookUploadFailed: true,
    //                     error:
    //                         media?.error ||
    //                         "Facebook media upload failed",
    //                 }
    //                 : {}),
    //         }));

    //         return [
    //             {
    //                 id: uuidv4(),
    //                 AddName: String(adset?.AddName ?? ""),

    //                 // One ad; multiple media objects.
    //                 filename,

    //                 imag_hash: mediaItems.map(
    //                     media => media?.imag_hash ?? null
    //                 ),

    //                 images: getImageHashes,
    //                 videos: getVideos,

    //                 message: adset?.messages,
    //                 headline: adset?.headlines,
    //                 Description: adset?.descriptions,

    //                 ad_formats: [
    //                     ...(getImageHashes.length
    //                         ? ["SINGLE_IMAGE"]
    //                         : []),

    //                     ...(getVideos.length
    //                         ? ["SINGLE_VIDEO"]
    //                         : []),
    //                 ],

    //                 ...(hasFailedMedia
    //                     ? { facebookUploadFailed: true }
    //                     : {}),

    //                 ...baseAdData,
    //             },
    //         ];
    //     }

    //     // Normal creative: one ad for each media object.
    //     return mediaItems.map((media, index) => {
    //         const adData = {
    //             id: uuidv4(),

    //             AddName:
    //                 `${String(adset?.AddName ?? "")}_${index + 1}`,

    //             filename: media?.filename || "",

    //             message: adset?.message,
    //             headline: adset?.headline,
    //             Description: adset?.Description,

    //             ...baseAdData,
    //         };

    //         if (media?.imag_hash) {
    //             return {
    //                 ...adData,
    //                 imag_hash: media.imag_hash,

    //                 ...(media?.facebookUploadFailed
    //                     ? {
    //                         facebookUploadFailed: true,
    //                         uploadError:
    //                             media?.error ||
    //                             "Facebook image upload failed",
    //                     }
    //                     : {}),
    //             };
    //         }

    //         if (media?.videoid) {
    //             return {
    //                 ...adData,
    //                 videoid: media.videoid,
    //                 thambnailurl: media?.thambnailurl || "",

    //                 ...(media?.facebookUploadFailed
    //                     ? {
    //                         facebookUploadFailed: true,
    //                         uploadError:
    //                             media?.error ||
    //                             "Facebook video upload failed",
    //                     }
    //                     : {}),
    //             };
    //         }

    //         return {
    //             ...adData,
    //             facebookUploadFailed: true,
    //             uploadError:
    //                 media?.error ||
    //                 "Facebook media upload failed",
    //         };
    //     });
    // };



    const buildAddLevelData = ({
        adset,
        account,
        page_id,
        imagesHashArray = [],
        isDynamicCreative = false,
    }) => {
        const mediaItems = Array.isArray(imagesHashArray)
            ? imagesHashArray
            : [];

        const getTheImages = mediaItems
            .filter(media => media?.imag_hash)
            .map(media => media.imag_hash);

        const getTheVideos = mediaItems
            .filter(media => media?.videoid)
            .map(media => ({
                video_id: media.videoid,
                thumbnail_url: media?.thambnailurl || "",
            }));

        const accountSettings =
            adset?.[account] ||
            adset?.accountSettings?.[account] ||
            {};

        const getAdFields = (ad, index) => ({
            id: uuidv4(),
            AddName: `${String(
                ad?.AddName ?? adset?.AddName ?? "Ad"
            )}${isDynamicCreative ? "" : `_${index + 1}`}`,
            page_id,
            message: ad?.primaryText ?? ad?.messages ?? ad?.message ?? adset?.message,
            headline: ad?.headlines ?? ad?.headline ?? adset?.headline,
            Description:
                ad?.descriptions ??
                ad?.Description ??
                ad?.description ??
                adset?.Description,
            Caption: ad?.Caption ?? accountSettings?.Caption,
            Website_URL:
                ad?.Website_URL ?? accountSettings?.Website_URL,
        });

        // Dynamic creative: one ad containing all uploaded media.
        if (isDynamicCreative) {
            const sourceAd = adset?.ads?.[0] || {};

            return [
                {
                    ...getAdFields(
                        {
                            // ...adset,
                            ...sourceAd,
                            AddName: adset?.AdName,
                        },
                        0
                    ),

                    filename: mediaItems.map(media =>
                        media?.imag_hash
                            ? {
                                filename: media.filename || "",
                                imag_hash: media.imag_hash,
                            }
                            : {
                                filename: media?.filename || "",
                                video_id: media?.videoid,
                                thumbnailurl:
                                    media?.thambnailurl || "",
                                ...(media?.facebookUploadFailed
                                    ? { facebookUploadFailed: true }
                                    : {}),
                            }
                    ),

                    imag_hash: mediaItems.map(
                        media => media?.imag_hash
                    ),

                    images: getTheImages,
                    videos: getTheVideos,

                    call_to_action_types: ["LEARN_MORE"],

                    ad_formats: [
                        ...(getTheImages.length
                            ? ["SINGLE_IMAGE"]
                            : []),
                        ...(getTheVideos.length
                            ? ["SINGLE_VIDEO"]
                            : []),
                    ],

                    ...(mediaItems.some(
                        media =>
                            media?.facebookUploadFailed ||
                            (!media?.imag_hash && !media?.videoid)
                    )
                        ? { facebookUploadFailed: true }
                        : {}),
                },
            ];
        }

        // Normal creative: one output ad per uploaded media item.
        return mediaItems.map((media, index) => {
            const sourceAd = Array.isArray(adset?.ads)
                ? adset.ads[index] || {}
                : {};

            // console.log(sourceAd, index);

            const adFields = getAdFields(
                {
                    // ...adset,
                    ...sourceAd,
                    AddName: sourceAd?.AdName,
                },
                index
            );

            if (media?.imag_hash) {
                return {
                    ...adFields,
                    filename: media.filename || "",
                    imag_hash: media.imag_hash,
                    ...(media?.facebookUploadFailed
                        ? { facebookUploadFailed: true }
                        : {}),
                };
            }

            if (media?.videoid) {
                return {
                    ...adFields,
                    filename: media.filename || "",
                    videoid: media.videoid,
                    thambnailurl: media?.thambnailurl || "",
                    ...(media?.facebookUploadFailed
                        ? { facebookUploadFailed: true }
                        : {}),
                };
            }

            return {
                ...adFields,
                filename: media?.filename || "",
                facebookUploadFailed: true,
            };
        });
    };



    const onSuccess = (status, response) => {
        console.log("Media upload successful:", response);
    };

    const onError = (status, error) => {
        console.error("Media upload failed:", error);
    };

    const MultipleAdsetsFetching = async (values) => {
        console.log(values);
        const category = reportCategories.find(item => item.categoryId === values.reportCat);
        const multipleAccounts = values.Account_Number;
        const multipleAccountsData = [];
        for (const account of multipleAccounts) {
            const newImageHash = imageHashArray.find(item => item.accountNumber === account);
            const list_of_pixel_id = values.adsets[0].pixel_id;
            const list_of_page_id = values.adsets[0].ads[0].page_id;

            const matchedPageIds = list_of_page_id.filter(item => item.includes(account)).map(item => item.split("-")[1]?.trim());

            const matchedPixelIds = list_of_pixel_id.filter(item => item.includes(account)).map(item => item.split("-")[1]?.trim());

            const page_ids = page === "Pages" ? matchedPageIds : matchedPageIds.length > 0 ? [matchedPageIds[0]] : [];

            const pixel_ids = pixel === "Pixels" ? matchedPixelIds : matchedPixelIds.length > 0 ? [matchedPixelIds[0]] : [];
            // console.log(page_ids)

            // console.log(pixel_ids, page_ids);
            for (const page_id of page_ids) {
                for (const pixel_id of pixel_ids) {
                    if (geo == "Geos") {
                        const multipleGeoData = values.adsets[0].countries;
                        for (const country of multipleGeoData) {
                            let AllAdsetsData = {
                                campaign_name: values.Name,
                                Account_Number: account,
                                Approval: "PENDING_APPROVAL",
                                fbstatus: "No-Live",
                                Category: category?.name,
                                ISTDate: moment().tz("Asia/Kolkata").format("DD-MM-YYYY"),
                                camapaignlevel: {
                                    createdby: username,
                                    Name: values.Name,
                                    Objectives: values.Objectives,
                                    Special_categories: Array.isArray(values?.Special_categories) &&
                                        values.Special_categories.includes("NONE")
                                        ? "NONE"
                                        : values.Special_categories,
                                    ...(
                                        Array.isArray(values?.Special_categories) &&
                                            !values.Special_categories.includes("NONE")
                                            ? { Special_categories_countries: values.countries }
                                            : {}
                                    ),
                                    Bid_strategy: values.Bid_strategy,
                                    Budget_type: budgetType,
                                    ...(budgetType === "lifetime" && values.adSchedulingToShowCampaign && {
                                        is_day_parting_enabled_campign: true,
                                        pacing_type: ["day_parting"]
                                    }),
                                    Daily_amount: Math.round(parseFloat(values.Daily_amount) * 100),
                                    Status: "PAUSED",
                                    access_token: newImageHash.launchingToken,
                                    createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
                                },
                            };

                            for (let i = 0; i < values.adsets.length; i++) {
                                let AdsetsData = {};
                                const imagesHashArray = await customRequest(
                                    values.Name,
                                    account,
                                    values.adsets[i],
                                    i,
                                    onSuccess,
                                    onError,
                                    values.adsets[i].id
                                );

                                const addLevelData = buildAddLevelData({
                                    adset: values.adsets[i],
                                    account,
                                    page_id,
                                    imagesHashArray,
                                    isDynamicCreative: Boolean(
                                        values.adsets[i]?.isDynamicCreative
                                    ),
                                });

                                // console.log("Uploaded media:", imagesHashArray);
                                // console.log("Final addLevel:", addLevelData);
                                AdsetsData[`adsetlevel_${i + 1}`] = {
                                    id: values.adsets[i].id,
                                    AdsetName: values.adsets[i].AdsetName,
                                    Budget_type: budgetType,
                                    Daily_amount: values.adsets[i].DailyAdd_amount
                                        ? Math.round(parseFloat(values.adsets[i].DailyAdd_amount) * 100)
                                        : "",
                                    optimization_goal: values.adsets[i].optimization_goal,
                                    billing_event: values.adsets[i].billing_event,
                                    start_time: moment(values.adsets[i].DatePicker.$d)
                                        .tz(newImageHash.timeZone)
                                        .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
                                    ...(values.adsets[i].DatePickerEnd && budgetType === "lifetime"
                                        ? {
                                            end_time: moment(values.adsets[i].DatePickerEnd.$d)
                                                .tz(newImageHash.timeZone)
                                                .format("YYYY-MM-DDTHH:mm:ssZ"),
                                        }
                                        : {}),
                                    ...(values.adsets[i].isDynamicCreative
                                        ? {
                                            is_dynamic_creative: true
                                        }
                                        : {}),
                                    action_source: values.adsets[i].action_source,
                                    custom_event_type: values.adsets[i].custom_event_type,
                                    pixel_id: pixel_id,
                                    ...(values.adsets[i].isDynamicCreative
                                        ? {
                                            is_dynamic_creative: true
                                        }
                                        : {}),
                                    bid_amount: values.adsets[i].bid_amount
                                        ? Math.round(Number(values.adsets[i].bid_amount) * 100)
                                        : 0,
                                    countries: [String(country)],
                                    Min_Age: values.adsets[i].Min_Age,
                                    minAgeToggle: values.adsets[i].minAgeEnabled ?? true,
                                    Max_Age: values.adsets[i].Max_Age,
                                    Gender: parseInt(values.adsets[i].Gender),
                                    locales: values.adsets[i].Language,
                                    ...(
                                        adSchedulingToShowCampaign
                                            ? {
                                                adschedule: values.adsets[i].ad_schedule || [],
                                            }
                                            :
                                            values.adsets[i].adSchedulingEnabled
                                                ? {
                                                    is_day_parting_enabled: true,
                                                    pacing_type: ["day_parting"],
                                                    adschedule: values.adsets[i].ad_schedule || [],
                                                }
                                                : {}
                                    ),
                                    placements: values.adsets[i].placements,
                                    ...(values.adsets[i].placements !== "Advance" && {
                                        publisher_platforms: values.adsets[i].platforms,
                                        Facebook_positions:
                                            extractValuesByPartialLabel(
                                                values.adsets[i].selectedPositions,
                                                "Facebook"
                                            ) || [],
                                        instagram_positions:
                                            extractValuesByPartialLabel(
                                                values.adsets[i].selectedPositions,
                                                "Instagram"
                                            ) || [],
                                        audience_network_positions:
                                            extractValuesByPartialLabel(
                                                values.adsets[i].selectedPositions,
                                                "Audience"
                                            ) || [],
                                        messenger_positions:
                                            extractValuesByPartialLabel(
                                                values.adsets[i].selectedPositions,
                                                "Messenger"
                                            ) || [],
                                        position: values.adsets[i].positions,
                                        device_platforms: values.adsets[i].device_platforms,
                                    }),
                                    ...(values.adsets[i].Beneficiary
                                        ? { beneficiary: values.adsets[i].Beneficiary[account].trim() }
                                        : {}),
                                    ...(values.adsets[i].Beneficiary
                                        ? values.adsets[i].Payer ? { payer: values.adsets[i].Payer[account].trim() } : { payer: values.adsets[i].Beneficiary[account].trim() }
                                        : {}),
                                    buying_type: "AUCTION",
                                    addlevel: addLevelData,
                                };
                                AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
                            }
                            multipleAccountsData.push(AllAdsetsData);
                        }
                    }
                    else {
                        let AllAdsetsData = {
                            campaign_name: values.Name,
                            Account_Number: account,
                            Approval: "PENDING_APPROVAL",
                            fbstatus: "No-Live",
                            Category: category?.name,
                            ISTDate: moment().tz("Asia/Kolkata").format("DD-MM-YYYY"),
                            camapaignlevel: {
                                createdby: username,
                                Name: values.Name,
                                Objectives: values.Objectives,
                                Special_categories: Array.isArray(values?.Special_categories) &&
                                    values.Special_categories.includes("NONE")
                                    ? "NONE"
                                    : values.Special_categories,
                                ...(
                                    Array.isArray(values?.Special_categories) &&
                                        !values.Special_categories.includes("NONE")
                                        ? { Special_categories_countries: values.countries }
                                        : {}
                                ),
                                Bid_strategy: values.Bid_strategy,
                                Budget_type: budgetType,
                                ...(budgetType === "lifetime" && values.adSchedulingToShowCampaign && {
                                    is_day_parting_enabled_campign: true,
                                    pacing_type: ["day_parting"]
                                }),
                                Daily_amount: Math.round(parseFloat(values.Daily_amount) * 100),
                                Status: "PAUSED",
                                access_token: newImageHash.launchingToken,
                                createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
                            },
                        };
                        for (let i = 0; i < values.adsets.length; i++) {
                            let AdsetsData = {};
                            const imagesHashArray = await customRequest(
                                values.Name,
                                account,
                                values.adsets[i],
                                i,
                                onSuccess,
                                onError,
                                values.adsets[i].id
                            );

                            const addLevelData = buildAddLevelData({
                                adset: values.adsets[i],
                                account,
                                page_id,
                                imagesHashArray,
                                isDynamicCreative: Boolean(
                                    values.adsets[i]?.isDynamicCreative
                                ),
                            });

                            // console.log("Uploaded media:", imagesHashArray);
                            // console.log("Final addLevel:", addLevelData);
                            AdsetsData[`adsetlevel_${i + 1}`] = {
                                id: values.adsets[i].id,
                                AdsetName: values.adsets[i].AdsetName,
                                Budget_type: budgetType,
                                Daily_amount: values.adsets[i].DailyAdd_amount
                                    ? Math.round(parseFloat(values.adsets[i].DailyAdd_amount) * 100)
                                    : "",
                                optimization_goal: values.adsets[i].optimization_goal,
                                billing_event: values.adsets[i].billing_event,
                                start_time: moment(values.adsets[i].DatePicker.$d)
                                    .tz(newImageHash.timeZone)
                                    .format("YYYY-MM-DDTHH:mm:ssZ"), //values.adsets[i].DatePicker.$d
                                ...(values.adsets[i].DatePickerEnd && budgetType === "lifetime"
                                    ? {
                                        end_time: moment(values.adsets[i].DatePickerEnd.$d)
                                            .tz(newImageHash.timeZone)
                                            .format("YYYY-MM-DDTHH:mm:ssZ"),
                                    }
                                    : {}),
                                ...(values.adsets[i].isDynamicCreative
                                    ? {
                                        is_dynamic_creative: true
                                    }
                                    : {}),
                                action_source: values.adsets[i].action_source,
                                custom_event_type: values.adsets[i].custom_event_type,
                                pixel_id: pixel_id,
                                ...(values.adsets[i].isDynamicCreative
                                    ? {
                                        is_dynamic_creative: true
                                    }
                                    : {}),
                                bid_amount: values.adsets[i].bid_amount
                                    ? Math.round(Number(values.adsets[i].bid_amount) * 100)
                                    : 0,
                                countries: values.adsets[i].countries,
                                Min_Age: values.adsets[i].Min_Age,
                                minAgeToggle: values.adsets[i].minAgeEnabled ?? true,
                                Max_Age: values.adsets[i].Max_Age,
                                Gender: parseInt(values.adsets[i].Gender),
                                locales: values.adsets[i].Language,
                                ...(
                                    adSchedulingToShowCampaign
                                        ? {
                                            adschedule: values.adsets[i].ad_schedule || [],
                                        }
                                        :
                                        values.adsets[i].adSchedulingEnabled
                                            ? {
                                                is_day_parting_enabled: true,
                                                pacing_type: ["day_parting"],
                                                adschedule: values.adsets[i].ad_schedule || [],
                                            }
                                            : {}
                                ),
                                placements: values.adsets[i].placements,
                                ...(values.adsets[i].placements !== "Advance" && {
                                    publisher_platforms: values.adsets[i].platforms,
                                    Facebook_positions:
                                        extractValuesByPartialLabel(
                                            values.adsets[i].selectedPositions,
                                            "Facebook"
                                        ) || [],
                                    instagram_positions:
                                        extractValuesByPartialLabel(
                                            values.adsets[i].selectedPositions,
                                            "Instagram"
                                        ) || [],
                                    audience_network_positions:
                                        extractValuesByPartialLabel(
                                            values.adsets[i].selectedPositions,
                                            "Audience"
                                        ) || [],
                                    messenger_positions:
                                        extractValuesByPartialLabel(
                                            values.adsets[i].selectedPositions,
                                            "Messenger"
                                        ) || [],
                                    position: values.adsets[i].positions,
                                    device_platforms: values.adsets[i].device_platforms,
                                }),
                                ...(values.adsets[i].Beneficiary
                                    ? { beneficiary: values.adsets[i].Beneficiary[account].trim() }
                                    : {}),
                                ...(values.adsets[i].Beneficiary
                                    ? values.adsets[i].Payer ? { payer: values.adsets[i].Payer[account].trim() } : { payer: values.adsets[i].Beneficiary[account].trim() }
                                    : {}),
                                buying_type: "AUCTION",
                                addlevel: addLevelData,
                            };
                            AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
                        }
                        multipleAccountsData.push(AllAdsetsData);
                    }
                }
            }
        }

        return multipleAccountsData;

    }

    /* =====================================================================
 * CreateTemplate  (single self-contained function)
 *
 * - Only uploads media to S3 (no image hash / video_id / thumbnail_url)
 * - Does NOT use customRequest / buildAddLevelData, so those stay untouched
 *   for the "create campaign" flow.
 *
 * Output per adset:
 *   addlevel: {
 *     AddName, Ads: [s3 urls], page_id, message, headline, Description,
 *     Caption, Website_URL,
 *     NewAds: [ { id, AddName, page_id, message, headline, Description,
 *                 Caption, Website_URL, filename, mediaType, ... } ]
 *   }
 * ===================================================================== */
    // const CreateTemplate = async (values) => {
    //     // console.log(values);

    //     /* ------------------------------------------------------------------
    //      * Helpers (all local to this function)
    //      * ---------------------------------------------------------------- */
    //     const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    //     const retryApi = async (apiCall, retries = 3, delay = 2000) => {
    //         let lastError;
    //         for (let attempt = 0; attempt < retries; attempt++) {
    //             try {
    //                 return await apiCall();
    //             } catch (error) {
    //                 lastError = error;
    //                 if (attempt < retries - 1) {
    //                     await sleep(delay);
    //                 }
    //             }
    //         }
    //         throw lastError;
    //     };

    //     const getFileMetadata = (file) => ({
    //         ...(file?.uid != null && { uid: file.uid }),
    //         ...(file?.key != null && { key: file.key }),
    //         ...(file?.name != null && { name: file.name }),
    //         ...(file?.type != null && { type: file.type }),
    //         ...(file?.size != null && { size: file.size }),
    //         ...(file?.lastModified != null && { lastModified: file.lastModified }),
    //     });

    //     const getFileType = (file, blob) => {
    //         const type = file?.type || blob?.type;
    //         if (type && type !== "application/octet-stream") {
    //             return type;
    //         }

    //         const name = [file?.name, file?.filename, file?.url, file?.s3Url, file?.key]
    //             .filter(Boolean)
    //             .join(" ");

    //         if (/\.(png|jpe?g|gif|webp|avif|bmp)(?:[?#].*)?$/i.test(name)) {
    //             return "image/*";
    //         }
    //         if (/\.(mp4|mov|avi|webm|m4v|mkv)(?:[?#].*)?$/i.test(name)) {
    //             return "video/*";
    //         }
    //         return "";
    //     };

    //     // If the media already has a URL (already in S3) we reuse it, no new upload.
    //     const getExistingUrl = (file) =>
    //         file?.url ||
    //         file?.s3Url ||
    //         (typeof file?.filename === "string" && /^https?:\/\//i.test(file.filename)
    //             ? file.filename
    //             : "");

    //     /* ------------------------------------------------------------------
    //      * Upload the media of one adset to S3.
    //      *  - media that already has a URL  -> reused as it is (no new S3 url)
    //      *  - local file (no URL)           -> uploaded to S3, new S3 url created
    //      * Returns [] when there is no media.
    //      * Result item: { ...metadata, success, filename: <s3 url>, mediaType, uploadFailed?, error? }
    //      * ---------------------------------------------------------------- */
    //     const uploadAdsetMediaToS3 = async (singleaccount, adset) => {
    //         try {
    //             // Media comes from adset.ads[].filename (File object, upload object, or array of them)
    //             const files = (Array.isArray(adset?.ads) ? adset.ads : []).flatMap((ad) => {
    //                 const filename = ad?.filename;
    //                 if (Array.isArray(filename)) {
    //                     return filename.filter(Boolean);
    //                 }
    //                 return filename ? [filename] : [];
    //             });

    //             if (!files.length) {
    //                 console.warn("No media found in adset.ads[].filename", adset?.ads);
    //                 return [];
    //             }

    //             // Upload context is needed only when at least one local file has to be uploaded
    //             const hasLocalFiles = files.some((file) => !getExistingUrl(file));

    //             let account = singleaccount;
    //             let authToken = "";
    //             let folderPath = "";
    //             let getAuthHeaders = () => ({});

    //             const createS3Folder = async () => {
    //                 const response = await axios.post("/api/campaigns/s3", null, {
    //                     headers: {
    //                         ...getAuthHeaders(),
    //                         "x-folder": `${folderPath.replace(/\/+$/, "")}/`,
    //                         "x-action": "create-folder",
    //                     },
    //                 });

    //                 if (response.status < 200 || response.status >= 300) {
    //                     throw new Error(`S3 folder creation failed (${response.status})`);
    //                 }
    //             };

    //             if (hasLocalFiles) {
    //                 const accountData = imageHashArray.find(
    //                     (item) => String(item.accountNumber) === String(singleaccount)
    //                 );

    //                 if (!accountData) {
    //                     throw new Error(`Account data not found for account ${singleaccount}`);
    //                 }

    //                 const { accountNumber, username: accUsername = "default-user" } = accountData;
    //                 account = accountNumber;

    //                 authToken = localStorage.getItem("token");
    //                 if (!authToken) {
    //                     throw new Error("Authentication token not found");
    //                 }

    //                 getAuthHeaders = () => ({
    //                     Authorization: authToken,
    //                     username: accUsername,
    //                 });

    //                 folderPath = `${network}/${account}/${values.Name || "Drafts"}`;
    //                 await createS3Folder();
    //             }

    //             const uploadFileToS3 = async (fileBlob, fileName) => {
    //                 if (!fileBlob) {
    //                     throw new Error(`Missing file data: ${fileName}`);
    //                 }

    //                 const formData = new FormData();
    //                 formData.append("file", fileBlob, fileName);
    //                 formData.append("filename", `${folderPath}/${fileName}`);

    //                 const response = await axios.post("/api/campaigns/s3", formData, {
    //                     headers: getAuthHeaders(),
    //                 });

    //                 const result = response?.data ?? null;
    //                 if (!result?.imageUrl) {
    //                     throw new Error(result?.message || "S3 upload failed");
    //                 }
    //                 return result.imageUrl;
    //             };

    //             const processSingleFile = async (file, fileIndex) => {
    //                 const metadata = getFileMetadata(file);

    //                 // 1. URL already exists -> reuse it, do NOT create a new S3 url
    //                 const existingUrl = getExistingUrl(file);

    //                 if (existingUrl) {
    //                     const fileType = getFileType(file, null);
    //                     const mediaType = fileType.startsWith("image/")
    //                         ? "image"
    //                         : fileType.startsWith("video/")
    //                             ? "video"
    //                             : "";

    //                     return {
    //                         ...metadata,
    //                         success: true,
    //                         filename: existingUrl,
    //                         mediaType,
    //                     };
    //                 }

    //                 // 2. Local file -> upload to S3 and create the new S3 url
    //                 let s3FileUrl = "";
    //                 let mediaType = "";

    //                 let fileName = file?.name || file?.filename?.split("/").pop() || "media";

    //                 const adName = `${account}_${adset?.AddName || "Ad"}_${fileIndex + 1}`;

    //                 try {
    //                     const originalFile = file?.originFileObj;
    //                     let fileBlob;

    //                     if (typeof Blob !== "undefined" && originalFile instanceof Blob) {
    //                         fileBlob = originalFile;
    //                     } else if (typeof Blob !== "undefined" && file instanceof Blob) {
    //                         fileBlob = file;
    //                     } else {
    //                         throw new Error(`Unable to read media: ${fileName}`);
    //                     }

    //                     const fileType = getFileType(file, fileBlob);
    //                     const isImage = fileType.startsWith("image/");
    //                     const isVideo = fileType.startsWith("video/");

    //                     if (!isImage && !isVideo) {
    //                         throw new Error(`Unsupported media type: ${fileName}`);
    //                     }

    //                     mediaType = isImage ? "image" : "video";

    //                     fileName = `blob_${uuidv4()}_${fileName}`;

    //                     console.log(`[${adName}] Uploading to S3...`);

    //                     s3FileUrl = await retryApi(
    //                         () => uploadFileToS3(fileBlob, fileName),
    //                         3,
    //                         2000
    //                     );

    //                     onSuccess?.("ok", { filename: s3FileUrl });

    //                     return {
    //                         ...metadata,
    //                         success: true,
    //                         filename: s3FileUrl,
    //                         mediaType,
    //                     };
    //                 } catch (error) {
    //                     console.error(
    //                         "Media processing failed:",
    //                         error?.response?.data || error?.message || error
    //                     );

    //                     onError?.("error", error);

    //                     return {
    //                         ...metadata,
    //                         success: false,
    //                         filename: s3FileUrl,
    //                         mediaType,
    //                         uploadFailed: true,
    //                         error:
    //                             error?.response?.data?.error?.message ||
    //                             error?.message ||
    //                             "Media upload failed",
    //                     };
    //                 }
    //             };

    //             // Keep the same order as the selected media, process 3 at a time
    //             const results = new Array(files.length);

    //             for (let start = 0; start < files.length; start += 3) {
    //                 const end = Math.min(start + 3, files.length);
    //                 const chunk = files.slice(start, end);

    //                 const settled = await Promise.allSettled(
    //                     chunk.map((file, chunkIndex) =>
    //                         processSingleFile(file, start + chunkIndex)
    //                     )
    //                 );

    //                 settled.forEach((result, chunkIndex) => {
    //                     results[start + chunkIndex] =
    //                         result.status === "fulfilled"
    //                             ? result.value
    //                             : {
    //                                 ...getFileMetadata(chunk[chunkIndex]),
    //                                 success: false,
    //                                 filename: "",
    //                                 mediaType: "",
    //                                 uploadFailed: true,
    //                                 error: result.reason?.message || "Media processing failed",
    //                             };
    //                 });
    //             }

    //             console.log("Final uploaded media results:", results);
    //             return results;
    //         } catch (error) {
    //             console.error(
    //                 "S3 upload failed:",
    //                 error?.response?.data || error?.message || error
    //             );
    //             onError?.("error", error);
    //             return [];
    //         }
    //     };

    //     /* ------------------------------------------------------------------
    //      * Build addlevel: OBJECT (old structure) + NewAds array
    //      * (no image_hash / video_id / thumbnail_url)
    //      * ---------------------------------------------------------------- */
    //     const buildAddLevel = ({ adset, account, page_id, mediaItems = [], isDynamicCreative = false }) => {
    //         const accountSettings =
    //             adset?.[account] ||
    //             adset?.accountSettings?.[account] ||
    //             {};

    //         const getAdFields = (ad, index) => ({
    //             id: uuidv4(),
    //             AddName: `${String(ad?.AddName ?? adset?.AddName ?? "Ad")}`,
    //             page_id,
    //             message: ad?.primaryText ?? ad?.messages ?? ad?.message ?? adset?.message,
    //             headline: ad?.headlines ?? ad?.headline ?? adset?.headline,
    //             Description:
    //                 ad?.descriptions ??
    //                 ad?.Description ??
    //                 ad?.description ??
    //                 adset?.Description,
    //             Caption: ad?.Caption ?? accountSettings?.Caption,
    //             Website_URL: ad?.Website_URL ?? accountSettings?.Website_URL,
    //         });

    //         const hasUploadFailure = mediaItems.some((media) => media?.uploadFailed || !media?.filename);

    //         let NewAds;

    //         if (isDynamicCreative) {
    //             // Dynamic creative: ONE ad (single object in the array),
    //             // filename = array of all file urls (array of strings)
    //             const sourceAd = adset?.ads?.[0] || {};

    //             const hasImages = mediaItems.some((media) => media?.mediaType === "image" && media?.filename);
    //             const hasVideos = mediaItems.some((media) => media?.mediaType === "video" && media?.filename);

    //             NewAds = [
    //                 {
    //                     ...getAdFields({ ...sourceAd, AddName: adset?.AdName }, 0),

    //                     filename: mediaItems
    //                         .map((media) => media?.filename)
    //                         .filter(Boolean),

    //                     call_to_action_types: ["LEARN_MORE"],

    //                     ad_formats: [
    //                         ...(hasImages ? ["SINGLE_IMAGE"] : []),
    //                         ...(hasVideos ? ["SINGLE_VIDEO"] : []),
    //                     ],

    //                     ...(hasUploadFailure ? { uploadFailed: true } : {}),
    //                 },
    //             ];
    //         } else {
    //             // Normal creative: one ad per media item
    //             NewAds = mediaItems.map((media, index) => {
    //                 const sourceAd = Array.isArray(adset?.ads) ? adset.ads[index] || {} : {};

    //                 return {
    //                     ...getAdFields({ ...sourceAd, AddName: sourceAd?.AdName }, index),
    //                     filename: media?.filename || "",
    //                     mediaType: media?.mediaType || "",
    //                     ...(media?.uploadFailed || !media?.filename ? { uploadFailed: true } : {}),
    //                 };
    //             });
    //         }

    //         // addlevel object (old structure) - values taken from the first ad, falling back to adset level
    //         const firstSourceAd = Array.isArray(adset?.ads) ? adset.ads[0] || {} : {};

    //         return {
    //             AddName: String(adset?.AddName ?? firstSourceAd?.AdName ?? ""),
    //             Ads: mediaItems.map((media) => media?.filename).filter(Boolean),
    //             page_id,
    //             message:
    //                 firstSourceAd?.primaryText ??
    //                 firstSourceAd?.messages ??
    //                 firstSourceAd?.message ??
    //                 adset?.message ??
    //                 "",
    //             headline: firstSourceAd?.headlines ?? firstSourceAd?.headline ?? adset?.headline ?? "",
    //             Description:
    //                 firstSourceAd?.descriptions ??
    //                 firstSourceAd?.Description ??
    //                 firstSourceAd?.description ??
    //                 adset?.Description ??
    //                 "",
    //             Caption: firstSourceAd?.Caption ?? accountSettings?.Caption ?? "",
    //             Website_URL: firstSourceAd?.Website_URL ?? accountSettings?.Website_URL ?? "",
    //             NewAds,
    //         };
    //     };

    //     /* ------------------------------------------------------------------
    //      * Main template creation
    //      * ---------------------------------------------------------------- */
    //     const category = reportCategories.find((item) => item.categoryId === values.reportCat);
    //     const multipleAccounts = values.Account_Number;
    //     const multipleAccountsData = [];

    //     for (const account of multipleAccounts) {
    //         const newImageHash = imageHashArray.find((item) => item.accountNumber === account);

    //         if (!newImageHash) {
    //             throw new Error(`Account data not found for account ${account}`);
    //         }

    //         const list_of_pixel_id = values.adsets[0].pixel_id;
    //         const list_of_page_id = values.adsets[0].ads[0].page_id;

    //         const matchedPageIds = list_of_page_id
    //             .filter((item) => item.includes(account))
    //             .map((item) => item.split("-")[1]?.trim());

    //         const matchedPixelIds = list_of_pixel_id
    //             .filter((item) => item.includes(account))
    //             .map((item) => item.split("-")[1]?.trim());

    //         const page_ids =
    //             page === "Pages"
    //                 ? matchedPageIds
    //                 : matchedPageIds.length > 0 ? [matchedPageIds[0]] : [];

    //         const pixel_ids =
    //             pixel === "Pixels"
    //                 ? matchedPixelIds
    //                 : matchedPixelIds.length > 0 ? [matchedPixelIds[0]] : [];

    //         // Upload each adset's local media to S3 only once per account
    //         // (page / pixel / country combinations reuse the same result)
    //         const uploadCache = {};
    //         const getUploadedMedia = (i) => {
    //             if (!uploadCache[i]) {
    //                 uploadCache[i] = uploadAdsetMediaToS3(account, values.adsets[i]);
    //             }
    //             return uploadCache[i];
    //         };

    //         // Geos: one template per country. Otherwise one template (null = keep the adset countries)
    //         const countryVariants =
    //             geo == "Geos"
    //                 ? (values.adsets[0].countries || []).map((country) => [String(country)])
    //                 : [null];

    //         for (const page_id of page_ids) {
    //             for (const pixel_id of pixel_ids) {
    //                 for (const countryOverride of countryVariants) {
    //                     let AllAdsetsData = {
    //                         Account_Number: account,
    //                         Category: category?.name,
    //                         Draft_Name: popupInputs?.input2 ?? "",
    //                         geo: geo,
    //                         pixel: pixel,
    //                         page: page,
    //                         camapaignlevel: {
    //                             createdby: username,
    //                             Name: values.Name || "",
    //                             Objectives: values.Objectives ?? "",
    //                             Special_categories:
    //                                 Array.isArray(values?.Special_categories) &&
    //                                     values.Special_categories.includes("NONE")
    //                                     ? "NONE"
    //                                     : values.Special_categories,
    //                             ...(Array.isArray(values?.Special_categories) &&
    //                                 !values.Special_categories.includes("NONE")
    //                                 ? { Special_categories_countries: values.countries }
    //                                 : {}),
    //                             Bid_strategy: values.Bid_strategy,
    //                             Budget_type: budgetType,
    //                             ...(budgetType === "lifetime" &&
    //                                 values.adSchedulingToShowCampaign && {
    //                                 is_day_parting_enabled_campign: true,
    //                                 pacing_type: ["day_parting"],
    //                             }),
    //                             Daily_amount: values.Daily_amount ? Math.round(parseFloat(values.Daily_amount) * 100) : 0,
    //                             Status: "PAUSED",
    //                             // access_token: newImageHash.launchingToken,
    //                             createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
    //                         },
    //                     };

    //                     for (let i = 0; i < values.adsets.length; i++) {
    //                         let AdsetsData = {};
    //                         const adset = values.adsets[i];

    //                         const mediaItems = await getUploadedMedia(i);

    //                         const addLevelData = buildAddLevel({
    //                             adset,
    //                             account,
    //                             page_id,
    //                             mediaItems,
    //                             isDynamicCreative: Boolean(adset?.isDynamicCreative),
    //                         });

    //                         AdsetsData[`adsetlevel_${i + 1}`] = {
    //                             id: adset.id,
    //                             AdsetName: adset.AdsetName || "",
    //                             Budget_type: budgetType,
    //                             Daily_amount: adset.DailyAdd_amount
    //                                 ? Math.round(parseFloat(adset.DailyAdd_amount) * 100)
    //                                 : "",
    //                             optimization_goal: adset.optimization_goal || "",
    //                             billing_event: adset.billing_event || "",
    //                             start_time: moment(adset.DatePicker.$d)
    //                                 .tz(newImageHash.timeZone)
    //                                 .format("YYYY-MM-DDTHH:mm:ssZ"),
    //                             ...(adset.DatePickerEnd && budgetType === "lifetime"
    //                                 ? {
    //                                     end_time: moment(adset.DatePickerEnd.$d)
    //                                         .tz(newImageHash.timeZone)
    //                                         .format("YYYY-MM-DDTHH:mm:ssZ"),
    //                                 }
    //                                 : {}),
    //                             ...(adset.isDynamicCreative ? { is_dynamic_creative: true } : {}),
    //                             action_source: adset.action_source || "",
    //                             custom_event_type: adset.custom_event_type || "",
    //                             pixel_id: pixel_id,
    //                             bid_amount: adset.bid_amount
    //                                 ? Math.round(Number(adset.bid_amount) * 100)
    //                                 : 0,
    //                             countries: countryOverride ?? adset.countries,
    //                             Min_Age: adset.Min_Age,
    //                             minAgeToggle: adset.minAgeEnabled ?? true,
    //                             Max_Age: adset.Max_Age,
    //                             Gender: parseInt(adset.Gender),
    //                             locales: adset.Language,
    //                             ...(adSchedulingToShowCampaign
    //                                 ? {
    //                                     adschedule: adset.ad_schedule || [],
    //                                 }
    //                                 : adset.adSchedulingEnabled
    //                                     ? {
    //                                         is_day_parting_enabled: true,
    //                                         pacing_type: ["day_parting"],
    //                                         adschedule: adset.ad_schedule || [],
    //                                     }
    //                                     : {}),
    //                             placements: adset.placements,
    //                             ...(adset.placements !== "Advance" && {
    //                                 publisher_platforms: adset.platforms,
    //                                 Facebook_positions:
    //                                     extractValuesByPartialLabel(adset.selectedPositions, "Facebook") || [],
    //                                 instagram_positions:
    //                                     extractValuesByPartialLabel(adset.selectedPositions, "Instagram") || [],
    //                                 audience_network_positions:
    //                                     extractValuesByPartialLabel(adset.selectedPositions, "Audience") || [],
    //                                 messenger_positions:
    //                                     extractValuesByPartialLabel(adset.selectedPositions, "Messenger") || [],
    //                                 position: adset.positions,
    //                                 device_platforms: adset.device_platforms,
    //                             }),
    //                             ...(adset.Beneficiary
    //                                 ? { beneficiary: adset.Beneficiary[account].trim() }
    //                                 : {}),
    //                             ...(adset.Beneficiary
    //                                 ? adset.Payer
    //                                     ? { payer: adset.Payer[account].trim() }
    //                                     : { payer: adset.Beneficiary[account].trim() }
    //                                 : {}),
    //                             buying_type: "AUCTION",
    //                             addlevel: addLevelData, // object (old structure) + NewAds array
    //                         };

    //                         AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
    //                     }

    //                     multipleAccountsData.push(AllAdsetsData);
    //                 }
    //             }
    //         }
    //     }

    //     return multipleAccountsData;
    // };

    const CreateTemplate = async (values) => {
        console.log(values);

        /* ------------------------------------------------------------------
         * Helpers (all local to this function)
         * ---------------------------------------------------------------- */
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const retryApi = async (apiCall, retries = 3, delay = 2000) => {
            let lastError;
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    return await apiCall();
                } catch (error) {
                    lastError = error;
                    if (attempt < retries - 1) {
                        await sleep(delay);
                    }
                }
            }
            throw lastError;
        };

        // const getFileMetadata = (file) => ({
        //     ...(file?.uid != null && { uid: file.uid }),
        //     ...(file?.key != null && { key: file.key }),
        //     ...(file?.name != null && { name: file.name }),
        //     ...(file?.type != null && { type: file.type }),
        //     ...(file?.size != null && { size: file.size }),
        //     ...(file?.lastModified != null && { lastModified: file.lastModified }),
        // });

        const isBlob = (v) => typeof Blob !== "undefined" && v instanceof Blob;

        const getFileMetadata = (file) =>
            file && typeof file === "object"
                ? {
                    ...(file.uid != null && { uid: file.uid }),
                    ...(file.key != null && { key: file.key }),
                    ...(file.name != null && { name: file.name }),
                    ...(file.type != null && { type: file.type }),
                    ...(file.size != null && { size: file.size }),
                    ...(file.lastModified != null && { lastModified: file.lastModified }),
                }
                : {};

        // Turns whatever is in ad.filename into a flat array of usable media items
        const flattenMedia = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value.flatMap(flattenMedia);
            if (typeof value === "string") return value.trim() ? [value.trim()] : [];
            if (isBlob(value)) return [value];
            if (typeof value === "object") {
                if (value.originFileObj || value.url || value.s3Url) return [value];
                if (typeof value.filename === "string") return value.filename.trim() ? [value] : [];
                if (value.filename) return flattenMedia(value.filename); // nested object/array
            }
            return []; // {} and anything unrecognised
        };

        // const getFileType = (file, blob) => {
        //     const type = file?.type || blob?.type;
        //     if (type && type !== "application/octet-stream") {
        //         return type;
        //     }

        //     const name = [file?.name, file?.filename, file?.url, file?.s3Url, file?.key]
        //         .filter(Boolean)
        //         .join(" ");

        //     if (/\.(png|jpe?g|gif|webp|avif|bmp)(?:[?#].*)?$/i.test(name)) {
        //         return "image/*";
        //     }
        //     if (/\.(mp4|mov|avi|webm|m4v|mkv)(?:[?#].*)?$/i.test(name)) {
        //         return "video/*";
        //     }
        //     return "";
        // };

        const getFileType = (file, blob) => {
            const type = (typeof file === "object" && file?.type) || blob?.type;
            if (type && type !== "application/octet-stream") return type;

            const f = typeof file === "string" ? { url: file } : file;
            const name = [f?.name, typeof f?.filename === "string" && f.filename, f?.url, f?.s3Url, f?.key]
                .filter(Boolean)
                .join(" ");

            if (/\.(png|jpe?g|gif|webp|avif|bmp)(?:[?#].*)?$/i.test(name)) return "image/*";
            if (/\.(mp4|mov|avi|webm|m4v|mkv)(?:[?#].*)?$/i.test(name)) return "video/*";
            return "";
        };

        // // If the media already has a URL (already in S3) we reuse it, no new upload.
        // const getExistingUrl = (file) =>
        //     file?.url ||
        //     file?.s3Url ||
        //     (typeof file?.filename === "string" && /^https?:\/\//i.test(file.filename)
        //         ? file.filename
        //         : "");

        // Already-hosted URL for any supported shape, or "" if the file must be uploaded
        const getExistingUrl = (file) => {
            if (typeof file === "string") return file.trim();
            if (!file || isBlob(file)) return "";
            const url =
                file.url ||
                file.s3Url ||
                (typeof file.filename === "string" ? file.filename.trim() : "") ||
                "";
            return /^blob:/i.test(url) ? "" : url;
        };


        // Same as the old template: take the entry that belongs to this account
        // and use the last part after "-" (e.g. "act_123 - 456" -> "456")
        const getIdForAccount = (list, account) => {
            const found = (Array.isArray(list) ? list : []).find((item) => item.includes(account));
            if (!found) return "";
            const parts = found.split("-");
            return parts[parts.length - 1].trim();
        };

        /* ------------------------------------------------------------------
         * Upload the media of one adset to S3.
         *  - media that already has a URL  -> reused as it is (no new S3 url)
         *  - local file (no URL)           -> uploaded to S3, new S3 url created
         * Returns [] when there is no media.
         * Result item: { ...metadata, success, filename: <s3 url>, mediaType, uploadFailed?, error? }
         * ---------------------------------------------------------------- */
        const uploadAdsetMediaToS3 = async (singleaccount, adset) => {
            try {
                // Media comes from adset.ads[].filename (File object, upload object, or array of them)
                // const files = (Array.isArray(adset?.ads) ? adset.ads : []).flatMap((ad) => {
                //     const filename = ad?.filename;
                //     if (Array.isArray(filename)) {
                //         return filename.filter(Boolean);
                //     }
                //     return filename ? [filename] : [];
                // });

                // if (!files.length) {
                //     console.warn("No media found in adset.ads[].filename", adset?.ads);
                //     return [];
                // }

                const entries = (Array.isArray(adset?.ads) ? adset.ads : []).flatMap((ad, adIndex) =>
                    flattenMedia(ad?.filename).map((file) => ({ file, adIndex }))
                );
                const files = entries.map((e) => e.file);

                if (!files.length) {
                    console.warn("No media found in adset.ads[].filename", adset?.ads);
                    return [];
                }

                // Upload context is needed only when at least one local file has to be uploaded
                const hasLocalFiles = files.some((file) => !getExistingUrl(file));

                let account = singleaccount;
                let authToken = "";
                let folderPath = "";
                let getAuthHeaders = () => ({});

                const createS3Folder = async () => {
                    const response = await axios.post("/api/campaigns/s3", null, {
                        headers: {
                            ...getAuthHeaders(),
                            "x-folder": `${folderPath.replace(/\/+$/, "")}/`,
                            "x-action": "create-folder",
                        },
                    });

                    if (response.status < 200 || response.status >= 300) {
                        throw new Error(`S3 folder creation failed (${response.status})`);
                    }
                };

                if (hasLocalFiles) {
                    const accountData = imageHashArray.find(
                        (item) => String(item.accountNumber) === String(singleaccount)
                    );

                    if (!accountData) {
                        throw new Error(`Account data not found for account ${singleaccount}`);
                    }

                    const { accountNumber, username: accUsername = "default-user" } = accountData;
                    account = accountNumber;

                    authToken = localStorage.getItem("token");
                    if (!authToken) {
                        throw new Error("Authentication token not found");
                    }

                    getAuthHeaders = () => ({
                        Authorization: authToken,
                        username: accUsername,
                    });

                    folderPath = `${network}/${account}/${values.Name || "Drafts"}`;
                    await createS3Folder();
                }

                const uploadFileToS3 = async (fileBlob, fileName) => {
                    if (!fileBlob) {
                        throw new Error(`Missing file data: ${fileName}`);
                    }

                    const formData = new FormData();
                    formData.append("file", fileBlob, fileName);
                    formData.append("filename", `${folderPath}/${fileName}`);

                    const response = await axios.post("/api/campaigns/s3", formData, {
                        headers: getAuthHeaders(),
                    });

                    const result = response?.data ?? null;
                    if (!result?.imageUrl) {
                        throw new Error(result?.message || "S3 upload failed");
                    }
                    return result.imageUrl;
                };

                const processSingleFile = async (file, fileIndex) => {
                    const metadata = getFileMetadata(file);

                    // 1. URL already exists -> reuse it, do NOT create a new S3 url
                    const existingUrl = getExistingUrl(file);

                    if (existingUrl) {
                        const fileType = getFileType(file, null);
                        const mediaType = fileType.startsWith("image/")
                            ? "image"
                            : fileType.startsWith("video/")
                                ? "video"
                                : "";

                        return {
                            ...metadata,
                            success: true,
                            filename: existingUrl,
                            mediaType,
                        };
                    }

                    // 2. Local file -> upload to S3 and create the new S3 url
                    let s3FileUrl = "";
                    let mediaType = "";

                    let fileName = file?.name || file?.filename?.split("/").pop() || "media";

                    const adName = `${account}_${adset?.AddName || "Ad"}_${fileIndex + 1}`;

                    try {
                        const originalFile = file?.originFileObj;
                        let fileBlob;

                        if (typeof Blob !== "undefined" && originalFile instanceof Blob) {
                            fileBlob = originalFile;
                        } else if (typeof Blob !== "undefined" && file instanceof Blob) {
                            fileBlob = file;
                        } else {
                            throw new Error(`Unable to read media: ${fileName}`);
                        }

                        const fileType = getFileType(file, fileBlob);
                        const isImage = fileType.startsWith("image/");
                        const isVideo = fileType.startsWith("video/");

                        if (!isImage && !isVideo) {
                            throw new Error(`Unsupported media type: ${fileName}`);
                        }

                        mediaType = isImage ? "image" : "video";

                        fileName = `blob_${uuidv4()}_${fileName}`;

                        console.log(`[${adName}] Uploading to S3...`);

                        s3FileUrl = await retryApi(
                            () => uploadFileToS3(fileBlob, fileName),
                            3,
                            2000
                        );

                        onSuccess?.("ok", { filename: s3FileUrl });

                        return {
                            ...metadata,
                            success: true,
                            filename: s3FileUrl,
                            mediaType,
                        };
                    } catch (error) {
                        console.error(
                            "Media processing failed:",
                            error?.response?.data || error?.message || error
                        );

                        onError?.("error", error);

                        return {
                            ...metadata,
                            success: false,
                            filename: s3FileUrl,
                            mediaType,
                            uploadFailed: true,
                            error:
                                error?.response?.data?.error?.message ||
                                error?.message ||
                                "Media upload failed",
                        };
                    }
                };

                // Keep the same order as the selected media, process 3 at a time
                const results = new Array(files.length);

                for (let start = 0; start < files.length; start += 3) {
                    const end = Math.min(start + 3, files.length);
                    const chunk = files.slice(start, end);

                    const settled = await Promise.allSettled(
                        chunk.map((file, chunkIndex) =>
                            processSingleFile(file, start + chunkIndex)
                        )
                    );

                    settled.forEach((result, chunkIndex) => {
                        results[start + chunkIndex] =
                            result.status === "fulfilled"
                                ? result.value
                                : {
                                    ...getFileMetadata(chunk[chunkIndex]),
                                    success: false,
                                    filename: "",
                                    mediaType: "",
                                    uploadFailed: true,
                                    error: result.reason?.message || "Media processing failed",
                                };
                    });
                }

                console.log("Final uploaded media results:", results);
                return results;
            } catch (error) {
                console.error(
                    "S3 upload failed:",
                    error?.response?.data || error?.message || error
                );
                onError?.("error", error);
                return [];
            }
        };

        /* ------------------------------------------------------------------
         * Build addlevel: OBJECT (old structure) + NewAds array
         * (no image_hash / video_id / thumbnail_url)
         * ---------------------------------------------------------------- */
        const buildAddLevel = ({ adset, account, page_id, mediaItems = [], isDynamicCreative = false }) => {
            const accountSettings =
                adset?.[account] ||
                adset?.accountSettings?.[account] ||
                {};

            const getAdFields = (ad, index) => ({
                id: uuidv4(),
                AddName: `${String(ad?.AddName ?? adset?.AddName ?? "Ad")}`,
                page_id,
                message: ad?.primaryText ?? ad?.messages ?? ad?.message ?? adset?.message ?? "",
                headline: ad?.headlines ?? ad?.headline ?? adset?.headline ?? "",
                Description:
                    ad?.descriptions ??
                    ad?.Description ??
                    ad?.description ??
                    adset?.Description ?? "",
                Caption: ad?.Caption ?? accountSettings?.Caption ?? "",
                Website_URL: ad?.Website_URL ?? accountSettings?.Website_URL ?? "",
            });

            const hasUploadFailure = mediaItems.some((media) => media?.uploadFailed || !media?.filename);

            let NewAds;

            if (isDynamicCreative) {
                // Dynamic creative: ONE ad (single object in the array),
                // filename = array of all file urls (array of strings)
                const sourceAd = adset?.ads?.[0] || {};

                const hasImages = mediaItems.some((media) => media?.mediaType === "image" && media?.filename);
                const hasVideos = mediaItems.some((media) => media?.mediaType === "video" && media?.filename);

                NewAds = [
                    {
                        ...getAdFields({ ...sourceAd, AddName: adset?.AdName }, 0),

                        filename: mediaItems
                            .map((media) => media?.filename)
                            .filter(Boolean),

                        // call_to_action_types: ["LEARN_MORE"],

                        // ad_formats: [
                        //     ...(hasImages ? ["SINGLE_IMAGE"] : []),
                        //     ...(hasVideos ? ["SINGLE_VIDEO"] : []),
                        // ],

                        // ...(hasUploadFailure ? { uploadFailed: true } : {}),
                    },
                ];
            } else {
                // Normal creative: one ad per media item
                NewAds = mediaItems.map((media, index) => {
                    const sourceAd = Array.isArray(adset?.ads) ? adset.ads[index] || {} : {};

                    return {
                        ...getAdFields({ ...sourceAd, AddName: sourceAd?.AdName }, index),
                        filename: media?.filename || "",
                        mediaType: media?.mediaType || "",
                        ...(media?.uploadFailed || !media?.filename ? { uploadFailed: true } : {}),
                    };
                });
            }

            // addlevel object (old structure) - values taken from the first ad, falling back to adset level
            const firstSourceAd = Array.isArray(adset?.ads) ? adset.ads[0] || {} : {};

            return {
                AddName: String(adset?.AddName ?? firstSourceAd?.AdName ?? ""),
                Ads: mediaItems.map((media) => media?.filename).filter(Boolean),
                page_id,
                message:
                    firstSourceAd?.primaryText ??
                    firstSourceAd?.messages ??
                    firstSourceAd?.message ??
                    adset?.message ??
                    "",
                headline: firstSourceAd?.headlines ?? firstSourceAd?.headline ?? adset?.headline ?? "",
                Description:
                    firstSourceAd?.descriptions ??
                    firstSourceAd?.Description ??
                    firstSourceAd?.description ??
                    adset?.Description ??
                    "",
                Caption: firstSourceAd?.Caption ?? accountSettings?.Caption ?? "",
                Website_URL: firstSourceAd?.Website_URL ?? accountSettings?.Website_URL ?? "",
                NewAds,
            };
        };

        /* ------------------------------------------------------------------
         * Main template creation
         * ONE template per selected account (same as the old template).
         * No loops over pages / pixels / geos: geo, pixel and page are only
         * stored as flags in the template, the campaign creation expands them later.
         * ---------------------------------------------------------------- */
        const category = reportCategories.find((item) => item.categoryId === values.reportCat);
        const multipleAccounts = values.Account_Number;
        const multipleAccountsData = [];

        for (const account of multipleAccounts) {
            const newImageHash = imageHashArray.find((item) => item.accountNumber === account);

            if (!newImageHash) {
                throw new Error(`Account data not found for account ${account}`);
            }

            // Single page id / pixel id of this account (same logic as the old template)
            const page_id = getIdForAccount(values.adsets[0]?.ads?.[0]?.page_id, account);
            const pixel_id = getIdForAccount(values.adsets[0]?.pixel_id, account);

            let AllAdsetsData = {
                Account_Number: account,
                Category: category?.name,
                Draft_Name: popupInputs?.input2 ?? "",
                geo: geo,
                pixel: pixel,
                page: page,
                createdby: username,
                createdDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
                editedDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
                camapaignlevel: {
                    createdby: username,
                    Name: values.Name || "",
                    Objectives: values.Objectives ?? "",
                    Special_categories:
                        Array.isArray(values?.Special_categories) &&
                            values.Special_categories.includes("NONE")
                            ? "NONE"
                            : values.Special_categories,
                    ...(Array.isArray(values?.Special_categories) &&
                        !values.Special_categories.includes("NONE")
                        ? { Special_categories_countries: values.countries }
                        : {}),
                    Bid_strategy: values.Bid_strategy,
                    Budget_type: budgetType,
                    ...(budgetType === "lifetime" &&
                        values.adSchedulingToShowCampaign && {
                        is_day_parting_enabled_campign: true,
                        pacing_type: ["day_parting"],
                    }),
                    Daily_amount: values.Daily_amount ? Math.round(parseFloat(values.Daily_amount) * 100) : 0,
                    Status: "PAUSED",
                    // access_token: newImageHash.launchingToken,
                    createdDate: moment().tz(newImageHash.timeZone).format("YYYY-MM-DD"),
                },
            };

            for (let i = 0; i < values.adsets.length; i++) {
                let AdsetsData = {};
                const adset = values.adsets[i];

                // Local files are uploaded to S3, existing urls are reused
                const mediaItems = await uploadAdsetMediaToS3(account, adset);

                const addLevelData = buildAddLevel({
                    adset,
                    account,
                    page_id,
                    mediaItems,
                    isDynamicCreative: Boolean(adset?.isDynamicCreative),
                });

                AdsetsData[`adsetlevel_${i + 1}`] = {
                    id: adset.id,
                    AdsetName: adset.AdsetName || "",
                    Budget_type: budgetType,
                    Daily_amount: adset.DailyAdd_amount
                        ? Math.round(parseFloat(adset.DailyAdd_amount) * 100)
                        : "",
                    optimization_goal: adset.optimization_goal || "",
                    billing_event: adset.billing_event || "",
                    start_time: moment(adset.DatePicker.$d)
                        .tz(newImageHash.timeZone)
                        .format("YYYY-MM-DDTHH:mm:ssZ"),
                    ...(adset.DatePickerEnd && budgetType === "lifetime"
                        ? {
                            end_time: moment(adset.DatePickerEnd.$d)
                                .tz(newImageHash.timeZone)
                                .format("YYYY-MM-DDTHH:mm:ssZ"),
                        }
                        : {}),
                    ...(adset.isDynamicCreative ? { is_dynamic_creative: true } : {}),
                    action_source: adset.action_source || "",
                    custom_event_type: adset.custom_event_type || "",
                    pixel_id: pixel_id,
                    bid_amount: adset.bid_amount
                        ? Math.round(Number(adset.bid_amount) * 100)
                        : 0,
                    countries: adset.countries, // all selected countries as they are (no per-country split)
                    Min_Age: adset.Min_Age,
                    minAgeToggle: adset.minAgeEnabled ?? true,
                    Max_Age: adset.Max_Age,
                    Gender: parseInt(adset.Gender),
                    locales: adset.Language,
                    ...(adSchedulingToShowCampaign
                        ? {
                            adschedule: adset.ad_schedule || [],
                        }
                        : adset.adSchedulingEnabled
                            ? {
                                is_day_parting_enabled: true,
                                pacing_type: ["day_parting"],
                                adschedule: adset.ad_schedule || [],
                            }
                            : {}),
                    placements: adset.placements,
                    ...(adset.placements !== "Advance" && {
                        publisher_platforms: adset.platforms,
                        Facebook_positions:
                            extractValuesByPartialLabel(adset.selectedPositions, "Facebook") || [],
                        instagram_positions:
                            extractValuesByPartialLabel(adset.selectedPositions, "Instagram") || [],
                        audience_network_positions:
                            extractValuesByPartialLabel(adset.selectedPositions, "Audience") || [],
                        messenger_positions:
                            extractValuesByPartialLabel(adset.selectedPositions, "Messenger") || [],
                        position: adset.positions,
                        device_platforms: adset.device_platforms,
                    }),
                    ...(adset.Beneficiary
                        ? { beneficiary: adset.Beneficiary[account].trim() }
                        : {}),
                    ...(adset.Beneficiary
                        ? adset.Payer
                            ? { payer: adset.Payer[account].trim() }
                            : { payer: adset.Beneficiary[account].trim() }
                        : {}),
                    buying_type: "AUCTION",
                    addlevel: addLevelData, // object (old structure) + NewAds array
                };

                AllAdsetsData = { ...AllAdsetsData, ...AdsetsData };
            }

            multipleAccountsData.push(AllAdsetsData);
        }

        return multipleAccountsData;
    };

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

    const handleOk = async () => {
        setIsModalOpenToCreate(false)
        setLoading(true);
        const campaignData = await MultipleAdsetsFetching(formValues);
        try {
            // console.log(campaignData);
            if (campaignData) {
                // console.log("hi");
                for (const campaign of campaignData) {
                    await axios.post("/api/campaigns/create/createcampaign", { ...campaign })
                }
                setCampaignSchedulingEnabled(false);
                form.resetFields();
                setBudgetType("daily");
                setPages("Page");
                setPixels("Pixel");
                setGeos("Geo");
                setErrors({
                    input1: "",
                    input2: "",
                    reportCat: ""
                });
                setSelectedTemplate(null);
                onClose();
            }
            changeRRefrst();

        }
        catch (error) {
            console.error("Error during campaign creation:", error);
            messageApi.error("An error occurred while creating the campaign.");
        } finally {
            setLoading(false); // Stop the spinner after the process is complete
        }
    }


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
            minAgeEnabled:
                source.minAgeEnabled ?? Number(source.Min_Age ?? 18) <= 25,
            adSchedulingEnabled: source.adSchedulingEnabled ?? false,
            selectedScheduleCells: source.selectedScheduleCells || {},
            ad_schedule: source.ad_schedule || {}
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
                    mode="create"
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
                    <span>Create a new campaign</span>
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
                            <CampaignTemplates
                                userData={userData}
                                accounts={accountis}
                                draftsByAccount={draftsData}
                                theme={theme}
                                networksWithStatus={networksWithStatus}
                                onSelectTemplate={(template, action) => {
                                    console.log("Selected template:", template, "Action:", action);
                                    setSelectedTemplate(template);
                                    if (action === "edit") {
                                        setIsEditingDraft(true);
                                        setPopupInputs(prev => ({ ...prev, input2: template.Draft_Name }))
                                    }
                                }}
                                userdetails={userdetails}
                            />

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
                            {selectedTemplate && <p><strong>Selected Template:</strong> {selectedTemplate?.Draft_Name ?? "Draft"}</p>}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "nowrap",
                                flexShrink: 0,
                            }}
                        >
                            <Tooltip
                                title={
                                    geo === "Geos"
                                        ? "Turn off to launch campaign in multiple geos at once"
                                        : "Turn on to launch campaign in individual geo"
                                }
                                styles={{
                                    container: {
                                        backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                        color: theme === "dark" ? "#ffffff" : "#000000",
                                        borderRadius: 6,
                                        padding: "6px 10px",
                                        fontSize: 14,
                                    },
                                }}
                            >
                                <Switch
                                    checked={geo === "Geos"}
                                    onChange={(checked) => setGeos(checked ? "Geos" : "Geo")}
                                    checkedChildren="Geos"
                                    unCheckedChildren="Geo"
                                    style={{
                                        backgroundColor: geo === "Geos" ? "#91C25F" : "#d9d9d9",
                                    }}
                                />
                            </Tooltip>

                            <Tooltip
                                title={
                                    pixel === "Pixels"
                                        ? "Turn off to launch campaign in single Pixel"
                                        : "Turn on to launch campaigns in multiple Pixels"
                                }
                                styles={{
                                    container: {
                                        backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                        color: theme === "dark" ? "#ffffff" : "#000000",
                                        borderRadius: 6,
                                        padding: "6px 10px",
                                        fontSize: 14,
                                    },
                                }}
                            >
                                <Switch
                                    checked={pixel === "Pixels"}
                                    onChange={(checked) => setPixels(checked ? "Pixels" : "Pixel")}
                                    checkedChildren="Pixels"
                                    unCheckedChildren="Pixel"
                                    style={{
                                        backgroundColor: pixel === "Pixels" ? "#91C25F" : "#d9d9d9",
                                    }}
                                />
                            </Tooltip>

                            <Tooltip
                                title={
                                    page === "Pages"
                                        ? "Turn off to launch campaign in single Page"
                                        : "Turn on to launch campaigns in multiple Pages"
                                }
                                styles={{
                                    container: {
                                        backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                        color: theme === "dark" ? "#ffffff" : "#000000",
                                        borderRadius: 6,
                                        padding: "6px 10px",
                                        fontSize: 14,
                                    },
                                }}
                            >
                                <Switch
                                    checked={page === "Pages"}
                                    onChange={(checked) => setPages(checked ? "Pages" : "Page")}
                                    checkedChildren="Pages"
                                    unCheckedChildren="Page"
                                    style={{
                                        backgroundColor: page === "Pages" ? "#91C25F" : "#d9d9d9",
                                    }}
                                />
                            </Tooltip>
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
                                                                        disabled={fields.length <= 1}
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={event => {
                                                                            event.stopPropagation();
                                                                            deleteAdset(adsetId);
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
                                                                        key={form.getFieldValue(["adsets", field.name, "id"])}
                                                                        form={form}
                                                                        adsetId={form.getFieldValue(["adsets", field.name, "id"])}
                                                                        index={field.name}
                                                                        mode="create"
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

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            gap: 10,
                            marginTop: 16
                        }}
                    >
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: "#91c25F" }}>
                            Create Campaign
                        </Button>
                        <Popconfirm
                            icon={null}
                            // overlayInnerStyle={{
                            //     backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                            //     color: theme === "dark" ? "#fff" : "#333",
                            // }}
                            styles={{
                                container: {
                                    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                                    color: theme === "dark" ? "#fff" : "#333",
                                }
                            }}
                            description={
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10,
                                    }}
                                >
                                    {errors.input1 && (
                                        <div style={{ color: "red", fontSize: 12 }}>
                                            {errors.input1}
                                        </div>
                                    )}

                                    <span
                                        style={{
                                            color: theme === "dark" ? "#fff" : "#333",
                                        }}
                                    >
                                        Template Name
                                    </span>

                                    <Input
                                        placeholder="Template Name"
                                        value={popupInputs.input2}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setPopupInputs((s) => ({
                                                ...s,
                                                input2: value,
                                            }));

                                            // Remove error once user starts entering value
                                            if (value.trim()) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    input2: "",
                                                }));
                                            }
                                        }}
                                        status={errors.input2 ? "error" : ""}
                                        className={
                                            theme === "dark"
                                                ? "custom-input-dark"
                                                : "custom-input-light"
                                        }
                                        style={{ width: 250 }}
                                    />

                                    {errors.input2 && (
                                        <div style={{ color: "red", fontSize: 12 }}>
                                            {errors.input2}
                                        </div>
                                    )}
                                </div>
                            }
                            open={open}
                            onOpenChange={setOpen}
                            onConfirm={handleConfirmWithValidation}
                            cancelButtonProps={{
                                style: {
                                    backgroundColor: theme === "dark" ? "#555" : "transparent",
                                    color: theme === "dark" ? "#fff" : "#000",
                                    border: "1px solid #4caf50",
                                },
                            }}
                            okButtonProps={{
                                loading: confirmLoading,
                                style: {
                                    backgroundColor: "#91C25F",
                                    color: "#000",
                                    border: "none",
                                },
                            }}
                        >
                            <Button
                                type="primary"
                                style={{
                                    background: "#91c25f",
                                    minWidth: "80px",
                                    borderWidth: "0px",
                                }}
                                onClick={() => setOpen(true)}
                            >
                                {isEditingDraft ? "Save" : "Save Template"}
                            </Button>
                        </Popconfirm>
                        <Button onClick={handleDrawerClose} style={{ border: "1px solid #ff4d4f", color: "#ff4d4f" }}>
                            Cancel
                        </Button>
                    </div>
                    {validationErrors.length > 0 && (
                        <div
                            style={{
                                marginBottom: 16,
                                padding: 12,
                                border: "1px solid #ff4d4f",
                                borderRadius: 6,
                                background: "#fff2f0",
                                color: "#cf1322",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                Please fix the following validation errors:
                            </div>

                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {validationErrors.map((error, index) => (
                                    <li key={`${error.field}-${index}`}>
                                        <strong>{error.field}:</strong> {error.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Form>
            </Spin>
            <Modal
                title="Confirmation"
                open={isModalOpenToCreate}
                onOk={handleOk}
                onCancel={() => setIsModalOpenToCreate(false)}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
            >
                <p>Are you sure you want to submit?</p>
            </Modal>
            <Modal
                title="Edit Accounts"
                open={isEditAccountsModalOpen}
                onCancel={() => setIsEditAccountsModalOpen(false)}
                okText="Yes, Update"
                cancelText="Close"
                confirmLoading={confirmLoading}
                onOk={handleEditDraft}
            >
                <p>This draft is present in these accounts:</p>
                <ul>
                    {matchedAccounts.length > 0
                        ? matchedAccounts.map((acc, idx) => <li key={idx}>{acc}</li>)
                        : <li>No matching accounts found</li>
                    }
                </ul>
            </Modal>
        </Modal>
    );
};

export default CreateCampaignDrawer;