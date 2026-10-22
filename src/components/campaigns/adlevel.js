"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Avatar, Button, Card, Checkbox, Col, Divider, Empty, Form, Input,
    message, Row, Select, Space, Switch, Tag, Tooltip, Typography, Upload, Drawer,
} from "antd";
import {
    CheckCircleOutlined, CopyOutlined, DeleteOutlined, LikeOutlined,
    MessageOutlined, PictureOutlined, ShareAltOutlined, UploadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { getAccountKey } from "./accountadsettings";
import CreativesPage from "@/modules/creatives/page";

const { Text, Title } = Typography;
const { TextArea } = Input;

const createId = () =>
    globalThis.crypto?.randomUUID?.() ||
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
    return item.url || item.src || item.uri || item.imageUrl ||
        item.image_url || item.videoUrl || item.video_url ||
        item.assetUrl || item.asset_url || item.secure_url ||
        item.source_url || item.fileUrl || item.file_url ||
        item.downloadUrl || item.download_url || item.permalink_url || "";
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

    const declaredType = String(
        creative.type || creative.mediaType || creative.media_type ||
        creative.mimeType || creative.mime_type || nested?.type ||
        nested?.mimeType || nested?.mime_type || ""
    ).toLowerCase();

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
    pageId: undefined,
    instagramAccountId: undefined,
    displayLink: "",
    caption: "",
    creativeOverrides: { primaryText: "", headline: "", description: "" },
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

export const createInitialAd = (selectedAccounts = []) => ({
    id: createId(),
    AdName: "",
    AddName: "",
    adSetup: "CREATE_AD",
    format: "SINGLE_IMAGE_VIDEO",
    primaryText: "",
    headline: "",
    description: "",
    message: "",
    Description: "",
    textOverridesEnabled: false,
    callToAction: "LEARN_MORE",
    destinationType: "WEBSITE",
    websiteUrl: "",
    Website_URL: "",
    displayLink: "",
    Caption: "",
    urlParameters: "",
    existingPostId: "",
    page_id: undefined,
    Beneficiary: "",
    Payer: "",
    media: emptyMedia(),
    filename: null,
    mediaUrl: "",
    mediaName: "",
    mediaType: "",
    creativeId: undefined,
    creativeAssetId: undefined,
    mediaSource: "",
    sourceCreative: undefined,
    carouselCards: [],
    accountSettings: Object.fromEntries(
        selectedAccounts
            .map((account) => {
                const key = getAccountKey(account);
                return key ? [String(key), createAccountSettings()] : null;
            })
            .filter(Boolean)
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
    username
}) => {
    const processedUids = useRef(new Set());
    const replacementUids = useRef(new Set());

    const [localPreview, setLocalPreview] = useState("");
    const [previewVisible, setPreviewVisible] = useState(true);
    const [creativesDrawerOpen, setCreativesDrawerOpen] = useState(false);
    const [selectedCreatives, setSelectedCreatives] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    const path = useMemo(
        () => adPath || ["adsets", adsetIndex, "ads", adIndex],
        [adPath, adsetIndex, adIndex]
    );

    const adsetPath = useMemo(() => ["adsets", adsetIndex], [adsetIndex]);
    const adsPath = useMemo(() => [...adsetPath, "ads"], [adsetPath]);
    const activeIdPath = useMemo(
        () => [...adsetPath, "activeAdId"],
        [adsetPath]
    );

    const watchedAd = Form.useWatch(path, form, { preserve: true });
    const watchedAds = Form.useWatch(adsPath, form, { preserve: true });
    const watchedSharedText = Form.useWatch(
        [...adsetPath, "sharedAdText"],
        form,
        { preserve: true }
    );
    const watchedActiveAdId = Form.useWatch(
        activeIdPath,
        form,
        { preserve: true }
    );

    const ad = watchedAd || form.getFieldValue(path) || {};
    const formAds = Array.isArray(watchedAds)
        ? watchedAds
        : form.getFieldValue(adsPath) || [];

    const ads = formAds.length ? formAds : ad?.id ? [ad] : [];

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

    const primaryText = overridesEnabled
        ? getPrimaryText(ad)
        : sharedText.primaryText ?? getPrimaryText(ad);

    const headline = overridesEnabled
        ? ad.headline || ""
        : sharedText.headline ?? ad.headline ?? "";

    const description = overridesEnabled
        ? getDescription(ad)
        : sharedText.description ?? getDescription(ad);

    const accountSettings = { ...(ad.accountSettings || {}) };

    selectedAccounts.forEach((account) => {
        const key = getAccountKey(account);
        if (!key) return;

        const normalizedKey = String(key);

        accountSettings[normalizedKey] = {
            ...createAccountSettings(),
            ...(accountSettings[normalizedKey] || {}),
            creativeOverrides: {
                ...createAccountSettings().creativeOverrides,
                ...(accountSettings[normalizedKey]?.creativeOverrides || {}),
            },
        };
    });

    const firstAccountKey = String(
        Object.keys(accountSettings)[0] ||
        getAccountKey(selectedAccounts[0]) ||
        ""
    );

    const [previewAccountKey, setPreviewAccountKey] =
        useState(firstAccountKey);

    useEffect(() => {
        if (!previewAccountKey || !accountSettings[previewAccountKey]) {
            setPreviewAccountKey(firstAccountKey);
        }
    }, [firstAccountKey, previewAccountKey, ad.accountSettings]);

    const accountKey = previewAccountKey || firstAccountKey;
    const accountSetting = accountSettings[accountKey] || {};

    const pageId = accountSetting.pageId ??
        accountSetting.page_id ?? ad.page_id;

    const pageName = getPageName(pageId, pagesByAccount) ||
        getAccountName(
            selectedAccounts.find(
                (account) => String(getAccountKey(account)) === String(accountKey)
            ),
            accountKey
        ) || "Your Page";

    const previewLink = accountSetting.displayLink ||
        accountSetting.caption || getDisplayLink(ad) || getWebsiteUrl(ad);

    useEffect(() => {
        if (isFirstAd && !watchedActiveAdId && firstExistingAdId) {
            form.setFieldValue(activeIdPath, firstExistingAdId);
        }
    }, [
        isFirstAd,
        watchedActiveAdId,
        firstExistingAdId,
        activeIdPath,
        form,
    ]);

    useEffect(() => {
        const source = firstMedia?.originFileObj || firstMedia;

        if (
            !source ||
            getMediaUrl(firstMedia) ||
            typeof File === "undefined" ||
            !(source instanceof File)
        ) {
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

    const previewUrl = getMediaPreviewUrl(firstMedia) || localPreview;

    const setAdField = (name, value) => {
        form.setFieldValue([...path, name], value);
    };

    const updateName = (value) => {
        setAdField("AdName", value);
        setAdField("AddName", value);
    };

    const updateSharedText = (name, value) => {
        const currentShared =
            form.getFieldValue([...adsetPath, "sharedAdText"]) || {};

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

    const setAccountSetting = (key, settingName, value) => {
        const normalizedKey = String(key);
        const current = form.getFieldValue([...path, "accountSettings"]) || {};
        const existing = current[normalizedKey] || {};

        const nextSettings = {
            ...current,
            [normalizedKey]: {
                ...createAccountSettings(),
                ...existing,
                creativeOverrides: {
                    ...createAccountSettings().creativeOverrides,
                    ...(existing.creativeOverrides || {}),
                },
                [settingName]: value,
            },
        };

        form.setFieldValue([...path, "accountSettings"], nextSettings);

        const currentAds = form.getFieldValue(adsPath) || [];

        form.setFieldValue(
            adsPath,
            currentAds.map((item) =>
                String(item?.id) === String(adId)
                    ? { ...item, accountSettings: nextSettings }
                    : item
            )
        );

        if (settingName === "pageId" && selectedAccounts.length === 1) {
            setAdField("page_id", value);
        }
    };

    const useLibraryCreative = (creative) => {
        const normalized = normalizeRemoteCreative(creative);

        if (!normalized?.url) {
            messageApi.warning("This creative does not contain a usable media URL.");
            return;
        }

        const currentAds = [...(form.getFieldValue(adsPath) || [])];
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
            ...(!getAdName(target)
                ? {
                    AdName: normalized.name.replace(/\.[^.]+$/, ""),
                    AddName: normalized.name.replace(/\.[^.]+$/, ""),
                }
                : {}),
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

    const handleCreativesSelected = (files = []) => {
        const mapped = (Array.isArray(files) ? files : [])
            .map((file, index) => normalizeRemoteCreative({
                ...file,
                uid: file?.uid || `creative-${Date.now()}-${index}`,
                name: file?.name || file?.filename || file?.fileName,
                url: getRemoteUrl(file),
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
                aliases.forEach((alias) => { updated[alias] = value; });
                return updated;
            })
        );

        const currentShared =
            form.getFieldValue([...adsetPath, "sharedAdText"]) || {};

        form.setFieldValue([...adsetPath, "sharedAdText"], {
            ...currentShared,
            [name]: value,
        });
    };

    const handleUploadChange = ({ fileList = [] }) => {
        const incoming = fileList.filter(
            (file) => file?.uid &&
                !processedUids.current.has(file.uid) &&
                isSupportedMedia(file)
        );

        if (!incoming.length) return;
        incoming.forEach((file) => processedUids.current.add(file.uid));

        const currentAds = [...(form.getFieldValue(adsPath) || [])];
        const selectedId = form.getFieldValue(activeIdPath) || adId;

        let activeIndex = currentAds.findIndex(
            (item) => String(item?.id) === String(selectedId)
        );

        if (activeIndex < 0) {
            const initialAd = {
                ...(form.getFieldValue(path) || ad || createInitialAd(selectedAccounts)),
                id: adId || createId(),
            };
            currentAds.push(initialAd);
            activeIndex = currentAds.length - 1;
        }

        let activeAd = currentAds[activeIndex];
        const remainingFiles = [...incoming];

        if (!getMediaItems(activeAd?.media).length &&
            !activeAd?.filename && !activeAd?.mediaUrl) {
            const firstFile = remainingFiles.shift();

            if (firstFile) {
                const name = getFileName(firstFile).replace(/\.[^.]+$/, "");

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
                    ...(!getAdName(activeAd) && name
                        ? { AdName: name, AddName: name }
                        : {}),
                };

                currentAds[activeIndex] = activeAd;
            }
        }

        const newAds = remainingFiles.map((file) => {
            const name = getFileName(file).replace(/\.[^.]+$/, "");

            return {
                ...activeAd,
                id: createId(),
                AdName: name || getAdName(activeAd),
                AddName: name || activeAd?.AddName || "",
                media: mediaForFile(file),
                filename: file,
                mediaUrl: undefined,
                mediaName: undefined,
                creativeId: undefined,
                creativeAssetId: undefined,
                mediaSource: "upload",
                sourceCreative: undefined,
                accountSettings: cloneSettings(activeAd?.accountSettings),
                carouselCards: [],
            };
        });

        const nextAds = [...currentAds, ...newAds];
        form.setFieldValue(adsPath, nextAds);
        form.setFieldValue(activeIdPath, newAds[0]?.id || activeAd.id);

        if (String(activeAd.id) === String(adId || "")) {
            form.setFieldValue(path, activeAd);
        }
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
                ? sourceAd.carouselCards.map((card) => ({ ...card, id: createId() }))
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

    const pageFields = selectedAccounts.map((account) => {
        const key = String(getAccountKey(account) || "");
        if (!key) return null;

        const pages = pagesByAccount[key] || [];
        const setting = accountSettings[key] || {};
        const pageOptions = getPageOptions(pages);

        const instagramOptions = (
            Array.isArray(instagramAccountsByAccount[key])
                ? instagramAccountsByAccount[key]
                : []
        )
            .map((item) => {
                if (typeof item === "string" || typeof item === "number") {
                    return { value: String(item), label: String(item) };
                }

                const value = item?.id ?? item?.instagramAccountId ??
                    item?.instagram_account_id ?? item?.value;

                return value == null ? null : {
                    value: String(value),
                    label: item?.name || item?.username || String(value),
                };
            })
            .filter(Boolean);

        return (
            <Col xs={24} key={key}>
                <Card size="small" title={getAccountName(account, key)}
                    styles={{ body: { padding: 12 } }}>
                    <Form.Item label="Facebook Page" required
                        style={{ marginBottom: 12 }}>
                        <Select
                            value={setting.pageId == null ? undefined : String(setting.pageId)}
                            disabled={disabled}
                            showSearch
                            allowClear
                            optionFilterProp="label"
                            placeholder="Select Page"
                            options={pageOptions}
                            onChange={(value) => setAccountSetting(key, "pageId", value)}
                        />
                    </Form.Item>

                    {instagramOptions.length > 0 && (
                        <Form.Item label="Instagram account" style={{ marginBottom: 12 }}>
                            <Select
                                value={setting.instagramAccountId}
                                disabled={disabled}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                placeholder="Select Instagram account"
                                options={instagramOptions}
                                onChange={(value) =>
                                    setAccountSetting(key, "instagramAccountId", value)
                                }
                            />
                        </Form.Item>
                    )}

                    <Form.Item label="Display link" style={{ marginBottom: 12 }}>
                        <Input
                            value={setting.displayLink || ""}
                            disabled={disabled}
                            placeholder="example.com"
                            onChange={(event) =>
                                setAccountSetting(key, "displayLink", event.target.value)
                            }
                        />
                    </Form.Item>

                    <Form.Item label="Caption" style={{ marginBottom: 0 }}>
                        <Input
                            value={setting.caption || ""}
                            disabled={disabled}
                            placeholder="Optional account-specific caption"
                            onChange={(event) =>
                                setAccountSetting(key, "caption", event.target.value)
                            }
                        />
                    </Form.Item>
                </Card>
            </Col>
        );
    });

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

        const creativeCards = currentAds.flatMap((item, index) => {
            const mediaItems = getMediaItems(item?.media);
            const legacyFiles = Array.isArray(item?.filename)
                ? item.filename
                : item?.filename ? [item.filename] : [];

            const allMedia = [];
            const seenMedia = new Set();

            [...mediaItems, ...legacyFiles].forEach((media) => {
                if (!media) return;

                const identity = media?.uid
                    ? `uid:${media.uid}`
                    : getFileName(media)
                        ? `name:${getFileName(media)}`
                        : media;

                if (seenMedia.has(identity)) return;
                seenMedia.add(identity);
                allMedia.push(media);
            });

            if (!allMedia.length) {
                return [{ ad: item, media: null, adIndex: index, mediaIndex: 0 }];
            }

            return allMedia.map((media, mediaIndex) => ({
                ad: item,
                media,
                adIndex: index,
                mediaIndex,
            }));
        });

        return (
            <Card
                size="small"
                title={
                    <Space size={8} wrap>
                        <PictureOutlined />
                        <span>Creatives</span>
                        <Tag>{currentAds.length} ads</Tag>
                        <Tag>{creativeCards.filter(({ media }) => media).length} files</Tag>
                    </Space>
                }
                extra={
                    <Space wrap size={8}>
                        {renderUpload()}
                        <Button
                            icon={<PictureOutlined />}
                            disabled={disabled}
                            onClick={() => setCreativesDrawerOpen(true)}
                        >
                            Choose from Creatives
                        </Button>
                    </Space>
                }
                styles={{ body: { padding: 12 } }}
            >
                <style>
                    {`
                        .ad-creative-grid {
                            display: grid;
                            grid-template-columns: repeat(3, minmax(0, 1fr));
                            gap: 12px;
                            width: 100%;
                            min-width: 0;
                        }
                        .ad-creative-grid-item {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            min-width: 0;
                            width: 100%;
                            box-sizing: border-box;
                            padding: 10px;
                            border: 1px solid var(--ant-color-border);
                            border-radius: 10px;
                            background: var(--ant-color-bg-container);
                            cursor: pointer;
                            transition: border-color 0.2s, background 0.2s;
                        }
                        .ad-creative-grid-item:hover {
                            border-color: var(--ant-color-primary);
                        }
                        .ad-creative-grid-item.selected {
                            border-color: var(--ant-color-primary);
                            background: var(--ant-color-primary-bg);
                        }
                        .ad-creative-thumbnail {
                            position: relative;
                            flex: 0 0 40px;
                            width: 40px;
                            height: 40px;
                            overflow: hidden;
                            display: grid;
                            place-items: center;
                            border-radius: 6px;
                            background: var(--ant-color-bg-layout);
                        }
                        .ad-creative-thumbnail img,
                        .ad-creative-thumbnail video {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                        .ad-creative-info {
                            flex: 1;
                            min-width: 0;
                        }
                        .ad-creative-actions {
                            display: flex;
                            align-items: center;
                            flex-shrink: 0;
                            gap: 2px;
                        }
                        @media (max-width: 1199px) {
                            .ad-creative-grid {
                                grid-template-columns: repeat(2, minmax(0, 1fr));
                            }
                        }
                        @media (max-width: 767px) {
                            .ad-creative-grid {
                                grid-template-columns: minmax(0, 1fr);
                            }
                        }
                    `}
                </style>

                {!creativeCards.length ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Upload images or videos to create ads"
                    />
                ) : (
                    <div className="ad-creative-grid">
                        {creativeCards.map(({ ad: item, media, adIndex, mediaIndex }, index) => {
                            const url = getMediaPreviewUrl(media);
                            const selected = String(item?.id || "") === String(activeAdId || "");
                            const name = getFileName(media) || getAdName(item) || `Ad ${adIndex + 1}`;

                            return (
                                <div
                                    key={`${item?.id || `ad-${adIndex}`}-${media?.uid || `media-${mediaIndex}`}-${index}`}
                                    className={`ad-creative-grid-item ${selected ? "selected" : ""}`}
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
                                    <div className="ad-creative-thumbnail">
                                        {url ? (
                                            isVideo(media)
                                                ? <video src={url} muted playsInline preload="metadata" />
                                                : <img src={url} alt={name} style={{ objectFit: "contain" }} />
                                        ) : <PictureOutlined style={{ fontSize: 22 }} />}
                                    </div>

                                    <div className="ad-creative-info">
                                        <Text strong ellipsis style={{ display: "block", width: "100%", fontSize: 13 }}>
                                            {name}
                                        </Text>
                                    </div>

                                    <div className="ad-creative-actions">
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
                                        <Tooltip title="Delete corresponding ad">
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
                )}

                {creativeLibrary.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <Divider orientation="left" plain>Creatives from library</Divider>
                        <div className="ad-creative-grid">
                            {creativeLibrary.map((creative) => (
                                <div
                                    className="ad-creative-grid-item"
                                    key={`${creative.creativeId || creative.uid}-${creative.url}`}
                                    style={{ cursor: "default" }}
                                >
                                    <div className="ad-creative-thumbnail">
                                        {isVideo(creative)
                                            ? <video src={creative.url} muted playsInline preload="metadata" />
                                            : <img src={creative.url} alt={creative.name}
                                                style={{ objectFit: "contain" }} />}
                                    </div>

                                    <div className="ad-creative-info">
                                        <Text strong ellipsis style={{ display: "block", fontSize: 13 }}>
                                            {creative.name}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            {isVideo(creative) ? "Video" : "Image"}
                                        </Text>
                                    </div>

                                    <Button
                                        size="small"
                                        type="primary"
                                        disabled={disabled}
                                        onClick={() => useLibraryCreative(creative)}
                                    >
                                        Use
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        );
    };

    const renderPreview = () => (
        <Card size="small" styles={{ body: { padding: previewVisible ? 0 : 8 } }}>
            {previewVisible && (
                <div style={{
                    width: "100%",
                    maxWidth: 420,
                    margin: "0 auto",
                    overflow: "hidden",
                    borderRadius: 8,
                    border: "1px solid var(--ant-color-border)",
                }}>
                    <div style={{ padding: 12 }}>
                        <Row align="middle" gutter={8} wrap={false}>
                            <Col><Avatar size={38} icon={<UserOutlined />} /></Col>
                            <Col flex="auto" style={{ minWidth: 0 }}>
                                <Text strong style={{ display: "block" }} ellipsis>{pageName}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>Sponsored</Text>
                            </Col>
                            <Col><Text type="secondary">•••</Text></Col>
                        </Row>
                        <div style={{
                            marginTop: 10,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                        }}>
                            {primaryText || "Your primary text will appear here."}
                        </div>
                    </div>

                    {previewUrl ? (
                        isVideo(firstMedia) ? (
                            <video
                                src={previewUrl}
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
                                src={previewUrl}
                                alt={mediaName || "Ad creative"}
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
                                <Text type="secondary">Upload an image or video</Text>
                            </Space>
                        </div>
                    )}

                    <div style={{ padding: 12, background: "var(--ant-color-bg-layout)" }}>
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
                                <Text strong style={{ display: "block", overflowWrap: "anywhere" }}>
                                    {headline || adName || "Your ad headline"}
                                </Text>
                                {description && (
                                    <Text type="secondary" style={{
                                        display: "block",
                                        overflowWrap: "anywhere",
                                        marginTop: 4,
                                    }}>
                                        {description}
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
            )}
        </Card>
    );

    const renderCreativeFields = () => (
        <div className="ad-creative-fields">
            <Form.Item label="Ad name" required>
                <Input
                    value={adName}
                    disabled={disabled}
                    placeholder="Enter ad name"
                    onChange={(event) => {
                        const value = event.target.value;
                        if (overridesEnabled) updateName(value);
                        else updateSharedField("AdName", value, ["AddName"]);
                    }}
                />
            </Form.Item>

            <Form.Item label="Primary text" required>
                <TextArea
                    value={primaryText}
                    disabled={disabled}
                    placeholder="Write primary text"
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    onChange={(event) => updateText("primaryText", event.target.value)}
                />
            </Form.Item>

            <Form.Item label="Headline" required>
                <Input
                    value={headline}
                    disabled={disabled}
                    placeholder="Enter headline"
                    onChange={(event) => updateText("headline", event.target.value)}
                />
            </Form.Item>

            <Form.Item label="Description">
                <TextArea
                    value={description}
                    disabled={disabled}
                    placeholder="Enter description"
                    autoSize={{ minRows: 2, maxRows: 3 }}
                    onChange={(event) => updateText("description", event.target.value)}
                />
            </Form.Item>

            <Form.Item label="Website URL">
                <Input
                    value={getWebsiteUrl(ad)}
                    disabled={disabled}
                    placeholder="https://example.com"
                    onChange={(event) => {
                        const value = event.target.value;
                        if (overridesEnabled) {
                            setAdField("websiteUrl", value);
                            setAdField("Website_URL", value);
                        } else {
                            updateSharedField("websiteUrl", value, ["Website_URL"]);
                        }
                    }}
                />
            </Form.Item>

            <Form.Item label="Display link">
                <Input
                    value={getDisplayLink(ad)}
                    disabled={disabled}
                    placeholder="example.com"
                    onChange={(event) => {
                        const value = event.target.value;
                        if (overridesEnabled) {
                            setAdField("displayLink", value);
                            setAdField("Caption", value);
                        } else {
                            updateSharedField("displayLink", value, ["Caption"]);
                        }
                    }}
                />
            </Form.Item>

            <style jsx>
                {`
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
                `}
            </style>
        </div>
    );

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

    if (!isActive && !isFirstAd) return null;

    return (
        <div className="ad-level-workspace" style={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
        }}>
            {contextHolder}
            {isFirstAd && renderCreativeStrip()}

            {isActive && (
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
                        <Col xs={24} md={previewVisible ? 15 : 24} style={{ minWidth: 0 }}>
                            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                                <Card
                                    size="small"
                                    title="Media"
                                    extra={
                                        <Upload
                                            accept="image/*,video/*"
                                            multiple={false}
                                            maxCount={1}
                                            disabled={disabled}
                                            beforeUpload={(file) => {
                                                if (!isSupportedMedia(file)) {
                                                    messageApi.warning("Upload an image or video.");
                                                    return Upload.LIST_IGNORE;
                                                }
                                                return false;
                                            }}
                                            showUploadList={false}
                                            onChange={handleReplaceAdMedia}
                                        >
                                            <Button size="small" icon={<UploadOutlined />} disabled={disabled}>
                                                Update image/video
                                            </Button>
                                        </Upload>
                                    }
                                    styles={{ body: { padding: 8 } }}
                                >
                                    {hasMedia ? (
                                        <Row align="middle" gutter={10} wrap={false}>
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
                                                    {previewUrl ? (
                                                        isVideo(firstMedia) ? (
                                                            <video src={previewUrl} muted preload="metadata"
                                                                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                                        ) : (
                                                            <img src={previewUrl} alt={mediaName || "Selected creative"}
                                                                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                                        )
                                                    ) : <PictureOutlined />}
                                                </div>
                                            </Col>
                                            <Col flex="auto" style={{ minWidth: 0 }}>
                                                <Text strong ellipsis style={{ display: "block" }}>
                                                    {mediaName || "Selected creative"}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {isVideo(firstMedia) ? "Video" : "Image"}
                                                </Text>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            No media selected. Use Add images / videos in the Creatives card title.
                                        </Text>
                                    )}
                                </Card>

                                {selectedAccounts.length > 0 && (
                                    <Card size="small" title="Account identity"
                                        styles={{ body: { padding: 12 } }}>
                                        <Row gutter={[12, 12]}>{pageFields}</Row>
                                    </Card>
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
            )}

            <Drawer
                title="Select Creatives"
                width="min(95vw, 1400px)"
                open={creativesDrawerOpen}
                onClose={() => setCreativesDrawerOpen(false)}
                destroyOnClose={false}
                styles={{ body: { padding: 12 } }}
            >
                {/* <ImageUploadPage
                    selectedFilesData={handleCreativesSelected}
                    fromCampaigns
                    network={network}
                    Account_Number={
                        Account_Number ??
                        getAccountKey(selectedAccounts[0]) ??
                        selectedAccounts[0]?.Account_Number ??
                        selectedAccounts[0]?.accountNumber
                    }
                /> */}
                <CreativesPage userData={userData} username={username} theme={theme} auth={auth}  />
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
        </div>
    );
};

export default AdLevel;