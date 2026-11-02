"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Card, Checkbox, Col, Divider, Empty, Form, Input, message, Row, Select, Space, Switch, Tag, Tooltip, Typography, Upload, Drawer, Modal } from "antd";
import { CheckCircleOutlined, CopyOutlined, DeleteOutlined, LikeOutlined, MessageOutlined, PictureOutlined, ShareAltOutlined, UploadOutlined, UserOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import CreativesPage from "@/modules/creatives/page";
import AffinityUrlBuilder from "./urlbuilder/affinity";
import MediaUrlBuilder from "./urlbuilder/media";
import MnetUrlBuilder from "./urlbuilder/mnet";

const { Text, Title } = Typography;
const { TextArea } = Input;

const createId = () => globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyMedia = () => ({ images: [], videos: [], thumbnail: null });

const getMediaItems = (media) => [
    ...(Array.isArray(media?.images) ? media.images : []),
    ...(Array.isArray(media?.videos) ? media.videos : []),
];

const getFileName = (file) => {
    if (!file) return "";
    if (typeof file === "string") return file.split("/").pop()?.split("?")[0] || "";
    return file.name || file.originFileObj?.name || file.filename ||
        file.url?.split("/").pop()?.split("?")[0] || "";
};

const getRemoteUrl = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;

    const direct = item.url || item.src || item.uri || item.imageUrl ||
        item.image_url || item.videoUrl || item.video_url || item.assetUrl ||
        item.asset_url || item.secure_url || item.source_url || item.fileUrl ||
        item.file_url || item.downloadUrl || item.download_url || item.permalink_url;

    if (direct) return direct;

    return getRemoteUrl(item.response) || getRemoteUrl(item.data) ||
        getRemoteUrl(item.result) || getRemoteUrl(item.asset) ||
        getRemoteUrl(item.media) || "";
};

const getMediaUrl = (file) => {
    if (!file) return "";
    if (typeof file === "string") return file;
    return getRemoteUrl(file) || file.thumbUrl || file.preview ||
        file.originFileObj?.url || "";
};

const normalizeRemoteCreative = (creative) => {
    if (!creative) return null;

    const nested = creative.media || creative.asset || creative.creative || creative;
    const url = getRemoteUrl(nested) || getRemoteUrl(creative);
    if (!url) return null;

    const name = creative.name || creative.filename || creative.fileName ||
        creative.title || nested?.name || url.split("/").pop()?.split("?")[0] ||
        "Creative";

    const declaredType = String(creative.type || creative.mediaType ||
        creative.media_type || creative.mimeType || creative.mime_type ||
        nested?.type || nested?.mimeType || nested?.mime_type || "").toLowerCase();

    const video = declaredType.includes("video") ||
        /\.(mp4|mov|m4v|webm|avi|mpeg|mpg)(?:$|\?)/i.test(url);

    return {
        ...nested,
        ...creative,
        uid: String(creative.uid || creative.id || creative.creativeId || url),
        name,
        filename: name,
        url,
        thumbUrl: creative.thumbnailUrl || creative.thumbnail_url ||
            nested?.thumbnail_url || (!video ? url : ""),
        type: video
            ? declaredType.startsWith("video/") ? declaredType : "video/mp4"
            : declaredType.startsWith("image/") ? declaredType : "image/*",
        mediaType: video ? "video" : "image",
        isRemote: true,
        creativeId: creative.creativeId || creative.creative_id ||
            creative.id || creative.assetId || creative.asset_id,
        sourceCreative: creative,
    };
};

const mediaPreviewUrls = new Map();

const getMediaPreviewUrl = (file) => {
    if (!file) return "";
    const existingUrl = getMediaUrl(file);
    if (existingUrl) return existingUrl;

    const source = file.originFileObj || file;
    if (typeof File === "undefined" || !(source instanceof File)) return "";

    const key = file.uid || source.name + source.size;
    if (!mediaPreviewUrls.has(key)) {
        mediaPreviewUrls.set(key, URL.createObjectURL(source));
    }
    return mediaPreviewUrls.get(key);
};

const getFirstMedia = (ad) => {
    const media = getMediaItems(ad?.media);
    if (media.length) return media[0];

    const legacy = Array.isArray(ad?.filename) ? ad.filename[0] : ad?.filename;
    if (legacy) {
        return typeof legacy === "string"
            ? normalizeRemoteCreative({
                url: legacy,
                name: legacy.split("/").pop()?.split("?")[0],
            })
            : legacy;
    }

    if (ad?.mediaUrl) {
        return normalizeRemoteCreative({
            url: ad.mediaUrl,
            name: ad.mediaName || ad.mediaUrl.split("/").pop()?.split("?")[0],
            type: ad.mediaType,
            creativeId: ad.creativeId,
        });
    }

    return null;
};

const isVideo = (file) => {
    const source = file?.originFileObj || file;
    return source?.type?.startsWith("video/") ||
        String(file?.mediaType || "").toLowerCase() === "video" ||
        /\.(mp4|mov|m4v|webm|avi|mpeg|mpg)(?:$|\?)/i.test(
            getFileName(file) || getMediaUrl(file)
        );
};

const isSupportedMedia = (file) => {
    const source = file?.originFileObj || file;
    return source?.type?.startsWith("image/") ||
        source?.type?.startsWith("video/") ||
        /\.(mp4|mov|m4v|webm|avi|mpeg|mpg|png|jpe?g|gif|webp|bmp|svg)$/i.test(
            getFileName(file)
        );
};

const mediaForFile = (file) => ({
    images: isVideo(file) ? [] : [file],
    videos: isVideo(file) ? [file] : [],
    thumbnail: null,
});

const getAdName = (ad) => ad?.AdName || ad?.AddName || "";
const getPrimaryText = (ad) => ad?.primaryText ?? ad?.message ?? "";
const getDescription = (ad) => ad?.description ?? ad?.Description ?? "";
const getWebsiteUrl = (ad) => ad?.websiteUrl ?? ad?.Website_URL ?? "";
const getDisplayLink = (ad) => ad?.displayLink ?? ad?.Caption ?? "";

const createAccountSettings = () => ({
    websiteUrl: "",
    displayLink: ""
});

const cloneSettings = (settings = {}) =>
    Object.fromEntries(
        Object.entries(settings).map(([key, value]) => [
            key,
            {
                ...value,
                creativeOverrides: { ...(value?.creativeOverrides || {}) },
            },
        ])
    );

const getAccountKey = (account) =>
    account?.Account_Number ??
    account?.accountNumber ??
    account?.account_number ??
    account?.id ??
    null;

export const createInitialAd = (selectedAccounts = []) => ({
    id: createId(),
    AdName: "",
    adSetup: "CREATE_AD",
    format: "SINGLE_IMAGE_VIDEO",
    primaryText: "",
    headline: "",
    description: "Find More",
    message: "",
    textOverridesEnabled: false,
    page_id: undefined,
    media: emptyMedia(),
    filename: null,
    mediaSource: "",
    accountSettings: Object.fromEntries(
        selectedAccounts.map((account) => [
            String(account),
            createAccountSettings(),
        ])
    ),
});

const getPageOptions = (pages) =>
    (Array.isArray(pages) ? pages : [])
        .map((page) => {
            if (typeof page === "string" || typeof page === "number") {
                return { value: String(page), label: String(page) };
            }

            const id = page?.id ?? page?.pageId ?? page?.page_id ?? page?.value;
            const label = page?.name ?? page?.pageName ?? page?.page_name ??
                page?.label ?? id;

            return id == null ? null : { value: String(id), label: String(label) };
        })
        .filter(Boolean);

const getAccountName = (account, key) =>
    account?.name || account?.accountName || account?.account_name ||
    account?.accountNumber || account?.account_number || key;

const getPageName = (pageId, pagesByAccount) => {
    if (pageId == null) return "";

    for (const pages of Object.values(pagesByAccount || {})) {
        const found = (Array.isArray(pages) ? pages : []).find((page) => {
            const id = typeof page === "object"
                ? page.id ?? page.pageId ?? page.page_id ?? page.value
                : page;
            return String(id) === String(pageId);
        });

        if (found) {
            return typeof found === "object"
                ? found.name ?? found.pageName ?? found.page_name ??
                found.label ?? String(pageId)
                : String(found);
        }
    }

    return "";
};

const CTA_OPTIONS = [
    { value: "LEARN_MORE", label: "Learn More" },
    { value: "SHOP_NOW", label: "Shop Now" },
    { value: "SIGN_UP", label: "Sign Up" },
    { value: "CONTACT_US", label: "Contact Us" },
    { value: "DOWNLOAD", label: "Download" },
    { value: "APPLY_NOW", label: "Apply Now" },
    { value: "GET_QUOTE", label: "Get Quote" },
    { value: "SUBSCRIBE", label: "Subscribe" },
    { value: "BOOK_NOW", label: "Book Now" },
    { value: "WATCH_MORE", label: "Watch More" },
];

const CTA_LABELS = Object.fromEntries(
    CTA_OPTIONS.map(({ value, label }) => [value, label])
);

const DESTINATION_OPTIONS = [
    { value: "WEBSITE", label: "Website" },
    { value: "EXISTING_POST", label: "Existing post" },
];

