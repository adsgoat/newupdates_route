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
// import CampaignTemplates from "@/components/campaigns/campaigntemplates";
import moment from "moment-timezone";
import dayjs from "dayjs";
import { Description } from "@mui/icons-material";

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

const EditCampaignDrawer = ({
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

    const MultipleAdsetsFetching = async (values) => {
        /*
         * =========================================================
         * SINGLE ACCOUNT
         * =========================================================
         */

        const account = Array.isArray(values?.Account_Number)
            ? values.Account_Number[0]
            : values?.Account_Number;

        const category = reportCategories.find(
            item => item.categoryId === values.reportCat
        );

        /*
         * =========================================================
         * HELPERS
         * =========================================================
         */

        const normalizeArray = (value) => {
            if (!Array.isArray(value)) {
                return value === undefined || value === null
                    ? []
                    : [value];
            }

            return value
                .map(item => {
                    if (
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                    ) {
                        return (
                            item.key ??
                            item.value ??
                            item.label ??
                            ""
                        );
                    }

                    return item;
                })
                .map(item => String(item ?? "").trim())
                .filter(Boolean)
                .sort();
        };

        const isSame = (oldValue, newValue) => {
            if (
                Array.isArray(oldValue) ||
                Array.isArray(newValue)
            ) {
                return (
                    JSON.stringify(normalizeArray(oldValue)) ===
                    JSON.stringify(normalizeArray(newValue))
                );
            }

            return (
                String(oldValue ?? "").trim() ===
                String(newValue ?? "").trim()
            );
        };

        const amountToCents = (value) => {
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                return 0;
            }

            return Math.round(parseFloat(value) * 100);
        };

        const hasId = (value) => {
            return (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            );
        };

        const hasRelaunchFlag = (obj) =>
            Object.keys(obj || {}).some(
                key => key.startsWith("re_lunch") && obj[key]
            );

        const removeRelaunchFlags = (obj) => {
            Object.keys(obj).forEach(key => {
                if (key.startsWith("re_lunch")) {
                    delete obj[key];
                }
            });

            return obj;
        };

        /*
         * =========================================================
         * CAMPAIGN EXISTING / NEW CHECK
         * =========================================================
         */

        const oldCampaign =
            selectedTemplate?.camapaignlevel || {};

        const campaignId =
            oldCampaign?.campaignid ??
            oldCampaign?.campaign_id ??
            null;

        const isExistingCampaign =
            hasId(campaignId);

        /*
         * =========================================================
         * ACCOUNT IMAGE HASH / ACCOUNT DETAILS
         * =========================================================
         */

        const accountImageHash = imageHashArray?.find(
            item =>
                String(item?.accountNumber) ===
                String(account)
        );

        /*
         * =========================================================
         * CAMPAIGN LEVEL
         * =========================================================
         */

        const campaignLevel = {
            ...(selectedTemplate?.camapaignlevel || {}),

            createdby:
                oldCampaign?.createdby ||
                username,

            EditedDate: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),

            Editedby:
                isExistingCampaign
                    ? userdetails?.username
                    : undefined,

            Name: values.Name,

            Objectives: values.Objectives,

            Special_categories:
                Array.isArray(values?.Special_categories) &&
                    values.Special_categories.includes("NONE")
                    ? "NONE"
                    : values.Special_categories,

            Bid_strategy: values.Bid_strategy,

            Budget_type: budgetType,

            Daily_amount:
                amountToCents(values.Daily_amount),

            Status:
                oldCampaign?.Status ||
                values.Status ||
                "PAUSED",

            access_token:
                oldCampaign?.access_token ||
                accountImageHash?.launchingToken,

            createdDate:
                oldCampaign?.createdDate ||
                moment()
                    .tz(
                        accountImageHash?.timeZone ||
                        "Asia/Kolkata"
                    )
                    .format("YYYY-MM-DD"),
        };

        /*
         * =========================================================
         * CAMPAIGN COMPARISONS
         *
         * Compare ONLY when campaignid exists.
         * =========================================================
         */

        if (isExistingCampaign) {

            // CAMPAIGN NAME
            if (
                !isSame(
                    oldCampaign.Name,
                    values.Name
                )
            ) {
                campaignLevel.re_lunch_campaign_name = true;
            } else {
                campaignLevel.Name = oldCampaign.Name;
            }

            // SPECIAL CATEGORIES
            if (
                !isSame(
                    oldCampaign.Special_categories,
                    campaignLevel.Special_categories
                )
            ) {
                campaignLevel.re_lunch_special_categories = true;
            } else {
                campaignLevel.Special_categories =
                    oldCampaign.Special_categories;
            }

            // BID STRATEGY
            if (
                !isSame(
                    oldCampaign.Bid_strategy,
                    values.Bid_strategy
                )
            ) {
                campaignLevel.re_lunch_bid_strategy = true;
            } else {
                campaignLevel.Bid_strategy =
                    oldCampaign.Bid_strategy;
            }

            // CAMPAIGN BUDGET
            const newCampaignAmount =
                amountToCents(values.Daily_amount);

            const oldCampaignAmount =
                Number(oldCampaign?.Daily_amount || 0);

            if (oldCampaignAmount === newCampaignAmount) {
                campaignLevel.Daily_amount =
                    oldCampaignAmount;
            } else {
                campaignLevel.Daily_amount =
                    newCampaignAmount;

                campaignLevel.re_lunch_daily_amount = true;

                // Old campaign budget -> Adset budget
                if (
                    oldCampaignAmount > 0 &&
                    newCampaignAmount === 0
                ) {
                    campaignLevel.re_lunch_daily_amount_in_adsets =
                        true;
                }

                // Old adset budget -> Campaign budget
                if (
                    oldCampaignAmount === 0 &&
                    newCampaignAmount > 0
                ) {
                    campaignLevel.re_lunch_daily_amount_in_campaign =
                        true;
                }
            }

        } else {
            /*
             * New campaign:
             * Do not compare with old DB values.
             * Remove any stale campaign relaunch flags.
             */

            removeRelaunchFlags(campaignLevel);
        }

        /*
         * =========================================================
         * CAMPAIGN COUNTRIES
         *
         * Countries exist at campaign level ONLY
         * when Special Category is selected.
         * =========================================================
         */

        const hasSpecialCategory =
            Array.isArray(values?.Special_categories) &&
            !values.Special_categories.includes("NONE");

        if (hasSpecialCategory) {
            campaignLevel.Special_categories_countries =
                values.countries || [];
        } else {
            delete campaignLevel.Special_categories_countries;
        }

        /*
         * =========================================================
         * CAMPAIGN SCHEDULING
         * =========================================================
         */

        if (
            budgetType === "lifetime" &&
            adSchedulingToShowCampaign
        ) {
            campaignLevel.is_day_parting_enabled_campign = true;

            campaignLevel.pacing_type = ["day_parting"];
        }

        /*
         * =========================================================
         * ACCOUNT / CAMPAIGN BASE DATA
         * =========================================================
         */

        const accountData = {
            ...(selectedTemplate || {}),

            campaign_name: values.Name,

            Account_Number: account,

            Approval:
                selectedTemplate?.Approval ||
                "PENDING_APPROVAL",

            fbstatus:
                selectedTemplate?.fbstatus ||
                "No-Live",

            Category: category?.name,

            ISTDate:
                selectedTemplate?.ISTDate ||
                moment()
                    .tz("Asia/Kolkata")
                    .format("DD-MM-YYYY"),

            camapaignlevel: {
                ...campaignLevel,
            },
        };

        /*
         * =========================================================
         * AD LEVEL HELPERS
         *
         * Rules:
         *  - Ad is "existing" only when the DB ad has an Addid.
         *  - ONLY the ad name changed      -> re_lunch_addname
         *  - ANY other value changed       -> re_lunch
         *  - Text arrays / media lists are SORTED before comparing,
         *    so a change of ORDER never triggers a relaunch.
         * =========================================================
         */

        let adLevelChanged = false;

        const stripQuery = (url) =>
            String(url || "").split("?")[0];

        const urlOf = (file) =>
            typeof file === "string"
                ? file
                : file?.url || "";

        // value -> trimmed, non-empty strings
        const toTextArray = (value) =>
            (
                Array.isArray(value)
                    ? value
                    : value === undefined ||
                        value === null ||
                        value === ""
                        ? []
                        : [value]
            )
                .map(item => String(item ?? "").trim())
                .filter(Boolean);

        // string for normal ads ("a, b"), array for dynamic ads
        const toText = (value) =>
            toTextArray(value).join(", ");

        // sorted + joined -> order independent comparison key
        const canon = (value) =>
            toTextArray(value).sort().join("\u0001");

        const sameCanon = (a, b) => canon(a) === canon(b);

        // "123 - 456789"  ->  "456789"   (page of THIS account)
        const pageIdForAccount = (value) => {
            const list = toTextArray(value);

            const match = list.find(
                item =>
                    item.startsWith(`${account} -`) ||
                    item.startsWith(`${account}-`)
            );

            const raw = String(match ?? list[0] ?? "");

            if (!raw) return undefined;

            return raw.includes("-")
                ? raw.split("-")[1].trim()
                : raw.trim();
        };

        const getFormFiles = (ad) =>
            Array.isArray(ad?.filename)
                ? ad.filename.filter(Boolean)
                : ad?.filename
                    ? [ad.filename]
                    : [];

        /*
         * Normalises the media stored in the DB ad into
         * [{ filename, imag_hash, videoid, thambnailurl }]
         *
         * Normal ad  : flat fields.
         * Dynamic ad : filename = [{ filename, imag_hash | video_id, thumbnailurl }]
         */
        const normalizeOldMedia = (oldAd) => {
            if (!oldAd) return [];

            if (Array.isArray(oldAd.filename)) {
                return oldAd.filename.map(media => ({
                    filename: media?.filename,
                    imag_hash: media?.imag_hash,
                    videoid: media?.video_id ?? media?.videoid,
                    thambnailurl:
                        media?.thumbnailurl ?? media?.thambnailurl,
                }));
            }

            return oldAd.filename
                ? [{
                    filename: oldAd.filename,
                    imag_hash: oldAd.imag_hash,
                    videoid: oldAd.videoid,
                    thambnailurl: oldAd.thambnailurl,
                }]
                : [];
        };

        /*
         * Reads the editable values of a form ad.
         */
        const readFormAd = (ad) => {
            const settings =
                ad?.accountSettings?.[account] || {};

            return {
                AddName: String(
                    ad?.AdName ?? ad?.AddName ?? ""
                ).trim(),

                page_id: pageIdForAccount(ad?.page_id),

                message:
                    ad?.primaryText ??
                    ad?.messages ??
                    ad?.message,

                headline:
                    ad?.headline ??
                    ad?.headlines,

                Description:
                    ad?.description ??
                    ad?.descriptions ??
                    ad?.Description,

                Caption:
                    settings.displayLink ??
                    settings.Caption ??
                    ad?.Caption ??
                    "",

                Website_URL:
                    settings.websiteUrl ??
                    settings.Website_URL ??
                    ad?.Website_URL ??
                    "",
            };
        };

        /*
         * Files already in the DB (same url) are reused.
         * New / replaced / newly added files go through customRequest,
         * which uploads to S3 and creates the image hash, or the
         * video id + thumbnail url (same as clone / create campaign).
         */
        const resolveAdMedia = async (files, oldMedia, adsetId) => {
            const plan = files.map(file => {
                const url = stripQuery(urlOf(file));

                const reused = url
                    ? oldMedia.find(
                        media => stripQuery(media.filename) === url
                    )
                    : null;

                return { file, reused };
            });

            const filesToUpload = plan
                .filter(item => !item.reused)
                .map(item => item.file);

            let uploaded = [];

            if (filesToUpload.length) {
                uploaded = await customRequest(
                    values.Name,
                    account,
                    {
                        AddName: "",
                        ads: [{ filename: filesToUpload }],
                    },
                    0,
                    undefined,
                    undefined,
                    adsetId
                );

                uploaded = Array.isArray(uploaded) ? uploaded : [];
            }

            let uploadIndex = 0;

            return plan.map(item => {
                if (item.reused) return item.reused;

                return (
                    uploaded[uploadIndex++] || {
                        filename: "",
                        facebookUploadFailed: true,
                        error: "Media upload returned no result",
                    }
                );
            });
        };

        /*
         * Applies the ad level flags.
         *
         * only name changed  -> re_lunch_addname
         * anything else      -> re_lunch
         */
        const applyAdFlags = (next, oldAd, newMediaUrls, oldMediaUrls) => {
            const nameChanged = !isSame(oldAd.AddName, next.AddName);

            const otherChanged =
                [
                    "message",
                    "headline",
                    "Description",
                    "Caption",
                    "Website_URL",
                    "page_id",
                ].some(field => !sameCanon(oldAd[field], next[field])) ||
                !sameCanon(oldMediaUrls, newMediaUrls);

            if (otherChanged) {
                next.re_lunch = true;
                adLevelChanged = true;
            } else if (nameChanged) {
                next.re_lunch_addname = true;
                adLevelChanged = true;
            }
        };

        const carryOldIdentity = (next, oldAd) => {
            if (oldAd.Addid) next.Addid = oldAd.Addid;
            if (oldAd.Ad_Status) next.Ad_Status = oldAd.Ad_Status;

            if (
                oldAd.status &&
                selectedTemplate?.Approval !== "Rejected"
            ) {
                next.status = oldAd.status;
            }
        };

        /*
         * NORMAL ADS  (one ad per file)
         */
        const buildNormalAds = async (formAdset, oldAdset, isExistingAdset) => {
            const oldAds = Array.isArray(oldAdset?.addlevel)
                ? oldAdset.addlevel
                : [];

            const result = [];

            for (const formAd of formAdset?.ads || []) {
                const oldAd = oldAds.find(
                    item => String(item?.id) === String(formAd?.id)
                );

                const isExistingAd = Boolean(
                    oldAd && hasId(oldAd.Addid)
                );

                const fields = readFormAd(formAd);
                const oldMedia = normalizeOldMedia(oldAd);

                const files = getFormFiles(formAd).slice(0, 1);

                const mediaList = files.length
                    ? await resolveAdMedia(
                        files,
                        oldMedia,
                        formAdset?.id
                    )
                    : oldMedia.slice(0, 1);

                const media = mediaList[0] || {};

                // keep every unknown DB key of existing ads
                const next = isExistingAd
                    ? removeRelaunchFlags({ ...oldAd })
                    : {};

                delete next.imag_hash;
                delete next.videoid;
                delete next.thambnailurl;
                delete next.facebookUploadFailed;

                Object.assign(next, {
                    id: oldAd?.id ?? formAd?.id,
                    AddName: fields.AddName,
                    page_id: fields.page_id,
                    message: toText(fields.message),
                    headline: toText(fields.headline),
                    Description: toText(fields.Description),
                    Caption: fields.Caption,
                    Website_URL: fields.Website_URL,
                    filename: media.filename,
                });

                if (media.imag_hash) {
                    next.imag_hash = media.imag_hash;
                } else if (media.videoid) {
                    next.videoid = media.videoid;
                    next.thambnailurl = media.thambnailurl || "";
                } else {
                    next.facebookUploadFailed = true;
                }

                if (media.facebookUploadFailed) {
                    next.facebookUploadFailed = true;
                }

                if (isExistingAd) {
                    carryOldIdentity(next, oldAd);

                    applyAdFlags(
                        next,
                        oldAd,
                        [stripQuery(media.filename)],
                        oldMedia.map(item => stripQuery(item.filename))
                    );
                } else if (isExistingAdset) {
                    // brand new ad inside an already launched adset
                    adLevelChanged = true;
                }

                result.push(next);
            }

            return result;
        };

        /*
         * DYNAMIC CREATIVE  (one ad, many files, text arrays)
         */
        const buildDynamicAd = async (formAdset, oldAdset, isExistingAdset) => {
            const oldAd = (
                Array.isArray(oldAdset?.addlevel)
                    ? oldAdset.addlevel
                    : []
            )[0];

            const isExistingAd = Boolean(
                oldAd && hasId(oldAd.Addid)
            );

            const formAd = formAdset?.ads?.[0] || {};
            const fields = readFormAd(formAd);
            const oldMedia = normalizeOldMedia(oldAd);

            const mediaList = await resolveAdMedia(
                getFormFiles(formAd),
                oldMedia,
                formAdset?.id
            );

            const images = mediaList.filter(item => item.imag_hash);
            const videos = mediaList.filter(item => item.videoid);

            const next = isExistingAd
                ? removeRelaunchFlags({ ...oldAd })
                : {};

            Object.assign(next, {
                id: oldAd?.id ?? formAd?.id ?? uuidv4(),
                AddName: fields.AddName,

                filename: mediaList.map(media =>
                    media.imag_hash
                        ? {
                            filename: media.filename || "",
                            imag_hash: media.imag_hash,
                        }
                        : {
                            filename: media.filename || "",
                            video_id: media.videoid,
                            thumbnailurl: media.thambnailurl || "",
                            ...(media.facebookUploadFailed
                                ? { facebookUploadFailed: true }
                                : {}),
                        }
                ),

                imag_hash: images.map(item => item.imag_hash),

                images: images.map(item => item.imag_hash),

                videos: videos.map(item => ({
                    video_id: item.videoid,
                    thumbnail_url: item.thambnailurl || "",
                })),

                page_id: fields.page_id,

                message: toTextArray(fields.message),
                headline: toTextArray(fields.headline),
                Description: toTextArray(fields.Description),
                Caption: fields.Caption,
                Website_URL: fields.Website_URL,

                call_to_action_types: ["LEARN_MORE"],

                ad_formats: [
                    ...(images.length ? ["SINGLE_IMAGE"] : []),
                    ...(videos.length ? ["SINGLE_VIDEO"] : []),
                ],
            });

            delete next.facebookUploadFailed;

            if (
                mediaList.some(
                    item =>
                        item.facebookUploadFailed ||
                        (!item.imag_hash && !item.videoid)
                )
            ) {
                next.facebookUploadFailed = true;
            }

            if (isExistingAd) {
                carryOldIdentity(next, oldAd);

                applyAdFlags(
                    next,
                    oldAd,
                    mediaList.map(item => stripQuery(item.filename)),
                    oldMedia.map(item => stripQuery(item.filename))
                );
            } else if (isExistingAdset) {
                adLevelChanged = true;
            }

            return [next];
        };

        /*
         * =========================================================
         * EXISTING ADSETS MAP
         *
         * Find old adsets using id ONLY.
         * =========================================================
         */

        const oldAdsetMap = new Map(
            Object.keys(selectedTemplate || {})
                .filter(key => key.startsWith("adsetlevel_"))
                .map(key => {
                    const adset = selectedTemplate[key];

                    return [
                        String(adset?.id ?? ""),
                        adset,
                    ];
                })
                .filter(([id]) => hasId(id))
        );

        /*
         * =========================================================
         * ADSETS
         * =========================================================
         */

        if (!Array.isArray(values?.adsets)) {
            console.log("FINAL CAMPAIGN DATA:", accountData);

            return accountData;
        }

        const adsetDebugData = [];

        for (const [index, formAdset] of values.adsets.entries()) {

            /*
             * FIND OLD ADSET BY ID, then check Adsetid.
             *
             * Existing adset : oldAdset exists AND oldAdset.Adsetid exists.
             * New adset      : no old adset OR Adsetid missing.
             */

            const oldAdset = oldAdsetMap.get(
                String(formAdset?.id ?? "")
            );

            const isExistingAdset = Boolean(
                oldAdset &&
                hasId(oldAdset?.Adsetid)
            );

            /*
             * =================================================
             * ADSET BASE
             * =================================================
             */

            const adsetData = {
                ...(oldAdset || {}),

                id:
                    oldAdset?.id ??
                    formAdset?.id,

                Adsetid:
                    oldAdset?.Adsetid ??
                    formAdset?.Adsetid,

                AdsetName:
                    formAdset?.AdsetName,

                Budget_type: budgetType,

                buying_type:
                    oldAdset?.buying_type ||
                    formAdset?.buying_type ||
                    "AUCTION",

                minAgeToggle:
                    formAdset?.minAgeToggle ?? true,

                countries:
                    formAdset?.countries || [],

                Min_Age:
                    formAdset?.Min_Age,

                Max_Age:
                    formAdset?.Max_Age,

                Gender:
                    formAdset?.Gender,

                // Language:
                //     formAdset?.Language ??
                //     formAdset?.locales ??
                //     [],

                optimization_goal:
                    formAdset?.optimization_goal,

                billing_event:
                    formAdset?.billing_event,

                pixel_id:
                    formAdset?.pixel_id[0].split("-")[1].trim(),

                placements:
                    formAdset?.placements,

                is_dynamic_creative:
                    Boolean(formAdset?.isDynamicCreative),
            };

            /*
             * ADSET DAILY AMOUNT
             */

            const newAdsetAmount =
                amountToCents(formAdset?.DailyAdd_amount);

            const oldAdsetAmount =
                Number(oldAdset?.Daily_amount || 0);

            adsetData.Daily_amount = newAdsetAmount;

            /*
             * BID AMOUNT
             */

            const newBidAmount =
                amountToCents(formAdset?.bid_amount);

            const oldBidAmount =
                Number(oldAdset?.bid_amount || 0);

            adsetData.bid_amount = newBidAmount;

            /*
             * BENEFICIARY / PAYER  (single account)
             */

            const beneficiary = String(
                formAdset?.Beneficiary?.[account] || ""
            ).trim();

            const payer = String(
                formAdset?.Payer?.[account] || beneficiary
            ).trim();

            if (beneficiary) {
                adsetData.beneficiary = beneficiary;
                adsetData.payer = payer;
            }

            /*
             * END TIME
             */

            let newEndTime;

            if (
                budgetType === "lifetime" &&
                formAdset?.DatePickerEnd
            ) {
                newEndTime = moment(
                    formAdset.DatePickerEnd?.$d ||
                    formAdset.DatePickerEnd
                )
                    .tz(
                        accountImageHash?.timeZone ||
                        "Asia/Kolkata"
                    )
                    .format("YYYY-MM-DDTHH:mm:ssZ");

                adsetData.end_time = newEndTime;
            }

            /*
             * =================================================
             * ADSET COMPARISONS
             * =================================================
             */

            if (isExistingAdset) {

                if (!isSame(oldAdset?.AdsetName, formAdset?.AdsetName)) {
                    adsetData.re_lunch_adset_name = true;
                }

                if (oldAdsetAmount !== newAdsetAmount) {
                    adsetData.re_lunch_daily_amount = true;
                }

                if (oldBidAmount !== newBidAmount) {
                    adsetData.re_lunch_bid_amount = true;
                }

                // const oldLanguage =
                //     oldAdset?.locales ??
                //     [];

                // const newLanguage =
                //     formAdset?.Language ??
                //     formAdset?.locales ??
                //     [];

                // if (
                //     !isSame(oldAdset?.countries, formAdset?.countries) ||
                //     !isSame(oldAdset?.Min_Age, formAdset?.Min_Age) ||
                //     !isSame(oldAdset?.Max_Age, formAdset?.Max_Age) ||
                //     !isSame(oldAdset?.Gender, formAdset?.Gender) ||
                //     !isSame(oldLanguage, newLanguage) ||
                //     !isSame(oldAdset?.placements, formAdset?.placements)
                // ) {
                //     adsetData.re_lunch_targeting = true;
                // }

                const oldLanguage = oldAdset?.locales ?? [];
                const newLanguage = formAdset?.Language ?? formAdset?.locales ?? [];

                const targetingChecks = {
                    countries: [oldAdset?.countries, formAdset?.countries],
                    Min_Age: [oldAdset?.Min_Age, formAdset?.Min_Age],
                    Max_Age: [oldAdset?.Max_Age, formAdset?.Max_Age],
                    Gender: [oldAdset?.Gender, formAdset?.Gender],
                    Language: [oldLanguage, newLanguage],
                    placements: [oldAdset?.placements, formAdset?.placements],
                };

                const targetingDebug = Object.entries(targetingChecks).map(
                    ([field, [oldValue, newValue]]) => ({
                        field,
                        changed: !isSame(oldValue, newValue),
                        old: JSON.stringify(oldValue),
                        oldType: Array.isArray(oldValue) ? "array" : typeof oldValue,
                        new: JSON.stringify(newValue),
                        newType: Array.isArray(newValue) ? "array" : typeof newValue,
                        // what isSame() actually compared
                        oldNormalized: JSON.stringify(normalizeArray(oldValue)),
                        newNormalized: JSON.stringify(normalizeArray(newValue)),
                    })
                );

                const changedTargeting = targetingDebug.filter(item => item.changed);

                // console.groupCollapsed(
                //     `[re_lunch_targeting] adset "${formAdset?.AdsetName}" (${formAdset?.id})`
                // );
                // console.log(
                //     "Flag already in DB object (carried over by ...oldAdset):",
                //     oldAdset?.re_lunch_targeting
                // );
                // console.log(
                //     "Fields that changed in this edit:",
                //     changedTargeting.map(item => item.field)
                // );
                // console.table(targetingDebug);
                // console.groupEnd();

                if (changedTargeting.length) {
                    adsetData.re_lunch_targeting = true;
                }

                const oldBeneficiary =
                    String(oldAdset?.beneficiary || "").trim();

                const oldPayer = String(
                    oldAdset?.payer ||
                    oldAdset?.beneficiary ||
                    ""
                ).trim();

                if (
                    oldBeneficiary !== beneficiary ||
                    oldPayer !== payer
                ) {
                    adsetData.re_lunch_beneficiary_payer = true;
                }

                if (
                    newEndTime &&
                    oldAdset?.end_time !== newEndTime
                ) {
                    adsetData.re_lunch_endtime = true;
                }

                /*
                 * PRESERVE EXISTING RELAUNCH FLAGS
                 */

                [
                    "re_lunch",
                    "re_lunch_addname",
                    "re_lunch_adset_name",
                    "re_lunch_beneficiary_payer",
                    "re_lunch_bid_amount",
                    "re_lunch_targeting",
                    "re_lunch_endtime",
                    "re_lunch_daily_amount",
                ].forEach(flag => {
                    if (
                        oldAdset?.[flag] !== undefined &&
                        adsetData?.[flag] === undefined
                    ) {
                        adsetData[flag] = oldAdset[flag];
                    }
                });

            } else {
                /*
                 * NEW ADSET: no old values to compare,
                 * no stale relaunch flags.
                 */

                removeRelaunchFlags(adsetData);
            }

            /*
             * =================================================
             * AD LEVEL
             * =================================================
             */

            adsetData.addlevel = formAdset?.isDynamicCreative
                ? await buildDynamicAd(
                    formAdset,
                    oldAdset,
                    isExistingAdset
                )
                : await buildNormalAds(
                    formAdset,
                    oldAdset,
                    isExistingAdset
                );

            /*
             * SAVE ADSET
             */

            accountData[`adsetlevel_${index + 1}`] = adsetData;

            /*
             * DEBUG INFORMATION
             */

            adsetDebugData.push({
                formId: formAdset?.id,
                matchedOldAdsetId: oldAdset?.id,
                Adsetid: oldAdset?.Adsetid,
                isExistingAdset,
                relaunchFlags: Object.keys(adsetData)
                    .filter(key => key.startsWith("re_lunch"))
                    .reduce((obj, key) => {
                        obj[key] = adsetData[key];
                        return obj;
                    }, {}),
                ads: (adsetData.addlevel || []).map(ad => ({
                    id: ad.id,
                    Addid: ad.Addid,
                    re_lunch: ad.re_lunch,
                    re_lunch_addname: ad.re_lunch_addname,
                })),
            });
        }

        /*
         * =========================================================
         * TOP LEVEL re_launch  (only for Live campaigns)
         * =========================================================
         */

        const anyRelaunch =
            adLevelChanged ||
            hasRelaunchFlag(accountData.camapaignlevel) ||
            Object.keys(accountData)
                .filter(key => key.startsWith("adsetlevel_"))
                .some(key => hasRelaunchFlag(accountData[key]));

        if (accountData.fbstatus === "Live") {
            accountData.re_launch = selectedTemplate?.re_launch
                ? selectedTemplate.re_launch
                : anyRelaunch;
        }

        /*
         * =========================================================
         * FINAL DEBUG CONSOLE
         * =========================================================
         */

        console.log("========== MULTIPLE ADSETS FETCHING RESULT ==========", {
            campaign: {
                campaignId,
                isExistingCampaign,
                relaunchFlags: Object.keys(campaignLevel)
                    .filter(key => key.startsWith("re_lunch"))
                    .reduce((obj, key) => {
                        obj[key] = campaignLevel[key];
                        return obj;
                    }, {}),
            },

            adsets: adsetDebugData,

            re_launch: accountData.re_launch,

            finalData: accountData,
        });

        return accountData;
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
        console.log(formValues, "Form Values");
        console.log(selectedTemplate, "Template");
        console.log(campaignData);
        try {
            // console.log(campaignData);
            if (campaignData) {
                // console.log("hi");
                // for (const campaign of campaignData) {
                //     await axios.post("/api/campaigns/create/createcampaign", { ...campaign })
                // }
                const { _id, ...camData } = campaignData;
                await axios.put("/api/campaigns/edit/editcampaign", camData);
                setCampaignSchedulingEnabled(false);
                form.resetFields();
                setBudgetType("daily");
                setPages("Page");
                setPixels("Pixel");
                setGeos("Geo")
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
                    mode="edit"
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
                                disabled={selectedTemplate?.camapaignlevel?.campaignid}
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
                                                                        disabled={!!existingAdsetId}
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
                                                                        disabled={fields.length <= 1 || !!existingAdsetId}
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
                                                                        mode="edit"
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
                            Edit Campaign
                        </Button>
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
        </Modal>
    );
};

export default EditCampaignDrawer;