const AdLevel = ({
    form,
    adsetId,
    adsetIndex,
    adIndex,
    field,
    adPath,
    selectedAccounts = [],
    pagesByAccount = {},
    instagramAccountsByAccount = {},
    mode = "create",
    disabled = false,
    removeAd,
    onRemove,
    onClone,
    onBatchCreate,
    creatives = [],
    availableCreatives = [],
    network = "",
    Account_Number,
    userData,
    auth,
    theme,
    username,
    showCreativeStrip = false,
    page_id_list,
    pageidList,
    multiplePage = "Page"
}) => {
    const processedUids = useRef(new Set());
    const replacementUids = useRef(new Set());

    const [localPreview, setLocalPreview] = useState("");
    const [previewVisible, setPreviewVisible] = useState(true);
    const [creativesDrawerOpen, setCreativesDrawerOpen] = useState(false);
    const [selectedCreatives, setSelectedCreatives] = useState([]);
    const [replaceCreativeTargetId, setReplaceCreativeTargetId] = useState(null);
    const [mediaError, setMediaError] = useState(false);
    const [indexValueForAccount, setIndexValueForAccount] = useState("");
    const [defaultURLBuilder, setDefaultURLBuilder] = useState("");
    const [isModalVisibleForURLBuilder, setIsModalVisibleForURLBuilder] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const path = useMemo(
        () => adPath || ["adsets", adsetIndex, "ads", adIndex],
        [adPath, adsetIndex, adIndex]
    );
    const adsetPath = useMemo(() => ["adsets", adsetIndex], [adsetIndex]);
    const adsPath = useMemo(() => [...adsetPath, "ads"], [adsetPath]);
    const activeIdPath = useMemo(() => [...adsetPath, "activeAdId"], [adsetPath]);

    const watchedAd = Form.useWatch(path, form, { preserve: true });
    const watchedAds = Form.useWatch(adsPath, form, { preserve: true });
    const watchedSharedText = Form.useWatch(
        [...adsetPath, "sharedAdText"],
        form,
        { preserve: true }
    );
    const watchedActiveAdId = Form.useWatch(activeIdPath, form, { preserve: true });

    const watchedIsDynamicCreative = Form.useWatch(
        [...adsetPath, "isDynamicCreative"],
        form,
        { preserve: true }
    );

    const dynamicCreativeValue = watchedIsDynamicCreative ??
        form.getFieldValue([...adsetPath, "isDynamicCreative"]);

    const isDynamicCreative = dynamicCreativeValue === true ||
        dynamicCreativeValue === 1 ||
        String(dynamicCreativeValue).toLowerCase() === "true";

    const getCurrentAdsetName = () =>
        form.getFieldValue(["adsets", adsetIndex, "AdsetName"]) || "";

    const currentAd = form.getFieldValue(path);
    const currentAds = form.getFieldValue(adsPath);
    const ad = currentAd ?? watchedAd ?? {};
    const watchedPageValue = Form.useWatch(
        [...path, "page_id"],
        form,
        { preserve: true }
    );

    const watchedAdsets = Form.useWatch("adsets", form, {
        preserve: true,
    });

    useEffect(() => {
        ["primaryText", "headline", "description"].forEach((name) => {
            const value = form.getFieldValue([...path, name]);

            if (isDynamicCreative) {
                if (!Array.isArray(value)) {
                    const fallback = value == null ? "" : String(value);
                    form.setFieldValue([...path, name], fallback ? [fallback] : [""]);
                } else if (value.length > 5) {
                    form.setFieldValue([...path, name], value.slice(0, 5));
                } else if (!value.length) {
                    form.setFieldValue([...path, name], [""]);
                }
            } else if (Array.isArray(value)) {
                const fallback = String(
                    value.find((item) => String(item ?? "").trim()) ?? ""
                );
                form.setFieldValue([...path, name], fallback);

                if (name === "primaryText") {
                    form.setFieldValue([...path, "message"], fallback);
                }
                if (name === "description") {
                    form.setFieldValue([...path, "Description"], fallback);
                }
            }
        });
    }, [isDynamicCreative, path, form, currentAd?.id]);

    const ads = Array.isArray(currentAds)
        ? currentAds
        : Array.isArray(watchedAds)
            ? watchedAds
            : ad?.id
                ? [ad]
                : [];

    const creativeLibrary = useMemo(() => {
        const source = [
            ...(Array.isArray(creatives) ? creatives : []),
            ...(Array.isArray(availableCreatives) ? availableCreatives : []),
            ...selectedCreatives,
        ];

        const seen = new Set();

        return source
            .map(normalizeRemoteCreative)
            .filter((item) => {
                if (!item?.url) return false;
                const key = String(item.creativeId || item.url);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }, [availableCreatives, creatives, selectedCreatives]);

    const sharedText = watchedSharedText || {};
    const adId = ad.id;
    const isFirstAd = Number(adIndex ?? field?.name ?? 0) === 0;
    const firstExistingAdId = ads.find((item) => item?.id)?.id;
    const activeAdId = watchedActiveAdId || firstExistingAdId || adId;
    const isActive = String(activeAdId || "") === String(adId || "");

    const firstMedia = getFirstMedia(ad);
    const mediaName = getFileName(firstMedia);
    const hasMedia = Boolean(firstMedia);
    const adName = getAdName(ad);
    const overridesEnabled = ad.textOverridesEnabled === true;
    const campaign_name = Form.useWatch("Name", form) || "";

    const primaryText = overridesEnabled
        ? getPrimaryText(ad)
        : sharedText.primaryText ?? getPrimaryText(ad);

    const headline = overridesEnabled
        ? ad.headline || ""
        : sharedText.headline ?? ad.headline ?? "";

    const description = overridesEnabled
        ? getDescription(ad)
        : sharedText.description ?? getDescription(ad);

    const asTextOptions = (value) => {
        if (Array.isArray(value)) {
            return value.map((item) => String(item ?? "")).slice(0, 5);
        }
        return value == null || value === "" ? [""] : [String(value)];
    };

    const dynamicPrimaryTexts = asTextOptions(
        ad.primaryText ?? ad.message ?? sharedText.primaryText
    );
    const dynamicHeadlines = asTextOptions(ad.headline ?? sharedText.headline);
    const dynamicDescriptions = asTextOptions(
        ad.description ?? ad.Description ?? sharedText.description
    );

    const accountOptions = selectedAccounts.map((account) => ({
        value: String(account),
        label: account,
    }));

    const accountSettings = { ...(ad.accountSettings || {}) };
    const isSingleAccount = accountOptions.length === 1;

    accountOptions.forEach(({ value }) => {
        const existing = accountSettings[value] || {};
        const defaults = createAccountSettings();

        const websiteUrl = existing.websiteUrl ??
            existing.Website_URL ??
            (isSingleAccount ? getWebsiteUrl(ad) : "");

        const displayLink = existing.displayLink ??
            existing.Caption ??
            (isSingleAccount ? getDisplayLink(ad) : "");

        accountSettings[value] = {
            ...defaults,
            ...existing,
            websiteUrl,
            Website_URL: websiteUrl,
            displayLink,
            creativeOverrides: {
                ...defaults.creativeOverrides,
                ...(existing.creativeOverrides || {}),
            },
        };
    });

    const firstAccountKey = accountOptions[0]?.value || "";
    const [previewAccountKey, setPreviewAccountKey] = useState(firstAccountKey);

    useEffect(() => {
        if (!accountOptions.some(
            (option) => option.value === String(previewAccountKey)
        )) {
            setPreviewAccountKey(firstAccountKey);
        }
    }, [firstAccountKey, previewAccountKey]);

    const accountKey = accountOptions.some(
        (option) => option.value === String(previewAccountKey)
    )
        ? String(previewAccountKey)
        : firstAccountKey;

    const accountSetting = accountSettings[accountKey] || createAccountSettings();

    const pageId = accountSetting.pageId ?? accountSetting.page_id ?? ad.page_id;
    const pageName = getPageName(pageId, pagesByAccount) ||
        accountOptions.find((option) => option.value === accountKey)?.label ||
        "Your Page";

    const previewLink = accountSetting.displayLink ||
        accountSetting.caption ||
        accountSetting.websiteUrl ||
        getDisplayLink(ad) ||
        getWebsiteUrl(ad);

    useEffect(() => {
        if (isFirstAd && !watchedActiveAdId && firstExistingAdId) {
            form.setFieldValue(activeIdPath, firstExistingAdId);
        }
    }, [isFirstAd, watchedActiveAdId, firstExistingAdId, activeIdPath, form]);

    useEffect(() => {
        const source = firstMedia?.originFileObj || firstMedia;

        if (!source || getMediaUrl(firstMedia) ||
            typeof File === "undefined" || !(source instanceof File)) {
            setLocalPreview("");
            return;
        }

        const url = URL.createObjectURL(source);
        setLocalPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [
        firstMedia?.uid,
        firstMedia?.name,
        firstMedia?.size,
        firstMedia?.lastModified,
        firstMedia?.originFileObj,
    ]);

    useEffect(() => {
        if (!form || multiplePage === "Page" ||
            !Array.isArray(pageidList) || !pageidList.length) return;

        const availableValues = new Set(
            (page_id_list || []).map(({ value }) => String(value))
        );

        const defaults = selectedAccounts
            .map((account) => {
                const accountKey = String(getAccountKey(account) ?? account);
                return pageidList.find((value) =>
                    String(value).startsWith(`${accountKey} - `)
                );
            })
            .filter((value) => value != null && availableValues.has(String(value)))
            .map(String);

        const current = form.getFieldValue([...path, "page_id"]);
        const currentValues = Array.isArray(current)
            ? current.map(String)
            : current == null || current === ""
                ? []
                : [String(current)];

        if (!currentValues.length && defaults.length) {
            form.setFieldValue([...path, "page_id"], defaults);
        }
    }, [form, path, selectedAccounts, pageidList, page_id_list]);

    const previewUrl = getMediaPreviewUrl(firstMedia) || localPreview;

    const setAdField = (name, value) => {
        form.setFieldValue([...path, name], value);
    };

    const updateName = (value) => {
        setAdField("AdName", value);
        setAdField("AddName", value);
    };

    const updateSharedText = (name, value) => {
        const currentShared = form.getFieldValue([...adsetPath, "sharedAdText"]) || {};

        form.setFieldValue([...adsetPath, "sharedAdText"], {
            primaryText: "",
            headline: "",
            description: "",
            ...currentShared,
            [name]: value,
        });

        const currentAds = form.getFieldValue(adsPath) || [];

        form.setFieldValue(
            adsPath,
            currentAds.map((item) => {
                if (item?.textOverridesEnabled) return item;

                const updated = { ...item };

                if (name === "primaryText") {
                    updated.primaryText = value;
                    updated.message = value;
                }
                if (name === "headline") updated.headline = value;
                if (name === "description") {
                    updated.description = value;
                    updated.Description = value;
                }

                return updated;
            })
        );
    };

    const updateText = (name, value) => {
        if (overridesEnabled) {
            setAdField(name, value);
            if (name === "primaryText") setAdField("message", value);
            if (name === "description") setAdField("Description", value);
            return;
        }

        updateSharedText(name, value);
    };
    const toggleOverrides = (enabled) => {
        const currentAds = form.getFieldValue(adsPath) || [];
        const current = currentAds.find(
            (item) => String(item?.id) === String(adId)
        ) || form.getFieldValue(path) || ad;

        const shared = form.getFieldValue([...adsetPath, "sharedAdText"]) || {};
        const next = { ...current, textOverridesEnabled: enabled };

        ["primaryText", "headline", "description"].forEach((name) => {
            const currentValue = name === "primaryText"
                ? getPrimaryText(current)
                : name === "description"
                    ? getDescription(current)
                    : current[name] || "";

            const value = enabled
                ? currentValue || shared[name] || ""
                : shared[name] ?? currentValue;

            next[name] = value;
            if (name === "primaryText") next.message = value;
            if (name === "description") next.Description = value;
        });

        form.setFieldValue(path, next);
        form.setFieldValue(
            adsPath,
            currentAds.map((item) =>
                String(item?.id) === String(adId) ? next : item
            )
        );
    };

    // const setAccountSetting = (key, settingName, value) => {
    //     if (key == null || String(key).trim() === "") return;

    //     const normalizedKey = String(key);
    //     const currentAd = form.getFieldValue(path) || ad || {};
    //     const currentSettings =
    //         form.getFieldValue([...path, "accountSettings"]) ||
    //         currentAd.accountSettings ||
    //         accountSettings;

    //     const existing = currentSettings[normalizedKey] || {};
    //     const defaults = createAccountSettings();

    //     const aliases = {
    //         websiteUrl: { Website_URL: value },
    //         Website_URL: { websiteUrl: value },
    //         displayLink: { Caption: value },
    //         Caption: { displayLink: value },
    //     };

    //     const updatedSetting = {
    //         ...defaults,
    //         ...existing,
    //         [settingName]: value,
    //         ...(aliases[settingName] || {}),
    //         creativeOverrides: {
    //             ...defaults.creativeOverrides,
    //             ...(existing.creativeOverrides || {}),
    //         },
    //     };

    //     const nextSettings = {
    //         ...currentSettings,
    //         [normalizedKey]: updatedSetting,
    //     };

    //     const updatedAd = {
    //         ...currentAd,
    //         accountSettings: nextSettings,
    //     };

    //     form.setFieldValue([...path, "accountSettings"], nextSettings);
    //     form.setFieldValue(path, updatedAd);

    //     const currentAds = form.getFieldValue(adsPath) || [];
    //     form.setFieldValue(
    //         adsPath,
    //         currentAds.map((item) =>
    //             String(item?.id) === String(adId)
    //                 ? { ...item, accountSettings: nextSettings }
    //                 : item
    //         )
    //     );

    //     if (accountOptions.length === 1) {
    //         const legacyFields = {};

    //         if (settingName === "websiteUrl" || settingName === "Website_URL") {
    //             legacyFields.websiteUrl = value;
    //             legacyFields.Website_URL = value;
    //         }

    //         if (settingName === "displayLink" || settingName === "Caption") {
    //             legacyFields.displayLink = value;
    //             legacyFields.Caption = value;
    //         }

    //         if (Object.keys(legacyFields).length) {
    //             const latestAd = {
    //                 ...updatedAd,
    //                 ...legacyFields,
    //                 accountSettings: nextSettings,
    //             };

    //             form.setFieldValue(path, latestAd);
    //             form.setFieldValue(
    //                 adsPath,
    //                 (form.getFieldValue(adsPath) || []).map((item) =>
    //                     String(item?.id) === String(adId)
    //                         ? { ...item, ...legacyFields, accountSettings: nextSettings }
    //                         : item
    //                 )
    //             );
    //         }
    //     }
    // };

    // const useLibraryCreative = (creative) => {
    //     const normalized = normalizeRemoteCreative(creative);

    //     if (!normalized?.url) {
    //         messageApi.warning("This creative does not contain a usable media URL.");
    //         return;
    //     }

    //     const currentAds = [...(form.getFieldValue(adsPath) || [])];
    //     const selectedId = form.getFieldValue(activeIdPath) || adId;

    //     let targetIndex = currentAds.findIndex(
    //         (item) => String(item?.id) === String(selectedId)
    //     );

    //     if (targetIndex < 0) {
    //         currentAds.push(
    //             form.getFieldValue(path) || ad || createInitialAd(selectedAccounts)
    //         );
    //         targetIndex = currentAds.length - 1;
    //     }

    //     const target = currentAds[targetIndex];

    //     if (isDynamicCreative) {
    //         const existingMedia = getMediaItems(target?.media);
    //         const identity = String(normalized.uid || normalized.url || normalized.name);

    //         const alreadySelected = existingMedia.some((media) =>
    //             String(media?.uid || getMediaUrl(media) || getFileName(media)) === identity ||
    //             String(getMediaUrl(media)) === String(normalized.url)
    //         );

    //         if (alreadySelected) {
    //             messageApi.info("This creative is already selected.");
    //             return;
    //         }

    //         const allMedia = [...existingMedia, normalized];
    //         const updatedAd = {
    //             ...target,
    //             media: {
    //                 images: allMedia.filter((media) => !isVideo(media)),
    //                 videos: allMedia.filter((media) => isVideo(media)),
    //                 thumbnail: target?.media?.thumbnail ?? null,
    //             },
    //             filename: allMedia[0] || null,
    //             mediaSource: "creatives",
    //         };

    //         currentAds[targetIndex] = updatedAd;
    //         form.setFieldValue(adsPath, currentAds);
    //         form.setFieldValue(path, updatedAd);
    //         form.setFieldValue(activeIdPath, updatedAd.id);
    //         messageApi.success("Creative added to Dynamic Creative.");
    //         return;
    //     }

    //     const hasExistingMedia = getMediaItems(target?.media).length > 0 ||
    //         Boolean(target?.filename || target?.mediaUrl);

    //     const targetAd = {
    //         ...target,
    //         media: mediaForFile(normalized),
    //         filename: normalized,
    //         mediaUrl: normalized.url,
    //         mediaName: normalized.name,
    //         mediaType: normalized.mediaType,
    //         creativeId: normalized.creativeId,
    //         creativeAssetId: normalized.creativeId,
    //         mediaSource: "creatives",
    //         sourceCreative: normalized.sourceCreative,
    //     };

    //     if (hasExistingMedia) {
    //         const newAd = {
    //             ...targetAd,
    //             id: createId(),
    //             accountSettings: cloneSettings(target.accountSettings),
    //             carouselCards: [],
    //         };

    //         form.setFieldValue(adsPath, [...currentAds, newAd]);
    //         form.setFieldValue(activeIdPath, newAd.id);
    //     } else {
    //         currentAds[targetIndex] = targetAd;
    //         form.setFieldValue(adsPath, currentAds);
    //         form.setFieldValue([...adsPath, targetIndex], targetAd);
    //         form.setFieldValue(activeIdPath, targetAd.id);
    //     }

    //     messageApi.success("Creative added to ad.");
    // };


    const setAccountSetting = (key, settingName, value) => {
        if (key == null || String(key).trim() === "") return;

        const normalizedKey = String(key);
        const currentAd = form.getFieldValue(path) || ad || {};
        const currentAds = form.getFieldValue(adsPath) || [];
        const defaults = createAccountSettings();

        const aliases = {
            websiteUrl: { Website_URL: value },
            Website_URL: { websiteUrl: value },
            displayLink: { Caption: value },
            Caption: { displayLink: value },
        };

        const legacyFields = {};

        if (accountOptions.length === 1) {
            if (
                settingName === "websiteUrl" ||
                settingName === "Website_URL"
            ) {
                legacyFields.websiteUrl = value;
                legacyFields.Website_URL = value;
            }

            if (
                settingName === "displayLink" ||
                settingName === "Caption"
            ) {
                legacyFields.displayLink = value;
                legacyFields.Caption = value;
            }
        }

        const updateAdSettings = (item) => {
            const itemSettings =
                item?.accountSettings &&
                    typeof item.accountSettings === "object"
                    ? item.accountSettings
                    : {};

            const existing = itemSettings[normalizedKey] || {};

            const updatedSetting = {
                ...defaults,
                ...existing,
                [settingName]: value,
                ...(aliases[settingName] || {}),
                creativeOverrides: {
                    ...defaults.creativeOverrides,
                    ...(existing.creativeOverrides || {}),
                },
            };

            return {
                ...item,
                ...legacyFields,
                accountSettings: {
                    ...itemSettings,
                    [normalizedKey]: updatedSetting,
                },
            };
        };

        // Edit individual ad: update only the selected ad.
        // Edit all ads: update every ad in the current adset.
        const updatedAds = overridesEnabled
            ? currentAds.map((item) =>
                String(item?.id) === String(adId)
                    ? updateAdSettings(item)
                    : item
            )
            : currentAds.map(updateAdSettings);

        form.setFieldValue(adsPath, updatedAds);

        // Keep the selected ad's form values synchronized.
        const updatedCurrentAd =
            updatedAds.find(
                (item) => String(item?.id) === String(adId)
            ) || updateAdSettings(currentAd);

        form.setFieldValue(path, updatedCurrentAd);

        form.setFieldValue(
            [...path, "accountSettings"],
            updatedCurrentAd.accountSettings
        );
    };


    const useLibraryCreative = (creative) => {
        const normalized = normalizeRemoteCreative(creative);

        if (!normalized?.url) {
            messageApi.warning(
                "This creative does not contain a usable media URL."
            );
            return;
        }

        const currentAds = [...(form.getFieldValue(adsPath) || [])];

        if (isDynamicCreative) {
            const target = currentAds[0] || ad || createInitialAd(selectedAccounts);
            const existingMedia = getMediaItems(target.media);

            const duplicate = existingMedia.some(
                (item) =>
                    (item?.creativeId &&
                        String(item.creativeId) === String(normalized.creativeId)) ||
                    getMediaUrl(item) === normalized.url
            );

            if (duplicate) {
                messageApi.info("This creative is already selected.");
                return;
            }

            const allMedia = [...existingMedia, normalized];

            const updatedAd = {
                ...target,
                media: {
                    images: allMedia.filter((item) => !isVideo(item)),
                    videos: allMedia.filter((item) => isVideo(item)),
                    thumbnail: target.media?.thumbnail ?? null,
                },
                filename: allMedia,
                mediaSource: "creatives",
                mediaUrl: undefined,
                mediaName: undefined,
                creativeId: undefined,
                creativeAssetId: undefined,
                sourceCreative: undefined,
            };

            form.setFieldValue(adsPath, [updatedAd]);
            form.setFieldValue([...adsPath, 0], updatedAd);
            form.setFieldValue(activeIdPath, updatedAd.id);

            messageApi.success("Creative added to Dynamic Creative.");
            return;
        }

        // Preserve the existing non-dynamic behavior.
        const selectedId = form.getFieldValue(activeIdPath) || adId;

        let targetIndex = currentAds.findIndex(
            (item) => String(item?.id) === String(selectedId)
        );

        if (targetIndex < 0) {
            currentAds.push(
                form.getFieldValue(path) || ad || createInitialAd(selectedAccounts)
            );
            targetIndex = currentAds.length - 1;
        }

        const target = currentAds[targetIndex];
        const hasExistingMedia =
            getMediaItems(target?.media).length > 0 ||
            Boolean(target?.filename || target?.mediaUrl);

        const targetAd = {
            ...target,
            media: mediaForFile(normalized),
            filename: normalized,
            mediaUrl: normalized.url,
            mediaName: normalized.name,
            mediaType: normalized.mediaType,
            creativeId: normalized.creativeId,
            creativeAssetId: normalized.creativeId,
            mediaSource: "creatives",
            sourceCreative: normalized.sourceCreative,
        };

        if (hasExistingMedia) {
            const newAd = {
                ...targetAd,
                id: createId(),
                accountSettings: cloneSettings(target.accountSettings),
                carouselCards: [],
            };

            form.setFieldValue(adsPath, [...currentAds, newAd]);
            form.setFieldValue(activeIdPath, newAd.id);
        } else {
            currentAds[targetIndex] = targetAd;
            form.setFieldValue(adsPath, currentAds);
            form.setFieldValue([...adsPath, targetIndex], targetAd);
            form.setFieldValue(activeIdPath, targetAd.id);
        }

        messageApi.success("Creative added to ad.");
    };
    const replaceAdWithLibraryCreative = (targetId, creative) => {
        const normalized = normalizeRemoteCreative(creative);

        if (!normalized?.url) {
            messageApi.warning("This creative does not contain a usable media URL.");
            return false;
        }

        const currentAds = [...(form.getFieldValue(adsPath) || [])];
        const targetIndex = currentAds.findIndex(
            (item) => String(item?.id) === String(targetId)
        );

        if (targetIndex < 0) {
            messageApi.error("Ad not found. Please select the ad again.");
            return false;
        }

        const target = currentAds[targetIndex];

        const updatedAd = {
            ...target,
            media: mediaForFile(normalized),
            filename: normalized,
            mediaUrl: normalized.url,
            mediaName: normalized.name,
            mediaType: normalized.mediaType,
            creativeId: normalized.creativeId,
            creativeAssetId: normalized.creativeId,
            mediaSource: "creatives",
            sourceCreative: normalized.sourceCreative,
            librarySection: mode === "edit"
                ? target.librarySection || "creatives"
                : "creatives",
        };

        currentAds[targetIndex] = updatedAd;
        form.setFieldValue(adsPath, currentAds);
        form.setFieldValue([...adsPath, targetIndex], updatedAd);
        form.setFieldValue(activeIdPath, updatedAd.id);
        return true;
    };

    const handleCreativesSelected = (files = []) => {
        const mapped = (Array.isArray(files) ? files : [])
            .map((file, index) => normalizeRemoteCreative({
                ...file,
                uid: file?.uid || `creative-${Date.now()}-${index}`,
                name: file?.name || file?.filename || file?.fileName,
                url: getRemoteUrl(file)?.replace(
                    "s3.us-east-1.amazonaws.com",
                    "s3.ap-south-1.amazonaws.com"
                ),
            }))
            .filter((item) => item?.url);

        if (!mapped.length) {
            messageApi.warning("No valid image or video URLs were returned from Creatives.");
            return;
        }

        setSelectedCreatives((previous) => {
            const byUrl = new Map(previous.map((item) => [item.url, item]));
            mapped.forEach((item) => byUrl.set(item.url, item));
            return [...byUrl.values()];
        });

        setCreativesDrawerOpen(false);

        const replacementTargetId = replaceCreativeTargetId;
        setReplaceCreativeTargetId(null);

        if (replacementTargetId) {
            const replaced = replaceAdWithLibraryCreative(replacementTargetId, mapped[0]);

            if (replaced && mapped.length > 1) {
                mapped.slice(1).forEach((creative) => useLibraryCreative(creative));
            }

            if (replaced) {
                messageApi.success(
                    mapped.length > 1
                        ? "Creative replaced. Additional creatives were added in selection order."
                        : "Ad creative replaced successfully."
                );
            }

            return;
        }

        mapped.forEach((creative) => useLibraryCreative(creative));
    };

    const makeAdForFile = (source, file) => {
        const name = getFileName(file).replace(/\.[^.]+$/, "");

        return {
            ...source,
            id: createId(),
            AdName: name || getAdName(source),
            AddName: name || source?.AddName || "",
            media: mediaForFile(file),
            filename: file,
            accountSettings: cloneSettings(source?.accountSettings),
            textOverridesEnabled: source?.textOverridesEnabled === true,
        };
    };

    const updateSharedField = (name, value, aliases = []) => {
        const currentAds = form.getFieldValue(adsPath) || [];

        form.setFieldValue(
            adsPath,
            currentAds.map((item) => {
                if (item?.textOverridesEnabled) return item;

                const updated = { ...item, [name]: value };
                aliases.forEach((alias) => {
                    updated[alias] = value;
                });
                return updated;
            })
        );

        const currentShared = form.getFieldValue([...adsetPath, "sharedAdText"]) || {};

        form.setFieldValue([...adsetPath, "sharedAdText"], {
            ...currentShared,
            [name]: value,
        });
    };

    // const handleUploadChange = ({ fileList = [] }) => {
    //     const incoming = fileList.filter(
    //         (file) => file?.uid &&
    //             !processedUids.current.has(file.uid) &&
    //             isSupportedMedia(file)
    //     );

    //     if (!incoming.length) return;
    //     incoming.forEach((file) => processedUids.current.add(file.uid));

    //     const currentAds = [...(form.getFieldValue(adsPath) || [])];
    //     const selectedId = form.getFieldValue(activeIdPath) || adId;

    //     let activeIndex = currentAds.findIndex(
    //         (item) => String(item?.id) === String(selectedId)
    //     );

    //     if (activeIndex < 0) {
    //         const initialAd = {
    //             ...(form.getFieldValue(path) || ad || createInitialAd(selectedAccounts)),
    //             id: adId || createId(),
    //         };

    //         currentAds.push(initialAd);
    //         activeIndex = currentAds.length - 1;
    //     }

    //     let activeAd = currentAds[activeIndex];

    //     if (isDynamicCreative) {
    //         const existingMedia = getMediaItems(activeAd?.media);
    //         const known = new Set(
    //             existingMedia.map((media) =>
    //                 String(media?.uid || getMediaUrl(media) || getFileName(media))
    //             )
    //         );

    //         const added = incoming.filter((file) => {
    //             const key = String(file?.uid || getMediaUrl(file) || getFileName(file));
    //             if (known.has(key)) return false;
    //             known.add(key);
    //             return true;
    //         });

    //         const allMedia = [...existingMedia, ...added];
    //         const images = allMedia.filter((media) => !isVideo(media));
    //         const videos = allMedia.filter((media) => isVideo(media));

    //         const updatedAd = {
    //             ...activeAd,
    //             media: {
    //                 images,
    //                 videos,
    //                 thumbnail: activeAd?.media?.thumbnail ?? null,
    //             },
    //             filename: allMedia[0] || null,
    //             mediaSource: "upload",
    //         };

    //         currentAds[activeIndex] = updatedAd;
    //         form.setFieldValue(adsPath, currentAds);
    //         form.setFieldValue(path, updatedAd);
    //         form.setFieldValue(activeIdPath, updatedAd.id);
    //         setMediaError(false);
    //         return;
    //     }

    //     const remainingFiles = [...incoming];

    //     if (!getMediaItems(activeAd?.media).length &&
    //         !activeAd?.filename && !activeAd?.mediaUrl) {
    //         const firstFile = remainingFiles.shift();

    //         if (firstFile) {
    //             activeAd = {
    //                 ...activeAd,
    //                 media: mediaForFile(firstFile),
    //                 filename: firstFile,
    //                 mediaUrl: undefined,
    //                 mediaName: undefined,
    //                 creativeId: undefined,
    //                 creativeAssetId: undefined,
    //                 mediaSource: "upload",
    //                 sourceCreative: undefined,
    //             };

    //             currentAds[activeIndex] = activeAd;
    //         }
    //     }

    //     const newAds = remainingFiles.map((file) => ({
    //         ...activeAd,
    //         id: createId(),
    //         AdName: getCurrentAdsetName(),
    //         AddName: getCurrentAdsetName(),
    //         media: mediaForFile(file),
    //         filename: file,
    //         mediaUrl: undefined,
    //         mediaName: undefined,
    //         creativeId: undefined,
    //         creativeAssetId: undefined,
    //         mediaSource: "upload",
    //         sourceCreative: undefined,
    //         accountSettings: cloneSettings(activeAd?.accountSettings),
    //         carouselCards: [],
    //     }));

    //     const nextAds = [...currentAds, ...newAds];
    //     form.setFieldValue(adsPath, nextAds);
    //     setMediaError(false);
    //     form.setFieldValue(activeIdPath, newAds[0]?.id || activeAd.id);

    //     if (String(activeAd.id) === String(adId || "")) {
    //         form.setFieldValue(path, activeAd);
    //     }
    // };
    const handleUploadChange = ({ fileList = [] }) => {
        const incoming = fileList.filter(
            (file) =>
                file?.uid &&
                !processedUids.current.has(file.uid) &&
                isSupportedMedia(file)
        );

        if (!incoming.length) return;

        incoming.forEach((file) => processedUids.current.add(file.uid));

        const currentAds = [...(form.getFieldValue(adsPath) || [])];
        const selectedId = isDynamicCreative
            ? currentAds[0]?.id || adId
            : form.getFieldValue(activeIdPath) || adId;

        let targetIndex = currentAds.findIndex(
            (item) => String(item?.id) === String(selectedId)
        );

        if (targetIndex < 0) {
            currentAds.push(
                form.getFieldValue(path) ||
                ad ||
                createInitialAd(selectedAccounts)
            );
            targetIndex = currentAds.length - 1;
        }

        const targetAd = currentAds[targetIndex];

        if (isDynamicCreative) {
            const existingMedia = getMediaItems(targetAd.media);
            const seen = new Set(
                existingMedia.map(
                    (item) => item?.uid || getMediaUrl(item) || getFileName(item)
                )
            );

            const newMedia = incoming.filter((file) => {
                const key = file.uid || getMediaUrl(file) || getFileName(file);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            const allMedia = [...existingMedia, ...newMedia];

            const updatedAd = {
                ...targetAd,
                media: {
                    images: allMedia.filter((item) => !isVideo(item)),
                    videos: allMedia.filter((item) => isVideo(item)),
                    thumbnail: targetAd.media?.thumbnail ?? null,
                },
                filename: allMedia,
                mediaSource: "upload",
                mediaUrl: undefined,
                mediaName: undefined,
                creativeId: undefined,
                creativeAssetId: undefined,
                sourceCreative: undefined,
            };

            currentAds[targetIndex] = updatedAd;

            form.setFieldValue(adsPath, [updatedAd]);
            form.setFieldValue([...adsPath, 0], updatedAd);
            form.setFieldValue(activeIdPath, updatedAd.id);

            setMediaError(false);
            return;
        }

        let activeAd = targetAd;
        const remainingFiles = [...incoming];

        if (
            !getMediaItems(activeAd?.media).length &&
            !activeAd?.filename &&
            !activeAd?.mediaUrl
        ) {
            const firstFile = remainingFiles.shift();

            if (firstFile) {
                activeAd = {
                    ...activeAd,
                    media: mediaForFile(firstFile),
                    filename: firstFile,
                    mediaUrl: undefined,
                    mediaName: undefined,
                    creativeId: undefined,
                    creativeAssetId: undefined,
                    mediaSource: "upload",
                    sourceCreative: undefined,
                };

                currentAds[targetIndex] = activeAd;
            }
        }

        const newAds = remainingFiles.map((file) => ({
            ...activeAd,
            id: createId(),
            AdName: getCurrentAdsetName(),
            AddName: getCurrentAdsetName(),
            media: mediaForFile(file),
            filename: file,
            mediaUrl: undefined,
            mediaName: undefined,
            creativeId: undefined,
            creativeAssetId: undefined,
            mediaSource: "upload",
            sourceCreative: undefined,
            accountSettings: cloneSettings(activeAd.accountSettings),
            carouselCards: [],
        }));

        form.setFieldValue(adsPath, [...currentAds, ...newAds]);
        form.setFieldValue(
            activeIdPath,
            newAds[0]?.id || activeAd.id
        );

        if (String(activeAd.id) === String(adId || "")) {
            form.setFieldValue(path, activeAd);
        }

        setMediaError(false);
    };
    const handleReplaceAdMedia = ({ file }) => {
        if (!file?.uid || replacementUids.current.has(file.uid)) return;

        if (!isSupportedMedia(file)) {
            messageApi.warning("Upload an image or video.");
            return;
        }

        const targetAdId = adId;
        if (!targetAdId) {
            messageApi.error("Unable to identify the selected ad.");
            return;
        }

        const currentAds = form.getFieldValue(adsPath) || [];
        const targetIndex = currentAds.findIndex(
            (item) => String(item?.id) === String(targetAdId)
        );

        if (targetIndex === -1) {
            messageApi.error("Ad not found. Please select the ad again.");
            return;
        }

        replacementUids.current.add(file.uid);

        const nextAds = currentAds.map((item, index) =>
            index === targetIndex
                ? {
                    ...item,
                    media: mediaForFile(file),
                    filename: file,
                    mediaUrl: undefined,
                    mediaName: undefined,
                    creativeId: undefined,
                    creativeAssetId: undefined,
                    mediaSource: "upload",
                    sourceCreative: undefined,
                }
                : item
        );

        form.setFieldValue(adsPath, nextAds);
    };

    const selectAd = (item) => {
        if (item?.id) form.setFieldValue(activeIdPath, item.id);
    };

    const cloneAd = (sourceAd = ad) => {
        if (typeof onClone === "function") {
            onClone(sourceAd);
            return;
        }

        const currentAds = form.getFieldValue(adsPath) || [];

        const cloned = {
            ...sourceAd,
            id: createId(),
            media: {
                images: [...(sourceAd.media?.images || [])],
                videos: [...(sourceAd.media?.videos || [])],
                thumbnail: sourceAd.media?.thumbnail ?? null,
            },
            filename: sourceAd.filename ?? null,
            accountSettings: cloneSettings(sourceAd.accountSettings),
            carouselCards: Array.isArray(sourceAd.carouselCards)
                ? sourceAd.carouselCards.map((card) => ({
                    ...card,
                    id: createId(),
                }))
                : [],
        };

        form.setFieldValue(adsPath, [...currentAds, cloned]);
        form.setFieldValue(activeIdPath, cloned.id);
    };

    const deleteAd = (sourceAd = ad) => {
        const currentAds = form.getFieldValue(adsPath) || [];
        const sourceId = String(sourceAd?.id || "");

        const remaining = currentAds.filter(
            (item) => String(item?.id || "") !== sourceId
        );

        if (remaining.length === currentAds.length) return;

        if (remaining.length === 0) {
            const firstAd = createInitialAd(selectedAccounts);
            form.setFieldValue(adsPath, [firstAd]);
            form.setFieldValue(activeIdPath, firstAd.id);
            messageApi.success("Default ad restored.");
            return;
        }

        form.setFieldValue(adsPath, remaining);

        const activeId = form.getFieldValue(activeIdPath);

        if (
            String(activeId || "") === sourceId ||
            !remaining.some((item) => String(item?.id) === String(activeId))
        ) {
            form.setFieldValue(activeIdPath, remaining[0].id);
        }
    };

    const renderUpload = () => (
        <Upload
            accept="image/*,video/*"
            multiple
            disabled={disabled}
            beforeUpload={(file) => {
                if (!isSupportedMedia(file)) {
                    messageApi.warning("Upload an image or video.");
                    return Upload.LIST_IGNORE;
                }
                return false;
            }}
            showUploadList={false}
            onChange={handleUploadChange}
        >
            <Button icon={<UploadOutlined />} disabled={disabled}>
                Add images / videos
            </Button>
        </Upload>
    );

    const renderCreativeStrip = () => {
        const currentAds = form.getFieldValue(adsPath) || ads || [];

        const getAdMedia = (item, itemIndex) => {
            const mediaItems = getMediaItems(item?.media);
            const legacyFiles = Array.isArray(item?.filename)
                ? item.filename
                : item?.filename
                    ? [item.filename]
                    : [];

            const allMedia = [];
            const seen = new Set();

            [...mediaItems, ...legacyFiles].forEach((media) => {
                if (!media) return;

                const identity = media?.uid
                    ? `uid:${media.uid}`
                    : getMediaUrl(media) ||
                    getFileName(media) ||
                    String(media);

                if (seen.has(identity)) return;
                seen.add(identity);
                allMedia.push(media);
            });

            if (!allMedia.length && item?.mediaUrl) {
                allMedia.push({
                    uid: item?.creativeId || item?.creativeAssetId || item?.id,
                    name: item?.mediaName || item?.mediaUrl.split("/").pop(),
                    filename: item?.mediaName || item?.mediaUrl.split("/").pop(),
                    url: item.mediaUrl,
                    type: item?.mediaType,
                    mediaType: item?.mediaType,
                    isRemote: true,
                });
            }

            if (!allMedia.length) {
                return [{
                    ad: item,
                    media: null,
                    adIndex: itemIndex,
                    mediaIndex: 0,
                }];
            }

            return allMedia.map((media, mediaIndex) => ({
                ad: item,
                media,
                adIndex: itemIndex,
                mediaIndex,
            }));
        };

        const getMediaSource = (item) => {
            const source = String(item?.mediaSource || "").toLowerCase();

            if (["creatives", "creative", "library"].includes(source)) {
                return "creatives";
            }

            if (["upload", "local", "device"].includes(source)) {
                return "upload";
            }

            return item?.sourceCreative ||
                item?.creativeId ||
                item?.creativeAssetId
                ? "creatives"
                : "upload";
        };

        const localCards = [];
        const libraryCards = [];

        currentAds.forEach((item, index) => {
            const cards = getAdMedia(item, index);

            const section = mode === "edit"
                ? item?.librarySection || "creatives"
                : getMediaSource(item) === "creatives"
                    ? "creatives"
                    : "local";

            if (section === "creatives") {
                libraryCards.push(...cards);
            } else {
                localCards.push(...cards);
            }
        });

        const totalFiles =
            localCards.filter(({ media }) => media).length +
            libraryCards.filter(({ media }) => media).length;

        const renderFileCards = (items) => {
            if (!items.length || items.every(({ media }) => !media)) {
                return (
                    <Empty
                        className="no-files-selected-empty"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span style={{ fontSize: 12 }}>No files selected</span>
                        }
                        styles={{ image: { height: 30 } }}
                    />
                );
            }

            return (
                <div className="ad-creative-source-grid">
                    {items.map(({ ad: item, media, adIndex, mediaIndex }, index) => {
                        if (!media) return null;

                        const url = getMediaPreviewUrl(media);
                        const name = getFileName(media) ||
                            getAdName(item) ||
                            `Ad ${adIndex + 1}`;

                        const selected =
                            String(item?.id || "") === String(activeAdId || "");

                        return (
                            <div
                                key={`${item?.id || adIndex}-${media?.uid || mediaIndex}-${index}`}
                                className={`ad-creative-source-file ${selected ? "selected" : ""}`}
                                role="button"
                                tabIndex={0}
                                aria-pressed={selected}
                                onClick={() => selectAd(item)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        selectAd(item);
                                    }
                                }}
                            >
                                <div className="ad-creative-source-thumbnail">
                                    {url ? (
                                        isVideo(media) ? (
                                            <video
                                                src={url}
                                                muted
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <img src={url} alt={name} />
                                        )
                                    ) : (
                                        <PictureOutlined style={{ fontSize: 22 }} />
                                    )}
                                </div>

                                <div className="ad-creative-source-info">
                                    <Text
                                        strong
                                        ellipsis
                                        style={{ display: "block", fontSize: 13 }}
                                    >
                                        {name}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {isVideo(media) ? "Video" : "Image"}
                                    </Text>
                                </div>

                                <div className="ad-creative-source-actions">
                                    <Tooltip title="Clone ad">
                                        <Button
                                            size="small"
                                            type="text"
                                            icon={<CopyOutlined />}
                                            disabled={disabled}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                cloneAd(item);
                                            }}
                                        />
                                    </Tooltip>

                                    <Tooltip title="Remove file">
                                        <Button
                                            size="small"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            disabled={disabled}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                deleteAd(item);
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        };

        return (
            <Card
                size="small"
                title={
                    <Space size={8} wrap>
                        <PictureOutlined />
                        <span>Creatives</span>
                        <Tag>{currentAds.length} ads</Tag>
                        <Tag>{totalFiles} files</Tag>
                    </Space>
                }
                styles={{ body: { padding: 16 } }}
            >
                <style>
                    {`
                        .ad-creative-source-layout {
                            display: grid;
                            grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
                            gap: 20px;
                            width: 100%;
                            min-width: 0;
                        }
                        .ad-creative-source-panel {
                            display: flex;
                            flex-direction: column;
                            align-items: stretch;
                            gap: 12px;
                            min-width: 0;
                        }
                        .ad-creative-source-heading {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 14px;
                            font-weight: 600;
                        }
                        .ad-creative-source-description {
                            display: block;
                            font-size: 12px;
                            line-height: 1.6;
                            color: var(--ant-color-text-secondary);
                        }
                        .ad-creative-source-divider {
                            width: 1px;
                            background: var(--ant-color-border-secondary);
                        }
                        .ad-creative-source-grid {
                            display: grid;
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 10px;
                            width: 100%;
                            min-width: 0;
                        }
                        .ad-creative-source-file {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            min-width: 0;
                            width: 100%;
                            padding: 8px;
                            box-sizing: border-box;
                            border: 1px solid var(--ant-color-border);
                            border-radius: 8px;
                            background: var(--ant-color-bg-container);
                            cursor: pointer;
                            transition: border-color 0.2s, background 0.2s;
                        }
                        .ad-creative-source-file:hover {
                            border-color: var(--ant-color-primary);
                        }
                        .ad-creative-source-file.selected {
                            border-color: var(--ant-color-primary);
                            background: var(--ant-color-primary-bg);
                        }
                        .ad-creative-source-thumbnail {
                            display: grid;
                            place-items: center;
                            flex: 0 0 48px;
                            width: 48px;
                            height: 48px;
                            overflow: hidden;
                            border-radius: 6px;
                            background: var(--ant-color-bg-layout);
                        }
                        .ad-creative-source-thumbnail img,
                        .ad-creative-source-thumbnail video {
                            display: block;
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                        .ad-creative-source-info {
                            flex: 1;
                            min-width: 0;
                        }
                        .ad-creative-source-actions {
                            display: flex;
                            align-items: center;
                            flex-shrink: 0;
                            gap: 0;
                        }
                        @media (min-width: 768px) and (max-width: 1199px) {
                            .ad-creative-source-grid {
                                grid-template-columns: minmax(0, 1fr);
                            }
                        }
                        @media (max-width: 767px) {
                            .ad-creative-source-layout {
                                grid-template-columns: minmax(0, 1fr);
                                gap: 16px;
                            }
                            .ad-creative-source-divider {
                                width: 100%;
                                height: 1px;
                            }
                            .ad-creative-source-grid {
                                grid-template-columns: minmax(0, 1fr);
                            }
                        }
                    `}
                </style>

                <div className="ad-creative-source-layout">
                    <section className="ad-creative-source-panel">
                        <div>
                            <div className="ad-creative-source-heading">
                                <PictureOutlined />
                                <span>Choose from Creatives</span>
                            </div>
                            <Text className="ad-creative-source-description">
                                Select existing images or videos from your library.
                            </Text>
                        </div>

                        <div>
                            <Button
                                icon={<PictureOutlined />}
                                disabled={disabled}
                                onClick={() => {
                                    setReplaceCreativeTargetId(null);
                                    setCreativesDrawerOpen(true);
                                }}
                            >
                                Browse Creatives
                            </Button>
                        </div>

                        <Divider style={{ margin: "2px 0" }} />
                        {renderFileCards(libraryCards)}
                    </section>

                    <div className="ad-creative-source-divider" />

                    <section className="ad-creative-source-panel">
                        <div>
                            <div className="ad-creative-source-heading">
                                <UploadOutlined />
                                <span>Upload from device</span>
                            </div>
                            <Text className="ad-creative-source-description">
                                Select images or videos from your computer.
                            </Text>
                        </div>

                        {renderUpload()}
                        <Divider style={{ margin: "2px 0" }} />
                        {renderFileCards(localCards)}
                    </section>
                </div>
            </Card>
        );
    };
    const renderPreview = () => {
        const previewMedia = isDynamicCreative
            ? (
                getMediaItems(ad?.media).length
                    ? getMediaItems(ad.media)
                    : firstMedia
                        ? [firstMedia]
                        : []
            )
            : [firstMedia].filter(Boolean);

        const previewItems = previewMedia.length ? previewMedia : [null];

        return (
            <Card size="small" styles={{ body: { padding: previewVisible ? 0 : 8 } }}>
                {previewVisible && previewItems.map((media, previewIndex) => {
                    const itemUrl = getMediaPreviewUrl(media) ||
                        (previewIndex === 0 ? localPreview : "");

                    const itemPrimaryText = isDynamicCreative
                        ? dynamicPrimaryTexts[previewIndex % dynamicPrimaryTexts.length] || ""
                        : Array.isArray(primaryText) ? primaryText[0] : primaryText;

                    const itemHeadline = isDynamicCreative
                        ? dynamicHeadlines[previewIndex % dynamicHeadlines.length] || ""
                        : Array.isArray(headline) ? headline[0] : headline;

                    const itemDescription = isDynamicCreative
                        ? dynamicDescriptions[previewIndex % dynamicDescriptions.length] || ""
                        : Array.isArray(description) ? description[0] : description;

                    return (
                        <div
                            key={`${media?.uid || getMediaUrl(media) || "empty"}-${previewIndex}`}
                            style={{
                                width: "100%",
                                maxWidth: 420,
                                margin: "0 auto",
                                overflow: "hidden",
                                borderRadius: 8,
                                border: "1px solid var(--ant-color-border)",
                            }}
                        >
                            <div style={{ padding: 12 }}>
                                <Row align="middle" gutter={8} wrap={false}>
                                    <Col>
                                        <Avatar size={38} icon={<UserOutlined />} />
                                    </Col>
                                    <Col flex="auto" style={{ minWidth: 0 }}>
                                        <Text strong style={{ display: "block" }} ellipsis>
                                            {pageName}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Sponsored
                                        </Text>
                                    </Col>
                                    <Col>
                                        <Text type="secondary">•••</Text>
                                    </Col>
                                </Row>

                                <div style={{
                                    marginTop: 10,
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "anywhere",
                                }}>
                                    {itemPrimaryText || "Your primary text will appear here."}
                                </div>
                            </div>

                            {itemUrl ? (
                                isVideo(media) ? (
                                    <video
                                        src={itemUrl}
                                        controls
                                        playsInline
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            maxHeight: 380,
                                            objectFit: "contain",
                                            background: "#000",
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={itemUrl}
                                        alt={getFileName(media) || "Ad creative"}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            maxHeight: 380,
                                            objectFit: "cover",
                                            background: "var(--ant-color-bg-layout)",
                                        }}
                                    />
                                )
                            ) : (
                                <div style={{
                                    minHeight: 190,
                                    display: "grid",
                                    placeItems: "center",
                                    background: "var(--ant-color-bg-layout)",
                                    padding: 20,
                                }}>
                                    <Space orientation="vertical" align="center">
                                        <PictureOutlined style={{ fontSize: 34 }} />
                                        <Text type="secondary">
                                            Upload an image or video
                                        </Text>
                                    </Space>
                                </div>
                            )}

                            <div style={{
                                padding: 12,
                                background: "var(--ant-color-bg-layout)",
                            }}>
                                <Text type="secondary" style={{
                                    display: "block",
                                    fontSize: 11,
                                    textTransform: "uppercase",
                                    overflowWrap: "anywhere",
                                }}>
                                    {previewLink || "Your website"}
                                </Text>

                                <Row align="middle" gutter={8} wrap={false}>
                                    <Col flex="auto" style={{ minWidth: 0 }}>
                                        <Text strong style={{
                                            display: "block",
                                            overflowWrap: "anywhere",
                                        }}>
                                            {itemHeadline || adName || "Your ad headline"}
                                        </Text>

                                        {itemDescription && (
                                            <Text type="secondary" style={{
                                                display: "block",
                                                overflowWrap: "anywhere",
                                                marginTop: 4,
                                            }}>
                                                {itemDescription}
                                            </Text>
                                        )}
                                    </Col>

                                    <Col flex="none">
                                        <Button size="small" style={{
                                            maxWidth: 120,
                                            whiteSpace: "normal",
                                            height: "auto",
                                            minHeight: 28,
                                        }}>
                                            {CTA_LABELS[ad.callToAction] || "Learn More"}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <Divider style={{ margin: 0 }} />
                            <Row justify="space-around" style={{ padding: 12 }}>
                                <Text><LikeOutlined /> Like</Text>
                                <Text><MessageOutlined /> Comment</Text>
                                <Text><ShareAltOutlined /> Share</Text>
                            </Row>
                        </div>
                    );
                })}
            </Card>
        );
    };

    // const updateDynamicTextOption = (name, index, value) => {
    //     const current = asTextOptions(form.getFieldValue([...path, name]));
    //     const next = [...current];
    //     next[index] = value;

    //     const nextValues = next.slice(0, 5);
    //     setAdField(name, nextValues);

    //     if (name === "primaryText") {
    //         setAdField("message", nextValues);
    //     }
    //     if (name === "description") {
    //         setAdField("Description", nextValues);
    //     }

    //     const currentAds = form.getFieldValue(adsPath) || [];

    //     form.setFieldValue(
    //         adsPath,
    //         currentAds.map((item) =>
    //             String(item?.id) === String(adId)
    //                 ? {
    //                     ...item,
    //                     [name]: nextValues,
    //                     ...(name === "primaryText" ? { message: nextValues } : {}),
    //                     ...(name === "description" ? { Description: nextValues } : {}),
    //                 }
    //                 : item
    //         )
    //     );
    // };

    const updateDynamicTextOption = (name, index, value) => {
        const current = asTextOptions(
            form.getFieldValue([...path, name])
        );

        const nextValues = [...current];
        nextValues[index] = value;

        const next = nextValues.slice(0, 5);

        if (overridesEnabled) {
            // Individual-ad mode: update only this ad.
            const updatedAd = {
                ...(form.getFieldValue(path) || ad),
                [name]: next,
                ...(name === "primaryText" ? { message: next } : {}),
                ...(name === "description" ? { Description: next } : {}),
            };

            form.setFieldValue(path, updatedAd);

            const currentAds = form.getFieldValue(adsPath) || [];

            form.setFieldValue(
                adsPath,
                currentAds.map((item) =>
                    String(item?.id) === String(adId)
                        ? updatedAd
                        : item
                )
            );

            return;
        }

        // Edit-all mode: update shared text and propagate it
        // to every ad that does not have individual overrides.
        const currentShared =
            form.getFieldValue([...adsetPath, "sharedAdText"]) || {};

        form.setFieldValue(
            [...adsetPath, "sharedAdText"],
            {
                ...currentShared,
                [name]: next,
            }
        );

        const currentAds = form.getFieldValue(adsPath) || [];

        form.setFieldValue(
            adsPath,
            currentAds.map((item) => {
                if (item?.textOverridesEnabled === true) {
                    return item;
                }

                return {
                    ...item,
                    [name]: next,
                    ...(name === "primaryText" ? { message: next } : {}),
                    ...(name === "description" ? { Description: next } : {}),
                };
            })
        );
    };

    const addDynamicTextOption = (name) => {
        const current = asTextOptions(form.getFieldValue([...path, name]));
        if (current.length >= 5) return;

        const next = [...current, ""];
        setAdField(name, next);

        const currentAds = form.getFieldValue(adsPath) || [];
        form.setFieldValue(
            adsPath,
            currentAds.map((item) =>
                String(item?.id) === String(adId)
                    ? { ...item, [name]: next }
                    : item
            )
        );
    };

    const removeDynamicTextOption = (name, index) => {
        const current = asTextOptions(form.getFieldValue([...path, name]));

        if (current.length <= 1) {
            updateDynamicTextOption(name, 0, "");
            return;
        }

        const next = current.filter((_, itemIndex) => itemIndex !== index);
        setAdField(name, next);

        const currentAds = form.getFieldValue(adsPath) || [];
        form.setFieldValue(
            adsPath,
            currentAds.map((item) =>
                String(item?.id) === String(adId)
                    ? { ...item, [name]: next }
                    : item
            )
        );
    };

    const renderDynamicTextField = (
        name,
        label,
        placeholder,
        multiline = false
    ) => {
        const values = asTextOptions(
            form.getFieldValue([...path, name]) ?? ad[name]
        );

        const textInputStyle = {
            borderColor: "#39b54a",
            borderRadius: 8,
            minHeight: 52,
        };

        return (
            <div className="dynamic-creative-text-field" key={name}>
                <div className="dynamic-creative-label">
                    <span className="required-star">*</span> {label}
                </div>


                {values.map((value, index) => (
                    <div
                        className="dynamic-creative-option"
                        key={`${name}-${index}`}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {multiline ? (
                                <TextArea
                                    value={value}
                                    disabled={disabled}
                                    placeholder={`${placeholder} ${index + 1}`}
                                    autoSize={{ minRows: 2, maxRows: 5 }}
                                    style={{
                                        ...textInputStyle,
                                        width: "100%",
                                        marginBottom: 4
                                    }}
                                    onChange={(event) =>
                                        updateDynamicTextOption(
                                            name,
                                            index,
                                            event.target.value
                                        )
                                    }
                                />
                            ) : (
                                <Input
                                    value={value}
                                    disabled={disabled}
                                    placeholder={`${placeholder} ${index + 1}`}
                                    style={{
                                        ...textInputStyle,
                                        width: "100%",
                                    }}
                                    onChange={(event) =>
                                        updateDynamicTextOption(
                                            name,
                                            index,
                                            event.target.value
                                        )
                                    }
                                />
                            )}
                        </div>

                        <Button
                            type="text"
                            danger
                            disabled={disabled}
                            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                            icon={<DeleteOutlined />}
                            onClick={() => removeDynamicTextOption(name, index)}
                        />

                        {index === values.length - 1 && values.length < 5 && (
                            <Button
                                type="text"
                                disabled={disabled}
                                aria-label={`Add ${label.toLowerCase()}`}
                                icon={<PlusOutlined />}
                                style={{ color: "#39b54a" }}
                                onClick={() => addDynamicTextOption(name)}
                            />
                        )}
                    </div>
                ))}


                {/* {values.length > 1 && values.length < 5 && (
                        <Button
                            type="text"
                            disabled={disabled}
                            icon={<PlusOutlined />}
                            style={{
                                color: "#39b54a",
                                alignSelf: "flex-start",
                            }}
                            onClick={() => addDynamicTextOption(name)}
                        >
                            Add {label.toLowerCase()} ({values.length}/5)
                        </Button>
                    )} */}

                {values.length >= 5 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Maximum 5 options reached.
                    </Text>
                )}
            </div>
        );
    };
    const renderCreativeFields = () => {
        const fieldPath = (name) => [adIndex, name];

        const requiredRule = (label) => [
            {
                required: true,
                whitespace: true,
                message: `${label} is required.`,
            },
        ];

        const validateAllAccounts = (field, label) => ({
            validator: async () => {
                const currentAd = form.getFieldValue(path) || ad || {};
                const settings =
                    form.getFieldValue([...path, "accountSettings"]) ||
                    currentAd.accountSettings ||
                    {};

                const missingAccounts = accountOptions
                    .filter(({ value }) => {
                        const fieldValue = form.getFieldValue([
                            adIndex,
                            "accountSettings",
                            value,
                            field,
                        ]) ?? settings[value]?.[field] ?? "";

                        return !String(fieldValue).trim();
                    })
                    .map(({ label }) => label);

                if (missingAccounts.length) {
                    throw new Error(
                        `${label} is required for: ${missingAccounts.join(", ")}`
                    );
                }
            },
        });

        return (
            <div className="ad-creative-fields">
                <Form.Item
                    name={[adIndex, "mediaValidation"]}
                    hidden
                    rules={[
                        {
                            validator: async () => {
                                const currentAds = form.getFieldValue(adsPath) || [];
                                const currentAd = currentAds.find(
                                    (item) => String(item?.id) === String(adId)
                                );

                                if (getFirstMedia(currentAd || ad)) {
                                    setMediaError(false);
                                    return;
                                }

                                setMediaError(true);
                                throw new Error("Please select an image or video.");
                            },
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name={fieldPath("AdName")}
                    label="Ad name"
                    rules={requiredRule("Ad name")}
                >
                    <Input disabled={disabled} placeholder="Enter ad name" />
                </Form.Item>

                <Form.Item
                    name={fieldPath("page_id")}
                    label="Facebook Page"
                    rules={[
                        {
                            validator: async (_, value) => {
                                const selected = Array.isArray(value)
                                    ? value
                                    : value == null || value === ""
                                        ? []
                                        : [value];

                                const missingAccount = selectedAccounts.find((account) => {
                                    const accountKey = String(
                                        getAccountKey(account) ?? account
                                    );

                                    return !selected.some((page) =>
                                        String(page).startsWith(`${accountKey} - `)
                                    );
                                });

                                if (missingAccount) {
                                    throw new Error(
                                        `Please select a Facebook Page for account ${getAccountKey(missingAccount) ?? missingAccount
                                        }.`
                                    );
                                }

                                if (!selected.length) {
                                    throw new Error(
                                        "Select at least one Facebook Page."
                                    );
                                }
                            },
                        },
                    ]}
                >
                    <Select
                        className="ad-page-select"
                        mode="multiple"
                        maxTagCount={1}
                        disabled={disabled}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        placeholder="Select Facebook Pages"
                        options={(page_id_list || []).map((option) => {
                            const optionValue = String(option.value);
                            const accountKey = optionValue.split(" - ")[0].trim();
                            const isPageMode =
                                String(multiplePage ?? "").trim().toLowerCase() === "page";

                            const selectedPages = (watchedAdsets || []).flatMap((adset) =>
                                (adset?.ads || []).flatMap((item) => {
                                    const value = item?.page_id;

                                    return Array.isArray(value)
                                        ? value.map(String)
                                        : value == null || value === ""
                                            ? []
                                            : [String(value)];
                                })
                            );

                            const selectedForAccount = [
                                ...new Set(
                                    selectedPages.filter(
                                        (page) => page.split(" - ")[0].trim() === accountKey
                                    )
                                ),
                            ];

                            return {
                                ...option,
                                disabled:
                                    isPageMode &&
                                    selectedForAccount.length > 0 &&
                                    !selectedForAccount.includes(optionValue),
                            };
                        })}
                        onChange={(value) => {
                            let selectedPages = Array.isArray(value)
                                ? value.map(String)
                                : [];

                            if (
                                String(multiplePage ?? "").trim().toLowerCase() === "page"
                            ) {
                                const pagesByAccount = new Map();

                                selectedPages.forEach((page) => {
                                    const accountKey = page.split(" - ")[0].trim();

                                    // Keep only one Page per account.
                                    pagesByAccount.set(accountKey, page);
                                });

                                selectedPages = [...pagesByAccount.values()];
                            }

                            // Preserve your existing behavior: synchronize Pages across all ads.
                            const currentAdsets = form.getFieldValue("adsets") || [];

                            const updatedAdsets = currentAdsets.map((adset) => ({
                                ...adset,
                                ads: (adset.ads || []).map((item) => ({
                                    ...item,
                                    page_id: [...selectedPages],
                                })),
                            }));

                            form.setFieldValue("adsets", updatedAdsets);
                        }}
                        classNames={{
                            popup: {
                                root: "campaigns-dropdown",
                            },
                        }}
                    />
                </Form.Item>

                {isDynamicCreative ? (
                    <>
                        {renderDynamicTextField(
                            "primaryText",
                            "Primary Text",
                            "Primary text",
                            true
                        )}
                        {renderDynamicTextField(
                            "headline",
                            "Headline",
                            "Headline",
                            false
                        )}
                        {renderDynamicTextField(
                            "description",
                            "Description",
                            "Description",
                            true
                        )}
                    </>
                ) : (
                    <>
                        <Form.Item
                            name={fieldPath("primaryText")}
                            label="Primary text"
                            rules={requiredRule("Primary text")}
                            getValueFromEvent={(event) => {
                                const value = event?.target?.value ?? "";
                                updateText("primaryText", value);
                                return value;
                            }}
                        >
                            <TextArea
                                disabled={disabled}
                                placeholder="Write primary text"
                                autoSize={{ minRows: 2, maxRows: 5 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name={fieldPath("headline")}
                            label="Headline"
                            rules={requiredRule("Headline")}
                            getValueFromEvent={(event) => {
                                const value = event?.target?.value ?? "";
                                updateText("headline", value);
                                return value;
                            }}
                        >
                            <Input
                                disabled={disabled}
                                placeholder="Enter headline"
                            />
                        </Form.Item>

                        <Form.Item
                            name={fieldPath("description")}
                            label="Description"
                            rules={requiredRule("Description")}
                            getValueFromEvent={(event) => {
                                const value = event?.target?.value ?? "";
                                updateText("description", value);
                                return value;
                            }}
                        >
                            <TextArea
                                disabled={disabled}
                                placeholder="Enter description"
                                autoSize={{ minRows: 1, maxRows: 4 }}
                            />
                        </Form.Item>
                    </>
                )}

                {accountOptions.length > 0 && (
                    <>
                        {accountOptions.length > 1 && (
                            <Form.Item label="Select account">
                                <Select
                                    value={accountKey || undefined}
                                    options={accountOptions}
                                    disabled={disabled}
                                    placeholder="Select account"
                                    onChange={setPreviewAccountKey}
                                    classNames={{
                                        popup: {
                                            root: "campaigns-dropdown",
                                        },
                                    }}
                                />
                            </Form.Item>
                        )}

                        <Form.Item
                            name={[
                                adIndex,
                                "accountSettings",
                                accountKey,
                                "websiteUrl",
                            ]}
                            required
                            label={
                                <Space size={8}>
                                    <span>Website URL</span>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        disabled={disabled}
                                        onClick={() =>
                                            setIsModalVisibleForURLBuilder(true)
                                        }
                                    />

                                    {accountOptions.length > 1 && (
                                        <>
                                            <Button
                                                size="small"
                                                style={{
                                                    border: "1px solid #91c25f",
                                                    color: "#91c25f",
                                                    fontSize: 12,
                                                }}
                                                disabled={disabled}
                                                // onClick={async () => {
                                                //     const websiteUrl =
                                                //         form.getFieldValue([
                                                //             ...path,
                                                //             "accountSettings",
                                                //             accountKey,
                                                //             "websiteUrl",
                                                //         ]) || "";

                                                //     const displayLink =
                                                //         form.getFieldValue([
                                                //             ...path,
                                                //             "accountSettings",
                                                //             accountKey,
                                                //             "displayLink",
                                                //         ]) || "";

                                                //     const currentAd =
                                                //         form.getFieldValue(path) || {};

                                                //     const settings = {
                                                //         ...(currentAd.accountSettings || {}),
                                                //     };

                                                //     accountOptions.forEach(({ value }) => {
                                                //         const key = String(value);

                                                //         settings[key] = {
                                                //             ...createAccountSettings(),
                                                //             ...(settings[key] || {}),
                                                //             websiteUrl,
                                                //             Website_URL: websiteUrl,
                                                //             displayLink,
                                                //             Caption: displayLink,
                                                //         };
                                                //     });

                                                //     form.setFieldValue(
                                                //         [...path, "accountSettings"],
                                                //         settings
                                                //     );

                                                //     const updatedAd = {
                                                //         ...currentAd,
                                                //         accountSettings: settings,
                                                //     };

                                                //     form.setFieldValue(path, updatedAd);

                                                //     const currentAds =
                                                //         form.getFieldValue(adsPath) || [];

                                                //     form.setFieldValue(
                                                //         adsPath,
                                                //         currentAds.map((item) =>
                                                //             String(item?.id) === String(adId)
                                                //                 ? {
                                                //                     ...item,
                                                //                     accountSettings: settings,
                                                //                 }
                                                //                 : item
                                                //         )
                                                //     );

                                                //     form.setFields(
                                                //         accountOptions.flatMap(({ value }) => [
                                                //             {
                                                //                 name: [
                                                //                     ...path,
                                                //                     "accountSettings",
                                                //                     String(value),
                                                //                     "websiteUrl",
                                                //                 ],
                                                //                 errors: [],
                                                //             },
                                                //             {
                                                //                 name: [
                                                //                     ...path,
                                                //                     "accountSettings",
                                                //                     String(value),
                                                //                     "displayLink",
                                                //                 ],
                                                //                 errors: [],
                                                //             },
                                                //         ])
                                                //     );

                                                //     await form.validateFields([
                                                //         ...accountOptions.map(({ value }) => [
                                                //             adIndex,
                                                //             "accountSettings",
                                                //             String(value),
                                                //             "websiteUrl",
                                                //         ]),
                                                //         ...accountOptions.map(({ value }) => [
                                                //             adIndex,
                                                //             "accountSettings",
                                                //             String(value),
                                                //             "displayLink",
                                                //         ]),
                                                //     ]).catch(() => { });
                                                // }}

                                                onClick={async () => {
                                                    const websiteUrl =
                                                        form.getFieldValue([
                                                            ...path,
                                                            "accountSettings",
                                                            accountKey,
                                                            "websiteUrl",
                                                        ]) || "";

                                                    const displayLink =
                                                        form.getFieldValue([
                                                            ...path,
                                                            "accountSettings",
                                                            accountKey,
                                                            "displayLink",
                                                        ]) || "";

                                                    const currentAds = form.getFieldValue(adsPath) || [];

                                                    const updateAccounts = (item) => {
                                                        const existingSettings = item?.accountSettings || {};
                                                        const nextSettings = { ...existingSettings };

                                                        accountOptions.forEach(({ value }) => {
                                                            const key = String(value);
                                                            const existing = existingSettings[key] || {};

                                                            nextSettings[key] = {
                                                                ...createAccountSettings(),
                                                                ...existing,
                                                                websiteUrl,
                                                                Website_URL: websiteUrl,
                                                                displayLink,
                                                                Caption: displayLink,
                                                                creativeOverrides: {
                                                                    ...createAccountSettings().creativeOverrides,
                                                                    ...(existing.creativeOverrides || {}),
                                                                },
                                                            };
                                                        });

                                                        return {
                                                            ...item,
                                                            accountSettings: nextSettings,
                                                        };
                                                    };

                                                    const updatedAds = currentAds.map((item) => {
                                                        const isSelectedAd =
                                                            String(item?.id) === String(adId);

                                                        if (overridesEnabled && !isSelectedAd) {
                                                            return item;
                                                        }

                                                        return updateAccounts(item);
                                                    });

                                                    form.setFieldValue(adsPath, updatedAds);

                                                    const updatedCurrentAd =
                                                        updatedAds.find(
                                                            (item) => String(item?.id) === String(adId)
                                                        );

                                                    if (updatedCurrentAd) {
                                                        form.setFieldValue(path, updatedCurrentAd);
                                                        form.setFieldValue(
                                                            [...path, "accountSettings"],
                                                            updatedCurrentAd.accountSettings
                                                        );
                                                    }

                                                    form.setFields(
                                                        accountOptions.flatMap(({ value }) => [
                                                            {
                                                                name: [
                                                                    ...path,
                                                                    "accountSettings",
                                                                    String(value),
                                                                    "websiteUrl",
                                                                ],
                                                                errors: [],
                                                            },
                                                            {
                                                                name: [
                                                                    ...path,
                                                                    "accountSettings",
                                                                    String(value),
                                                                    "displayLink",
                                                                ],
                                                                errors: [],
                                                            },
                                                        ])
                                                    );

                                                    await form.validateFields([
                                                        ...accountOptions.map(({ value }) => [
                                                            ...path,
                                                            "accountSettings",
                                                            String(value),
                                                            "websiteUrl",
                                                        ]),
                                                        ...accountOptions.map(({ value }) => [
                                                            ...path,
                                                            "accountSettings",
                                                            String(value),
                                                            "displayLink",
                                                        ]),
                                                    ]).catch(() => { });
                                                }}

                                            >
                                                Set to All Accounts
                                            </Button>

                                            <Button
                                                style={{ fontSize: 12 }}
                                                size="small"
                                                danger
                                                disabled={disabled}
                                                // onClick={() => {
                                                //     accountOptions.forEach(({ value }) => {
                                                //         setAccountSetting(
                                                //             value,
                                                //             "websiteUrl",
                                                //             ""
                                                //         );
                                                //         setAccountSetting(
                                                //             value,
                                                //             "displayLink",
                                                //             ""
                                                //         );
                                                //     });

                                                //     form.setFields(
                                                //         accountOptions.flatMap(({ value }) => [
                                                //             {
                                                //                 name: [
                                                //                     ...path,
                                                //                     "accountSettings",
                                                //                     String(value),
                                                //                     "websiteUrl",
                                                //                 ],
                                                //                 errors: [],
                                                //             },
                                                //             {
                                                //                 name: [
                                                //                     ...path,
                                                //                     "accountSettings",
                                                //                     String(value),
                                                //                     "displayLink",
                                                //                 ],
                                                //                 errors: [],
                                                //             },
                                                //         ])
                                                //     );
                                                // }}

                                                onClick={() => {
                                                    const currentAds = form.getFieldValue(adsPath) || [];

                                                    const clearAccountSettings = (item) => {
                                                        const existingSettings = item?.accountSettings || {};
                                                        const nextSettings = { ...existingSettings };

                                                        accountOptions.forEach(({ value }) => {
                                                            const key = String(value);
                                                            const existing = existingSettings[key] || {};

                                                            nextSettings[key] = {
                                                                ...createAccountSettings(),
                                                                ...existing,
                                                                websiteUrl: "",
                                                                Website_URL: "",
                                                                displayLink: "",
                                                                Caption: "",
                                                                creativeOverrides: {
                                                                    ...createAccountSettings().creativeOverrides,
                                                                    ...(existing.creativeOverrides || {}),
                                                                },
                                                            };
                                                        });

                                                        return {
                                                            ...item,
                                                            accountSettings: nextSettings,
                                                        };
                                                    };

                                                    const updatedAds = currentAds.map((item) => {
                                                        const isSelectedAd =
                                                            String(item?.id) === String(adId);

                                                        if (overridesEnabled && !isSelectedAd) {
                                                            return item;
                                                        }

                                                        return clearAccountSettings(item);
                                                    });

                                                    form.setFieldValue(adsPath, updatedAds);

                                                    const updatedCurrentAd =
                                                        updatedAds.find(
                                                            (item) => String(item?.id) === String(adId)
                                                        );

                                                    if (updatedCurrentAd) {
                                                        form.setFieldValue(path, updatedCurrentAd);
                                                        form.setFieldValue(
                                                            [...path, "accountSettings"],
                                                            updatedCurrentAd.accountSettings
                                                        );
                                                    }

                                                    form.setFields(
                                                        accountOptions.flatMap(({ value }) => [
                                                            {
                                                                name: [
                                                                    ...path,
                                                                    "accountSettings",
                                                                    String(value),
                                                                    "websiteUrl",
                                                                ],
                                                                errors: [],
                                                            },
                                                            {
                                                                name: [
                                                                    ...path,
                                                                    "accountSettings",
                                                                    String(value),
                                                                    "displayLink",
                                                                ],
                                                                errors: [],
                                                            },
                                                        ])
                                                    );
                                                }}
                                            >
                                                Clear All
                                            </Button>
                                        </>
                                    )}
                                </Space>
                            }
                            preserve
                            rules={[
                                validateAllAccounts("websiteUrl", "Website URL"),
                            ]}
                            getValueFromEvent={(event) => {
                                const value = event?.target?.value ?? "";
                                setAccountSetting(accountKey, "websiteUrl", value);
                                return value;
                            }}
                        >
                            <Input.TextArea
                                disabled={disabled}
                                placeholder="https://example.com"
                                autoSize={{ minRows: 2, maxRows: 5 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name={[
                                adIndex,
                                "accountSettings",
                                accountKey,
                                "displayLink",
                            ]}
                            required
                            label="Display link"
                            preserve
                            rules={[
                                validateAllAccounts("displayLink", "Display link"),
                            ]}
                            getValueFromEvent={(event) => {
                                const value = event?.target?.value ?? "";
                                setAccountSetting(accountKey, "displayLink", value);
                                return value;
                            }}
                        >
                            <Input
                                disabled={disabled}
                                placeholder="example.com"
                            />
                        </Form.Item>
                    </>
                )}

                <style jsx>{`
                        .ad-creative-fields {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                            width: 100%;
                            min-width: 0;
                        }

                        .ad-creative-fields :global(.ant-form-item) {
                            margin-bottom: 4px !important;
                        }

                        .ad-creative-fields :global(.ant-form-item-label) {
                            padding-bottom: 2px !important;
                        }

                        .ad-creative-fields :global(.ant-form-item-control) {
                            min-width: 0;
                        }

                        .dynamic-creative-text-field {
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                            margin-bottom: 14px;
                            min-width: 0;
                        }

                        .dynamic-creative-label {
                            color: var(--ant-color-text-secondary);
                            font-size: 14px;
                            margin-bottom: 2px;
                        }

                        .dynamic-creative-label .required-star {
                            color: #ff4d4f;
                        }

                        .dynamic-creative-option {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            min-width: 0;
                        }

                        .dynamic-creative-option > :global(.ant-input),
                        .dynamic-creative-option > :global(.ant-input-affix-wrapper) {
                            flex: 1;
                            min-width: 0;
                        }
                    `}</style>
            </div>
        );
    };

    const renderTextEditingMode = () => (
        <Card size="small" styles={{ body: { padding: "8px 12px" } }}>
            <Row align="middle" justify="space-between" gutter={[8, 8]}>
                <Col>
                    <Space size={8} wrap>
                        <Text strong>Ad text editing</Text>
                        <Tag color={overridesEnabled ? "blue" : "green"}>
                            {overridesEnabled ? "Individual ad" : "All ads"}
                        </Tag>
                    </Space>
                </Col>

                <Col>
                    <Space size={8} wrap>
                        <Button
                            size="small"
                            type={!overridesEnabled ? "primary" : "default"}
                            disabled={disabled || !overridesEnabled}
                            onClick={() => toggleOverrides(false)}
                        >
                            Edit all ads
                        </Button>

                        <Button
                            size="small"
                            type={overridesEnabled ? "primary" : "default"}
                            disabled={disabled || overridesEnabled}
                            onClick={() => toggleOverrides(true)}
                        >
                            Edit individual ad
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Text type="secondary" style={{ fontSize: 12 }}>
                {overridesEnabled
                    ? "Primary text, headline and description are editable independently for this ad."
                    : "Primary text, headline and description are shared with other ads using shared text."}
            </Text>
        </Card>
    );

    const onReturnUrl = (url) => {
        if (!url || !accountKey || !adsetId) return;

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            messageApi.error("Please generate a valid website URL.");
            return;
        }

        const displayLink = [
            "FB_Mnet",
            "FB_DomainActive",
            "FB_MnetBing",
            "FB_Media",
        ].includes(network)
            ? parsedUrl.hostname
            : parsedUrl.origin;

        setAccountSetting(accountKey, "websiteUrl", url);
        setAccountSetting(accountKey, "displayLink", displayLink);

        const currentAdsets = form.getFieldValue("adsets") || [];

        const updatedAdsets = currentAdsets.map((item) => {
            if (String(item?.AdsetId ?? item?.id) !== String(adsetId)) {
                return item;
            }

            const existing = item?.[accountKey] || {};

            return {
                ...item,
                [accountKey]: {
                    ...existing,
                    Website_URL: url,
                    Caption: displayLink,
                    websiteUrl: url,
                    displayLink,
                },
            };
        });

        form.setFieldValue("adsets", updatedAdsets);
        setDefaultURLBuilder(url);
        setIsModalVisibleForURLBuilder(false);
    };

    const getUrlBuilder = () => {
        switch (network) {
            case "FB_Affinity":
                return (
                    <AffinityUrlBuilder
                        indexValueForAccount={indexValueForAccount}
                        defaultValues={defaultURLBuilder}
                        accountis={selectedAccounts}
                        onReturnMessage={onReturnUrl}
                        primaryText={primaryText}
                        headline={headline}
                        description={description}
                        campaign_name={campaign_name}
                    />
                );

            case "FB_Media":
                return (
                    <MediaUrlBuilder
                        indexValueForAccount={indexValueForAccount}
                        defaultValues={defaultURLBuilder}
                        accountis={selectedAccounts}
                        onReturnMessage={onReturnUrl}
                        theme={theme}
                    />
                );

            case "FB_Mnet":
                return (
                    <MnetUrlBuilder
                        indexValueForAccount={indexValueForAccount}
                        defaultValues={defaultURLBuilder}
                        accountis={selectedAccounts}
                        onReturnMessage={onReturnUrl}
                        theme={theme}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div
            className="ad-level-workspace"
            style={{
                width: "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {contextHolder}
            {showCreativeStrip && renderCreativeStrip()}

            <Card
                size="small"
                title={
                    <Space wrap>
                        <Title level={5} style={{ margin: 0 }}>
                            {adName || `Ad ${Number(adIndex ?? field?.name ?? 0) + 1}`}
                        </Title>

                        {hasMedia && (
                            <Tag color={isVideo(firstMedia) ? "purple" : "blue"}>
                                {isVideo(firstMedia) ? "Video" : "Image"}
                            </Tag>
                        )}
                    </Space>
                }
                styles={{ body: { padding: 12 } }}
            >
                <Row gutter={[12, 12]} align="top">
                    <Col
                        xs={24}
                        md={previewVisible ? 15 : 24}
                        style={{ minWidth: 0 }}
                    >
                        <Space
                            orientation="vertical"
                            size={8}
                            style={{ width: "100%" }}
                        >
                            <Card
                                size="small"
                                title="Media"
                                extra={
                                    <Space size={6} wrap>
                                        <Upload
                                            accept="image/*,video/*"
                                            multiple={false}
                                            maxCount={1}
                                            disabled={disabled}
                                            beforeUpload={(file) => {
                                                if (!isSupportedMedia(file)) {
                                                    messageApi.warning(
                                                        "Upload an image or video."
                                                    );
                                                    return Upload.LIST_IGNORE;
                                                }
                                                return false;
                                            }}
                                            showUploadList={false}
                                            onChange={handleReplaceAdMedia}
                                        >
                                            <Button
                                                size="small"
                                                icon={<UploadOutlined />}
                                                disabled={disabled}
                                            >
                                                Update image/video
                                            </Button>
                                        </Upload>

                                        <Button
                                            size="small"
                                            icon={<PictureOutlined />}
                                            disabled={disabled}
                                            onClick={() => {
                                                setReplaceCreativeTargetId(adId);
                                                setCreativesDrawerOpen(true);
                                            }}
                                        >
                                            Replace from Creatives
                                        </Button>
                                    </Space>
                                }
                                styles={{ body: { padding: 8 } }}
                            >
                                {getMediaItems(ad?.media).length || hasMedia ? (
                                    <Space
                                        orientation="vertical"
                                        size={8}
                                        style={{ width: "100%" }}
                                    >
                                        {(getMediaItems(ad?.media).length
                                            ? getMediaItems(ad.media)
                                            : [firstMedia]
                                        ).filter(Boolean).map((media, mediaIndex) => {
                                            const url = getMediaPreviewUrl(media);
                                            const name = getFileName(media) ||
                                                `Selected creative ${mediaIndex + 1}`;

                                            return (
                                                <Row
                                                    key={`${media?.uid || url || name}-${mediaIndex}`}
                                                    align="middle"
                                                    gutter={10}
                                                    wrap={false}
                                                >
                                                    <Col flex="56px">
                                                        <div style={{
                                                            width: 56,
                                                            height: 56,
                                                            borderRadius: 6,
                                                            overflow: "hidden",
                                                            display: "grid",
                                                            placeItems: "center",
                                                            background: "var(--ant-color-bg-layout)",
                                                        }}>
                                                            {url ? (
                                                                isVideo(media) ? (
                                                                    <video
                                                                        src={url}
                                                                        muted
                                                                        preload="metadata"
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={url}
                                                                        alt={name}
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                )
                                                            ) : (
                                                                <PictureOutlined />
                                                            )}
                                                        </div>
                                                    </Col>

                                                    <Col flex="auto" style={{ minWidth: 0 }}>
                                                        <Text strong ellipsis style={{ display: "block" }}>
                                                            {name}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            {isVideo(media) ? "Video" : "Image"}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </Space>
                                ) : (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        No media selected. Use Add images / videos in the Creatives card title.
                                    </Text>
                                )}
                            </Card>

                            {mediaError && !hasMedia && (
                                <div style={{
                                    color: "#ff4d4f",
                                    fontSize: 14,
                                    marginTop: 4,
                                }}>
                                    Please select an image or video.
                                </div>
                            )}

                            {renderTextEditingMode()}
                            {renderCreativeFields()}
                        </Space>
                    </Col>

                    {previewVisible && (
                        <Col xs={24} md={9} style={{ minWidth: 0 }}>
                            <div className="ad-level-preview-sticky">
                                {renderPreview()}
                            </div>
                        </Col>
                    )}
                </Row>
            </Card>

            <Drawer
                title="Select Creatives"
                size="min(95vw, 1400px)"
                open={creativesDrawerOpen}
                onClose={() => {
                    setCreativesDrawerOpen(false);
                    setReplaceCreativeTargetId(null);
                }}
                destroyOnClose={false}
                styles={{ body: { padding: 12 } }}
            >
                <CreativesPage
                    userData={userData}
                    username={username}
                    theme={theme}
                    auth={auth}
                    route="campaigns"
                    onSubmitSelectedImages={handleCreativesSelected}
                />
            </Drawer>

            <style jsx>
                {`
                        .ad-level-preview-sticky {
                            position: sticky;
                            top: 16px;
                        }

                        @media (max-width: 767px) {
                            .ad-level-preview-sticky {
                                position: static;
                            }
                        }

                        .ad-creative-strip {
                            min-width: 0;
                        }

                        .ad-level-workspace :global(img),
                        .ad-level-workspace :global(video) {
                            max-width: 100%;
                        }
                    `}
            </style>

            <Modal
                title="URL Builder"
                open={isModalVisibleForURLBuilder}
                onCancel={() => setIsModalVisibleForURLBuilder(false)}
                footer={null}
                width="80%"
                styles={{
                    body: {
                        height: network === "FB_Affinity" ? "60vh" : "50vh",
                        overflowY: "auto",
                    },
                }}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
            >
                {getUrlBuilder()}
            </Modal>
        </div>
    );
};

export default AdLevel;