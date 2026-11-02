"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Input, InputNumber, Select, TreeSelect, DatePicker, Switch, Tooltip, Popover, Button, Row, Col } from "antd";
import { DownOutlined, RightOutlined, InfoCircleOutlined, ShareAltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AdLevel, { createInitialAd } from "./adlevel";

const { SHOW_CHILD } = TreeSelect;

const HiddenField = () => null;

const AdScheduleGrid = ({ selectedCells = {}, onCommit }) => {
    const gridRef = useRef(null);
    const dragRef = useRef(null);

    const paintCell = (day, hour, active, cells) => {
        cells[`${day}-${hour}`] = active;

        const grid = gridRef.current;
        const cell = grid?.querySelector(
            `[data-schedule-cell="cell"][data-day="${day}"][data-hour="${hour}"]`
        );

        if (cell) cell.classList.toggle("active", active);

        const everyDayCell = grid?.querySelector(
            `[data-schedule-cell="every"][data-hour="${hour}"]`
        );

        if (everyDayCell) {
            everyDayCell.classList.toggle(
                "active",
                [0, 1, 2, 3, 4, 5, 6].every(
                    dayIndex => cells[`${dayIndex}-${hour}`]
                )
            );
        }
    };

    const paintEveryDay = (hour, active, cells) => {
        const grid = gridRef.current;

        for (let day = 0; day < 7; day++) {
            cells[`${day}-${hour}`] = active;

            const cell = grid?.querySelector(
                `[data-schedule-cell="cell"][data-day="${day}"][data-hour="${hour}"]`
            );

            if (cell) cell.classList.toggle("active", active);
        }

        const everyDayCell = grid?.querySelector(
            `[data-schedule-cell="every"][data-hour="${hour}"]`
        );

        if (everyDayCell) everyDayCell.classList.toggle("active", active);
    };

    const finishDrag = () => {
        const drag = dragRef.current;
        if (!drag) return;

        dragRef.current = null;
        onCommit(drag.cells);
    };

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        grid.querySelectorAll("[data-schedule-cell]").forEach(cell => {
            const hour = Number(cell.dataset.hour);

            if (cell.dataset.scheduleCell === "every") {
                cell.classList.toggle(
                    "active",
                    [0, 1, 2, 3, 4, 5, 6].every(
                        day => selectedCells[`${day}-${hour}`]
                    )
                );
            } else {
                cell.classList.toggle(
                    "active",
                    Boolean(
                        selectedCells[`${cell.dataset.day}-${hour}`]
                    )
                );
            }
        });
    }, [selectedCells]);

    const handleMouseDown = event => {
        const cell = event.target.closest("[data-schedule-cell]");
        if (!cell || !gridRef.current?.contains(cell)) return;

        event.preventDefault();

        const cells = { ...selectedCells };
        const hour = Number(cell.dataset.hour);
        const isEveryDay = cell.dataset.scheduleCell === "every";

        let target;

        if (isEveryDay) {
            target = ![0, 1, 2, 3, 4, 5, 6].every(
                day => cells[`${day}-${hour}`]
            );
            paintEveryDay(hour, target, cells);
        } else {
            const day = Number(cell.dataset.day);
            target = !Boolean(cells[`${day}-${hour}`]);
            paintCell(day, hour, target, cells);
        }

        dragRef.current = { cells, isEveryDay, target };
    };

    const handleMouseOver = event => {
        const drag = dragRef.current;
        if (!drag) return;

        const cell = event.target.closest("[data-schedule-cell]");
        if (!cell || !gridRef.current?.contains(cell)) return;

        const hour = Number(cell.dataset.hour);

        if (drag.isEveryDay) {
            paintEveryDay(hour, drag.target, drag.cells);
        } else if (cell.dataset.scheduleCell === "cell") {
            paintCell(
                Number(cell.dataset.day),
                hour,
                drag.target,
                drag.cells
            );
        }
    };

    const dayNames = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    return (
        <div
            ref={gridRef}
            className="campaigns-adset-schedule-grid"
            onMouseDown={handleMouseDown}
            onMouseOver={handleMouseOver}
            onMouseUp={finishDrag}
            onMouseLeave={finishDrag}
        >
            <div className="campaigns-adset-schedule-row campaigns-adset-schedule-header">
                <div />
                {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="campaigns-adset-schedule-hour">
                        {hour}
                    </div>
                ))}
            </div>

            {dayNames.map((dayName, day) => (
                <div
                    key={dayName}
                    className="campaigns-adset-schedule-row"
                >
                    <div className="campaigns-adset-schedule-day">
                        {dayName}
                    </div>
                    {Array.from({ length: 24 }, (_, hour) => (
                        <div
                            key={hour}
                            className="campaigns-adset-schedule-cell"
                            data-schedule-cell="cell"
                            data-day={day}
                            data-hour={hour}
                        />
                    ))}
                </div>
            ))}

            <div className="campaigns-adset-schedule-row campaigns-adset-schedule-every-row">
                <div className="campaigns-adset-schedule-day">Every day</div>
                {Array.from({ length: 24 }, (_, hour) => (
                    <div
                        key={hour}
                        className="campaigns-adset-schedule-cell"
                        data-schedule-cell="every"
                        data-hour={hour}
                    />
                ))}
            </div>
        </div>
    );
};

const ageOptions = Array.from({ length: 48 }, (_, i) => ({
    value: String(i + 18),
    label: String(i + 18)
}));

const maxAgeOptions = [
    ...ageOptions.filter(item => item.value !== "65"),
    { value: "65", label: "65+" }
];

const below25Options = ageOptions.filter(
    item => Number(item.value) >= 18 && Number(item.value) <= 25
);

const above25Options = ageOptions.filter(
    item => Number(item.value) >= 26 && Number(item.value) <= 65
);


const normalizeList = value => {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === "") return [];
    return [value];
};

const normalizeCountryNode = node => {
    if (!node || typeof node !== "object") return null;

    const value = node.value ?? node.key ?? node.code;
    if (value === undefined || value === null) return null;

    const label = node.label ?? node.title ?? node.name ?? String(value);
    const children = Array.isArray(node.children)
        ? node.children
        : Array.isArray(node.countries)
            ? node.countries
            : [];

    return {
        ...node,
        key: node.key ?? value,
        value,
        label,
        title: node.title ?? label,
        children: children.map(normalizeCountryNode).filter(Boolean)
    };
};

const cloneValue = value => {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (dayjs.isDayjs(value)) return value.clone();

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                cloneValue(item)
            ])
        );
    }

    return value;
};

const AdSetLevel = ({
    form,
    index: fallbackIndex,
    adsetId: propAdsetId,
    mode = "create",
    theme,
    budgetType = "daily",
    page_id_list = [],
    pixel_id_list = [],
    pageidList = [],
    pixelIdList = [],
    localesdata = [],
    accountis = [],
    campaignCountries = [],
    continents = [],
    geo = "Geos",
    network,
    showBidAmount = false,
    minAgeToggle,
    setMinAgeToggle,
    selectedAccounts = [],
    pagesByAccount = {},
    instagramAccountsByAccount = {},
    adSchedulingToShow: externalAdSchedulingToShow,
    setAdSchedulingToShow: externalSetAdSchedulingToShow,
    selectedByAdset: externalSelectedByAdset,
    setSelectedByAdset: externalSetSelectedByAdset,
    setAdsetSchedule: externalSetAdsetSchedule,
    adSchedulingToShowCampaign = false,
    setScheduleErrorByAdset: externalSetScheduleErrorByAdset,
    scheduleErrorByAdset: externalScheduleErrorByAdset,
    setShowScheduleSubmitError: externalSetShowScheduleSubmitError,
    userData,
    auth,
    username,
    multipleGeo,
    multiplePixel = "Pixel",
    multiplePage,
    adsetConfig
}) => {
    const isCreate = mode === "create";

    const {
        EU_AND_ASSOCIATED = [],
        actionSourceOptions = {},
        optimizationGoalOptions = {},
        conversionEventOptions = {},
        billingEventOptions = {},
        specialOptimizationRules = {},
        platformPositions = {},
        platformOptions = [],
        allPositionOptions = [],
        genderOptions = [],
        deviceOptions = []
    } = adsetConfig || {};

    const getSelectedPositionObjects = selected => {
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

    const [localAdSchedulingToShow, setLocalAdSchedulingToShow] = useState({});
    const [localSelectedByAdset, setLocalSelectedByAdset] = useState({});
    const [localAdsetSchedule, setLocalAdsetSchedule] = useState({});
    const [localScheduleErrorByAdset, setLocalScheduleErrorByAdset] = useState({});
    const [localShowScheduleSubmitError, setLocalShowScheduleSubmitError] = useState(false);

    const adSchedulingToShow = externalAdSchedulingToShow ?? localAdSchedulingToShow;
    const setAdSchedulingToShow = externalSetAdSchedulingToShow ?? setLocalAdSchedulingToShow;
    const selectedByAdset = externalSelectedByAdset ?? localSelectedByAdset;
    const setSelectedByAdset = externalSetSelectedByAdset ?? setLocalSelectedByAdset;
    const setAdsetSchedule = externalSetAdsetSchedule ?? setLocalAdsetSchedule;
    const scheduleErrorByAdset = externalScheduleErrorByAdset ?? localScheduleErrorByAdset;
    const setScheduleErrorByAdset = externalSetScheduleErrorByAdset ?? setLocalScheduleErrorByAdset;
    const setShowScheduleSubmitError = externalSetShowScheduleSubmitError ?? setLocalShowScheduleSubmitError;

    const objectiveValue = Form.useWatch("Objectives", form) || "";
    const bidStrategyValue = Form.useWatch("Bid_strategy", form) || "";
    const specialCategories = Form.useWatch("Special_categories", form) || "";
    const campaignBudget = Number(Form.useWatch("Daily_amount", form) || 0);
    const adsetsValue = Form.useWatch("adsets", form);
    const adsets = Array.isArray(adsetsValue) ? adsetsValue : [];
    const matchedIndex =
        propAdsetId != null
            ? adsets.findIndex(
                adset => String(adset?.id) === String(propAdsetId)
            )
            : -1;

    // console.log(matchedIndex, "matchedIndex");

    // Ant Design Form.List requires numeric positions for array field paths.
    // Resolve the current position using the stable ID.
    const index =
        matchedIndex >= 0 ? matchedIndex : fallbackIndex;
    const currentAdset = adsets[index] || {};
    // const adsetScheduleId = currentAdset.id || index;
    const adsetScheduleId = currentAdset.id ?? propAdsetId;
    const watchedAccountList = Form.useWatch("Account_Number", form) || [];
    const watchedAds = Form.useWatch(["adsets", index, "ads"], form);
    const campaignName = Form.useWatch("Name", form) || "";
    const watchedAdsets = Form.useWatch("adsets", form) || [];
    const watchedAdsetName = Form.useWatch(["adsets", index, "AdsetName"], form) || "";
    const needsBeneficiaryAndPayer = value => {
        const countries = Array.isArray(value)
            ? value
            : typeof value === "string"
                ? value.split(/[,;]\s*|\s+/).filter(Boolean)
                : value && typeof value === "object"
                    ? Object.values(value).flat().map(String)
                    : [];

        return countries.some(country =>
            EU_AND_ASSOCIATED.includes(String(country))
        );
    };
    const firstAdsetCountries = Form.useWatch(["adsets", 0, "countries"], form);
    // console.log(pixel_id_list, pixelIdList, "pixel");
    // console.log(page_id_list, pageidList, "page");
    const watchedDynamicCreative = Form.useWatch(
        ["adsets", index, "isDynamicCreative"],
        form,
        { preserve: true }
    );

    const isDynamicCreative =
        watchedDynamicCreative === true ||
        watchedDynamicCreative === 1 ||
        String(watchedDynamicCreative).toLowerCase() === "true";

    const watchedCurrentAds =
        Form.useWatch(["adsets", index, "ads"], form, { preserve: true }) || [];
    const previousDynamicCreativeRef = useRef(isDynamicCreative);

    useEffect(() => {
        if (!form || index == null) return;

        // Do not reset anything on initial render.
        if (previousDynamicCreativeRef.current === isDynamicCreative) {
            return;
        }

        previousDynamicCreativeRef.current = isDynamicCreative;

        const adsPath = ["adsets", index, "ads"];
        const activeAdPath = ["adsets", index, "activeAdId"];
        const backupPath = ["adsets", index, "_dynamicCreativeAdsBackup"];

        const currentAds = form.getFieldValue(adsPath) || [];
        const firstAd = currentAds[0];

        if (!firstAd) return;

        const resetAd = {
            ...firstAd,
            media: {
                images: [],
                videos: [],
                thumbnail: null,
            },
            filename: null,
            mediaUrl: undefined,
            mediaName: undefined,
            mediaType: undefined,
            creativeId: undefined,
            creativeAssetId: undefined,
            sourceCreative: undefined,
            mediaSource: "",
        };

        // Keep exactly one ad card and clear its selected media.
        form.setFieldValue(adsPath, [resetAd]);
        form.setFieldValue(activeAdPath, resetAd.id);

        // Prevent old ads and media from being restored.
        form.setFieldValue(backupPath, undefined);
    }, [form, index, isDynamicCreative]);

    // useEffect(() => {
    //     if (!form || index == null || !Array.isArray(watchedCurrentAds)) return;

    //     const adsPath = ["adsets", index, "ads"];
    //     const backupPath = ["adsets", index, "_dynamicCreativeAdsBackup"];
    //     const activeAdPath = ["adsets", index, "activeAdId"];

    //     const createId = () =>
    //         globalThis.crypto?.randomUUID?.() ||
    //         `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    //     const getMediaKey = (media) =>
    //         String(
    //             media?.uid ||
    //             media?.creativeId ||
    //             media?.creativeAssetId ||
    //             media?.url ||
    //             media?.src ||
    //             media?.uri ||
    //             media?.name ||
    //             media?.filename ||
    //             ""
    //         );

    //     const getAdMediaItems = (ad) => {
    //         const items = [
    //             ...(Array.isArray(ad?.media?.images) ? ad.media.images : []),
    //             ...(Array.isArray(ad?.media?.videos) ? ad.media.videos : []),
    //         ];

    //         if (items.length) return deduplicateMedia(items);

    //         if (Array.isArray(ad?.filename)) {
    //             return deduplicateMedia(ad.filename);
    //         }

    //         if (ad?.filename && typeof ad.filename === "object") {
    //             return [ad.filename];
    //         }

    //         if (ad?.mediaUrl) {
    //             return [{
    //                 uid: ad.creativeId || ad.creativeAssetId || ad.id,
    //                 url: ad.mediaUrl,
    //                 name: ad.mediaName || ad.mediaUrl.split("/").pop(),
    //                 type: ad.mediaType,
    //                 mediaType: ad.mediaType,
    //                 isRemote: true,
    //                 creativeId: ad.creativeId,
    //                 creativeAssetId: ad.creativeAssetId,
    //                 sourceCreative: ad.sourceCreative,
    //             }];
    //         }

    //         return [];
    //     };

    //     const deduplicateMedia = (items = []) => {
    //         const seen = new Set();

    //         return items.filter((item) => {
    //             if (!item) return false;

    //             const key = getMediaKey(item);

    //             if (!key) return true;
    //             if (seen.has(key)) return false;

    //             seen.add(key);
    //             return true;
    //         });
    //     };

    //     const isVideoMedia = (item) => {
    //         const type = String(
    //             item?.type || item?.mediaType || item?.mimeType || ""
    //         ).toLowerCase();

    //         const source = String(
    //             item?.url || item?.src || item?.name || item?.filename || ""
    //         );

    //         return (
    //             type.includes("video") ||
    //             /\.(mp4|mov|webm|m4v|avi|mpeg|mpg)(?:$|\?)/i.test(source)
    //         );
    //     };

    //     const makeMediaObject = (items = [], previousMedia = {}) => ({
    //         images: items.filter((item) => !isVideoMedia(item)),
    //         videos: items.filter(isVideoMedia),
    //         thumbnail: previousMedia?.thumbnail ?? null,
    //     });

    //     const collectAllMedia = (ads = []) =>
    //         deduplicateMedia(ads.flatMap((ad) => getAdMediaItems(ad)));

    //     const cloneAd = (ad) => ({
    //         ...ad,
    //         media: ad?.media
    //             ? {
    //                 ...ad.media,
    //                 images: [...(ad.media.images || [])],
    //                 videos: [...(ad.media.videos || [])],
    //             }
    //             : ad?.media,
    //         filename: Array.isArray(ad?.filename)
    //             ? [...ad.filename]
    //             : ad?.filename,
    //         accountSettings: Object.fromEntries(
    //             Object.entries(ad?.accountSettings || {}).map(([key, value]) => [
    //                 key,
    //                 {
    //                     ...value,
    //                     creativeOverrides: {
    //                         ...(value?.creativeOverrides || {}),
    //                     },
    //                 },
    //             ])
    //         ),
    //     });

    //     const mergeTextOptions = (ads, field, fallback) => {
    //         const values = [];
    //         const seen = new Set();

    //         ads.forEach((ad) => {
    //             const raw =
    //                 ad?.[field] ??
    //                 (field === "primaryText" ? ad?.message : undefined) ??
    //                 (field === "description" ? ad?.Description : undefined);

    //             (Array.isArray(raw) ? raw : [raw]).forEach((value) => {
    //                 if (typeof value !== "string" || !value.trim()) return;

    //                 const key = value.trim();

    //                 if (seen.has(key) || values.length >= 5) return;

    //                 seen.add(key);
    //                 values.push(value);
    //             });
    //         });

    //         if (!values.length) {
    //             (Array.isArray(fallback) ? fallback : [fallback]).forEach((value) => {
    //                 if (
    //                     typeof value === "string" &&
    //                     value.trim() &&
    //                     values.length < 5
    //                 ) {
    //                     values.push(value);
    //                 }
    //             });
    //         }

    //         return values.length ? values : [""];
    //     };

    //     const toScalar = (value) =>
    //         Array.isArray(value)
    //             ? String(value.find((item) => String(item ?? "").trim()) ?? "")
    //             : String(value ?? "");

    //     const backupAds = form.getFieldValue(backupPath);

    //     // =========================================================
    //     // DYNAMIC CREATIVE ON
    //     // Preserve original ads before merging them.
    //     // =========================================================
    //     if (isDynamicCreative) {
    //         if (!watchedCurrentAds.length) return;

    //         // Do not overwrite the original backup with the merged ad.
    //         if (!Array.isArray(backupAds)) {
    //             form.setFieldValue(
    //                 backupPath,
    //                 watchedCurrentAds.map(cloneAd)
    //             );
    //         }

    //         // Already merged. Do not rewrite the ad or its media.
    //         if (watchedCurrentAds.length === 1) return;

    //         const originalAds = watchedCurrentAds;
    //         const firstAd = originalAds[0];

    //         const allMedia = collectAllMedia(originalAds);

    //         const mergedAd = {
    //             ...firstAd,
    //             primaryText: mergeTextOptions(
    //                 originalAds,
    //                 "primaryText",
    //                 firstAd?.primaryText ?? firstAd?.message
    //             ),
    //             message: mergeTextOptions(
    //                 originalAds,
    //                 "primaryText",
    //                 firstAd?.primaryText ?? firstAd?.message
    //             ),
    //             headline: mergeTextOptions(
    //                 originalAds,
    //                 "headline",
    //                 firstAd?.headline
    //             ),
    //             description: mergeTextOptions(
    //                 originalAds,
    //                 "description",
    //                 firstAd?.description ?? firstAd?.Description
    //             ),
    //             Description: mergeTextOptions(
    //                 originalAds,
    //                 "description",
    //                 firstAd?.description ?? firstAd?.Description
    //             ),
    //             media: makeMediaObject(allMedia, firstAd?.media),
    //             filename: allMedia,
    //             mediaUrl: undefined,
    //             mediaName: undefined,
    //             mediaType: undefined,
    //             creativeId: undefined,
    //             creativeAssetId: undefined,
    //             sourceCreative: undefined,
    //         };

    //         form.setFieldValue(adsPath, [mergedAd]);
    //         form.setFieldValue(activeAdPath, mergedAd.id);

    //         return;
    //     }

    //     // =========================================================
    //     // DYNAMIC CREATIVE OFF
    //     // Restore original ads and retain every selected media file.
    //     // =========================================================
    //     if (!watchedCurrentAds.length) return;

    //     const hasBackup =
    //         Array.isArray(backupAds) && backupAds.length > 0;

    //     const originalAds = hasBackup
    //         ? backupAds.map(cloneAd)
    //         : watchedCurrentAds.map(cloneAd);

    //     const currentMedia = collectAllMedia(watchedCurrentAds);
    //     const originalMedia = collectAllMedia(originalAds);

    //     // Merge the current selected media with the original media.
    //     // This prevents files added during Dynamic Creative from vanishing.
    //     const allMedia = deduplicateMedia([
    //         ...originalMedia,
    //         ...currentMedia,
    //     ]);

    //     const usedKeys = new Set();

    //     // First, preserve each original ad's own media.
    //     const restoredAds = originalAds.map((originalAd) => {
    //         const originalItems = getAdMediaItems(originalAd);

    //         const mediaItems = originalItems.map((originalItem) => {
    //             const key = getMediaKey(originalItem);

    //             const currentItem = currentMedia.find(
    //                 (item) => key && getMediaKey(item) === key
    //             );

    //             const selectedItem = currentItem || originalItem;

    //             if (key) usedKeys.add(key);

    //             return selectedItem;
    //         });

    //         return {
    //             ...originalAd,
    //             media: makeMediaObject(mediaItems, originalAd?.media),
    //             filename: mediaItems.length ? mediaItems : null,
    //         };
    //     });

    //     // Assign remaining media to ads without media first.
    //     // If there are more files than original ads, create additional ads.
    //     allMedia.forEach((media) => {
    //         const key = getMediaKey(media);

    //         if (key && usedKeys.has(key)) return;

    //         let targetIndex = restoredAds.findIndex(
    //             (ad) => getAdMediaItems(ad).length === 0
    //         );

    //         if (targetIndex === -1) {
    //             const sourceAd = restoredAds[0] || originalAds[0] || {};

    //             restoredAds.push({
    //                 ...cloneAd(sourceAd),
    //                 id: createId(),
    //                 media: makeMediaObject([media], sourceAd?.media),
    //                 filename: [media],
    //                 mediaUrl: undefined,
    //                 mediaName: undefined,
    //                 mediaType: undefined,
    //                 creativeId: undefined,
    //                 creativeAssetId: undefined,
    //                 sourceCreative: undefined,
    //                 primaryText: toScalar(
    //                     sourceAd?.primaryText ?? sourceAd?.message
    //                 ),
    //                 message: toScalar(
    //                     sourceAd?.primaryText ?? sourceAd?.message
    //                 ),
    //                 headline: toScalar(sourceAd?.headline),
    //                 description: toScalar(
    //                     sourceAd?.description ?? sourceAd?.Description
    //                 ),
    //                 Description: toScalar(
    //                     sourceAd?.description ?? sourceAd?.Description
    //                 ),
    //             });

    //             targetIndex = restoredAds.length - 1;
    //         } else {
    //             const targetAd = restoredAds[targetIndex];

    //             restoredAds[targetIndex] = {
    //                 ...targetAd,
    //                 media: makeMediaObject([media], targetAd?.media),
    //                 filename: [media],
    //                 mediaUrl: undefined,
    //                 mediaName: undefined,
    //                 mediaType: undefined,
    //                 creativeId: undefined,
    //                 creativeAssetId: undefined,
    //                 sourceCreative: undefined,
    //             };
    //         }

    //         if (key) usedKeys.add(key);
    //     });

    //     // Convert text option arrays back to scalar values after Dynamic Creative.
    //     const finalAds = restoredAds.map((ad) => ({
    //         ...ad,
    //         primaryText: toScalar(ad?.primaryText ?? ad?.message),
    //         message: toScalar(ad?.primaryText ?? ad?.message),
    //         headline: toScalar(ad?.headline),
    //         description: toScalar(ad?.description ?? ad?.Description),
    //         Description: toScalar(ad?.description ?? ad?.Description),
    //     }));

    //     // Avoid a redundant write only when ad IDs AND media identities match.
    //     const currentSignature = JSON.stringify(
    //         watchedCurrentAds.map((ad) => ({
    //             id: ad?.id,
    //             media: getAdMediaItems(ad).map(getMediaKey),
    //         }))
    //     );

    //     const restoredSignature = JSON.stringify(
    //         finalAds.map((ad) => ({
    //             id: ad?.id,
    //             media: getAdMediaItems(ad).map(getMediaKey),
    //         }))
    //     );

    //     if (currentSignature !== restoredSignature) {
    //         form.setFieldValue(adsPath, finalAds);
    //         form.setFieldValue(activeAdPath, finalAds[0]?.id);
    //     }

    //     // Clear backup only after restoring the original ad structure.
    //     if (hasBackup) {
    //         form.setFieldValue(backupPath, undefined);
    //     }
    // }, [form, index, isDynamicCreative, watchedCurrentAds]);

    useEffect(() => {
        if (multipleGeo !== "Geos" || index !== 0 || !form) return;

        const currentAdsets = form.getFieldValue("adsets") || [];
        const countries = normalizeList(firstAdsetCountries);

        const updatedAdsets = currentAdsets.map((adset, adsetIndex) =>
            adsetIndex === 0
                ? adset
                : { ...adset, countries: [...countries] }
        );

        if (
            currentAdsets.some(
                (adset, i) =>
                    JSON.stringify(normalizeList(adset?.countries)) !==
                    JSON.stringify(updatedAdsets[i]?.countries)
            )
        ) {
            form.setFieldsValue({ adsets: updatedAdsets });
        }
    }, [multipleGeo, firstAdsetCountries, adsets.length, index, form]);


    useEffect(() => {
        if (!form || index !== 0 || multiplePage !== "Page") return;

        const currentAdsets = form.getFieldValue("adsets") || [];
        const availablePages = new Set(
            page_id_list.map(option => String(option.value))
        );

        const firstSelectedAd = currentAdsets
            .flatMap(adset => adset.ads || [])
            .find(ad => normalizeList(ad?.page_id).length);

        const currentPages = normalizeList(firstSelectedAd?.page_id)
            .filter(page => availablePages.has(String(page)));

        const pagesByAccount = new Map();

        currentPages.forEach(page => {
            const accountKey = String(page).split(" - ")[0];

            if (
                selectedAccounts.some(
                    account => String(account) === accountKey
                ) &&
                !pagesByAccount.has(accountKey)
            ) {
                pagesByAccount.set(accountKey, page);
            }
        });

        // Fill any missing account from its default page, when available.
        selectedAccounts.forEach(account => {
            const accountKey = String(account);

            if (!pagesByAccount.has(accountKey)) {
                const fallback = pageidList.find(
                    page =>
                        String(page).startsWith(`${accountKey} - `) &&
                        availablePages.has(String(page))
                );

                if (fallback !== undefined) {
                    pagesByAccount.set(accountKey, fallback);
                }
            }
        });

        const selectedPages = [...pagesByAccount.values()];

        const updatedAdsets = currentAdsets.map(adset => ({
            ...adset,
            ads: (adset.ads || []).map(ad => ({
                ...ad,
                page_id: [...selectedPages]
            }))
        }));

        const changed = currentAdsets.some((adset, adsetIndex) =>
            (adset.ads || []).some((ad, adIndex) =>
                JSON.stringify(normalizeList(ad?.page_id)) !==
                JSON.stringify(
                    updatedAdsets[adsetIndex]?.ads?.[adIndex]?.page_id
                )
            )
        );

        if (changed) {
            form.setFieldsValue({ adsets: updatedAdsets });
        }
    }, [
        form,
        index,
        multiplePage,
        selectedAccounts,
        page_id_list,
        pageidList
    ]);

    useEffect(() => {
        if (!form || !campaignName.trim()) return;

        const adsetCount = watchedAdsets.length;
        const adsetName =
            adsetCount === 1
                ? campaignName.trim()
                : `${campaignName.trim()}_${index + 1}`;

        const path = ["adsets", index, "AdsetName"];

        if (form.getFieldValue(path) !== adsetName) {
            form.setFieldValue(path, adsetName);
        }
    }, [form, campaignName, watchedAdsets.length, index]);

    useEffect(() => {
        if (!form || currentAdset.id == null) return;

        const adsets = form.getFieldValue("adsets") || [];
        const adsetIndex = adsets.findIndex(
            item => String(item?.id) === String(currentAdset.id)
        );

        if (adsetIndex === -1) return;

        const adsPath = ["adsets", adsetIndex, "ads"];
        const ads = form.getFieldValue(adsPath) || [];

        if (!ads.length) return;

        form.setFieldValue(
            adsPath,
            ads.map(ad => ({
                ...ad,
                AdName: watchedAdsetName,
                AddName: watchedAdsetName,
            }))
        );
    }, [form, currentAdset.id, watchedAdsetName]);

    useEffect(() => {
        if (!form || index == null) return;

        const sharedPath = ["adsets", index, "sharedAdText"];

        if (form.getFieldValue(sharedPath) != null) return;

        const firstAd = form.getFieldValue(["adsets", index, "ads", 0]) || {};

        form.setFieldValue(sharedPath, {
            primaryText: firstAd.primaryText || "",
            headline: firstAd.headline || "",
            description: firstAd.description || "",
        });
    }, [form, index]);

    useEffect(() => {
        if (!form || multiplePixel !== "Pixel") return;

        const currentAdsets = form.getFieldValue("adsets") || [];
        const selectedPixels = normalizeList(
            currentAdsets.find(adset =>
                normalizeList(adset?.pixel_id).length
            )?.pixel_id
        );

        const isValidSelection = selectedAccounts.every(account =>
            selectedPixels.filter(
                pixel => String(pixel).split(" - ")[0] === String(account)
            ).length === 1
        );

        const hasOnlyValidAccounts = selectedPixels.every(pixel =>
            selectedAccounts.some(
                account => String(account) === String(pixel).split(" - ")[0]
            )
        );

        // Keep the current selection if each account has exactly one pixel.
        if (isValidSelection && hasOnlyValidAccounts) return;

        const availableValues = new Set(
            pixel_id_list.map(option => String(option.value))
        );

        const defaultPixels = normalizeList(pixelIdList).filter(pixel =>
            availableValues.has(String(pixel))
        );

        const updatedAdsets = currentAdsets.map(adset => ({
            ...adset,
            pixel_id: [...defaultPixels]
        }));

        form.setFieldsValue({ adsets: updatedAdsets });

        currentAdsets.forEach((_, index) => {
            form.validateFields([["adsets", index, "pixel_id"]])
                .catch(() => { });
        });
    }, [multiplePixel, form, selectedAccounts, pixelIdList, pixel_id_list]);
    const isSpecialCategory = (
        Array.isArray(specialCategories)
            ? specialCategories
            : [specialCategories]
    ).some(category => category && category !== "NONE");

    const previousCampaignBudget = useRef(campaignBudget);
    const [localMinAgeEnabled, setLocalMinAgeEnabled] = useState(
        minAgeToggle?.[index] ?? true
    );

    const isMinAgeEnabled = isSpecialCategory
        ? true
        : currentAdset.minAgeEnabled ?? minAgeToggle?.[index] ?? localMinAgeEnabled;

    const minAgeOptions = isMinAgeEnabled ? below25Options : above25Options;
    const campaignCountryValue = Form.useWatch("countries", form);
    const currentCountries = Form.useWatch(["adsets", index, "countries"], form);
    const selectedAccount = Form.useWatch(["adsets", index, "selectedAccount"], form);
    const showPayer = Form.useWatch(["adsets", index, "showPayer"], form) || false;

    const platforms = normalizeList(
        Form.useWatch(["adsets", index, "platforms"], form)
    );

    const placements = Form.useWatch(["adsets", index, "placements"], form) || "manual";

    const optimizationGoalValue =
        Form.useWatch(["adsets", index, "optimization_goal"], form) || "";

    const firstOptimizationGoal =
        Form.useWatch(["adsets", 0, "optimization_goal"], form) || "";

    const beneficiaryAndPayerEnabled = needsBeneficiaryAndPayer(currentCountries);

    const selectedScheduleCells =
        currentAdset.selectedScheduleCells ||
        selectedByAdset[adsetScheduleId] ||
        {};

    const isAdSchedulingEnabled =
        currentAdset.adSchedulingEnabled ??
        Boolean(adSchedulingToShow[adsetScheduleId]);

    const timezoneType =
        Form.useWatch(["adsets", index, "timezone_type"], form) || "ADVERTISER";

    const campaignSchedulingActive = Boolean(adSchedulingToShowCampaign);

    const showScheduling =
        campaignSchedulingActive ||
        (
            budgetType === "lifetime" &&
            campaignBudget <= 0 &&
            Boolean(isAdSchedulingEnabled)
        );

    /* Called once after a grid click/drag finishes. */
    const updateScheduleCells = updated => {
        const path = ["adsets", index, "selectedScheduleCells"];

        form.setFieldValue(path, updated);
        setSelectedByAdset(previous => ({
            ...previous,
            [adsetScheduleId]: updated
        }));
    };

    const buildAdsetSchedule = (selected, timezone) => {
        const dayMap = {};

        Object.keys(selected || {}).forEach(key => {
            if (!selected[key]) return;

            const [day, hour] = key.split("-").map(Number);
            if (!dayMap[day]) dayMap[day] = [];
            dayMap[day].push(hour);
        });

        Object.values(dayMap).forEach(hours =>
            hours.sort((a, b) => a - b)
        );

        const slotMap = {};

        Object.entries(dayMap).forEach(([day, hours]) => {
            if (!hours.length) return;

            let start = hours[0];
            let previous = hours[0];

            for (let i = 1; i <= hours.length; i++) {
                const current = hours[i];

                if (current !== previous + 1) {
                    const startMin = start * 60;
                    const endMin = (previous + 1) * 60;
                    const facebookDay = (Number(day) + 1) % 7;
                    const slotKey = `${startMin}-${endMin}`;

                    if (!slotMap[slotKey]) slotMap[slotKey] = new Set();
                    slotMap[slotKey].add(facebookDay);

                    start = current;
                }

                previous = current;
            }
        });

        return Object.entries(slotMap).map(([key, days]) => {
            const [start_minute, end_minute] = key.split("-").map(Number);

            return {
                start_minute,
                end_minute,
                days: Array.from(days).sort((a, b) => a - b),
                timezone_type: timezone
            };
        });
    };

    const isValidAdSchedule = schedule =>
        Array.isArray(schedule) &&
        schedule.length > 0 &&
        schedule.every(slot =>
            slot.end_minute > slot.start_minute &&
            Array.isArray(slot.days) &&
            slot.days.length > 0
        );


    useEffect(() => {
        if (adsetScheduleId == null || !timezoneType) return;

        const schedule = buildAdsetSchedule(
            currentAdset.selectedScheduleCells ||
            selectedByAdset[adsetScheduleId] ||
            {},
            timezoneType
        );

        const schedulePath = ["adsets", index, "ad_schedule"];
        const existingSchedule = form.getFieldValue(schedulePath);

        if (
            JSON.stringify(existingSchedule || []) !==
            JSON.stringify(schedule)
        ) {
            form.setFieldValue(schedulePath, schedule);
        }

        setAdsetSchedule(previous => {
            const existing = previous?.[adsetScheduleId];

            if (JSON.stringify(existing || []) === JSON.stringify(schedule)) {
                return previous;
            }

            return {
                ...previous,
                [adsetScheduleId]: schedule,
            };
        });

        if (isValidAdSchedule(schedule)) {
            setScheduleErrorByAdset(previous =>
                previous[adsetScheduleId]
                    ? { ...previous, [adsetScheduleId]: false }
                    : previous
            );

            setShowScheduleSubmitError(false);
        }
    }, [
        currentAdset.selectedScheduleCells,
        selectedByAdset,
        adsetScheduleId,
        timezoneType,
        index,
        form,
    ]);

    useEffect(() => {
        if (minAgeToggle?.[index] !== undefined) {
            setLocalMinAgeEnabled(minAgeToggle[index]);
        }
    }, [minAgeToggle, index]);

    useEffect(() => {
        if (!form || index == null) return;
        if (previousCampaignBudget.current === campaignBudget) return;

        previousCampaignBudget.current = campaignBudget;

        const budgetPath = ["adsets", index, "DailyAdd_amount"];

        if (campaignBudget > 0) {
            form.setFields([{ name: budgetPath, errors: [] }]);
            return;
        }

        form.validateFields([budgetPath]).catch(() => { });
    }, [campaignBudget, index, form]);

    useEffect(() => {
        const categories = Array.isArray(specialCategories)
            ? specialCategories
            : [specialCategories];

        if (
            !categories.some(category => category && category !== "NONE") ||
            !form
        ) return;

        setLocalMinAgeEnabled(true);
        setMinAgeToggle?.(previous => ({
            ...(previous || {}),
            [index]: true
        }));

        const currentAdsets = form.getFieldValue("adsets") || [];

        const updated = currentAdsets.map(adset => ({
            ...adset,
            Min_Age: "18",
            minAgeEnabled: true,
            Max_Age: "65",
            Gender: "0"
        }));

        if (JSON.stringify(currentAdsets) !== JSON.stringify(updated)) {
            form.setFieldsValue({ adsets: updated });
        }
    }, [specialCategories, form, index, setMinAgeToggle]);

    useEffect(() => {
        if (!form || index == null || isSpecialCategory) return;

        const path = ["adsets", index, "Min_Age"];
        const current = String(form.getFieldValue(path) ?? "");
        const options = isMinAgeEnabled ? below25Options : above25Options;

        if (!options.some(option => option.value === current)) {
            form.setFieldValue(path, isMinAgeEnabled ? "18" : "26");
        }
    }, [form, index, isMinAgeEnabled, isSpecialCategory]);

    useEffect(() => {
        if (!form || index === 0 || !firstOptimizationGoal) return;

        const path = ["adsets", index, "optimization_goal"];

        if (form.getFieldValue(path) !== firstOptimizationGoal) {
            form.setFieldValue(path, firstOptimizationGoal);
        }
    }, [firstOptimizationGoal, index, form]);

    const currentOptimizationOptions =
        specialOptimizationRules[objectiveValue]?.[bidStrategyValue] ||
        optimizationGoalOptions[objectiveValue] ||
        [];

    const languageOptions = Array.isArray(localesdata)
        ? localesdata.map(item => ({
            value: item.key,
            label: item.name
        }))
        : [];

    const allCountryTree = useMemo(() => {
        const source = continents?.length
            ? continents
            : Array.isArray(campaignCountries)
                ? campaignCountries.filter(item =>
                    item &&
                    typeof item === "object" &&
                    (Array.isArray(item.children) || Array.isArray(item.countries))
                )
                : [];

        return source.map(normalizeCountryNode).filter(Boolean);
    }, [continents, campaignCountries]);

    const campaignCountryValues = useMemo(
        () =>
            normalizeList(campaignCountryValue)
                .map(item =>
                    item && typeof item === "object"
                        ? item.value ?? item.key ?? item.code
                        : item
                )
                .filter(value =>
                    value !== undefined && value !== null && value !== ""
                ),
        [campaignCountryValue]
    );

    const countryTreeData = useMemo(() => {
        const root = {
            key: "all_countries",
            value: "all_countries",
            label: "Countries",
            title: "Countries",
            children: allCountryTree
        };

        const selectedValues = [
            ...campaignCountryValues,
            ...normalizeList(currentCountries).map(item =>
                item && typeof item === "object"
                    ? item.value ?? item.key ?? item.code
                    : item
            )
        ].filter(value =>
            value !== undefined && value !== null && value !== ""
        );

        const allowed = new Set(campaignCountryValues.map(String));

        const filteredContinents =
            !campaignCountryValues.length ||
                campaignCountryValues.some(
                    value => String(value) === "all_countries"
                )
                ? allCountryTree
                : allCountryTree
                    .map(continent => {
                        const continentValues = [
                            continent.value,
                            continent.key,
                            continent.label
                        ]
                            .filter(value => value != null)
                            .map(String);

                        if (continentValues.some(value => allowed.has(value))) {
                            return continent;
                        }

                        const children = (continent.children || []).filter(country =>
                            [country.value, country.key, country.label]
                                .filter(value => value != null)
                                .map(String)
                                .some(value => allowed.has(value))
                        );

                        return children.length
                            ? { ...continent, children }
                            : null;
                    })
                    .filter(Boolean);

        const visible = new Set();

        const collectVisible = nodes => {
            (nodes || []).forEach(node => {
                visible.add(String(node.value));
                visible.add(String(node.key));
                collectVisible(node.children);
            });
        };

        collectVisible(filteredContinents);

        const missingNodes = [...new Set(selectedValues.map(String))]
            .filter(value =>
                value !== "all_countries" &&
                !visible.has(value)
            )
            .map(value => ({
                key: value,
                value,
                label: value,
                title: value,
                isLeaf: true
            }));

        return [{
            ...root,
            children: [
                ...filteredContinents,
                ...(missingNodes.length
                    ? [{
                        key: "selected_countries",
                        value: "selected_countries",
                        label: "Previously selected countries",
                        title: "Previously selected countries",
                        children: missingNodes
                    }]
                    : [])
            ]
        }];
    }, [allCountryTree, campaignCountryValues, currentCountries]);

    const findCountry = useMemo(() => {
        const result = new Map();

        const walk = nodes => {
            (nodes || []).forEach(node => {
                result.set(String(node.value), node.value);
                result.set(String(node.key), node.value);
                walk(node.children);
            });
        };

        walk(allCountryTree);
        return result;
    }, [allCountryTree]);

    const defaultCountryValue = findCountry.get("US") ?? "US";

    useEffect(() => {
        if (!form || index == null || !isCreate) return;

        const defaults = {
            placements: "manual",
            DailyAdd_amount: 0,
            Min_Age: "18",
            minAgeEnabled: true,
            Max_Age: "65",
            Gender: "0",
            adSchedulingEnabled: false,
            timezone_type: "ADVERTISER",
            selectedScheduleCells: {},
            ad_schedule: [],
            Language: [6],
            platforms: [],
            positions: [],
            selectedPositions: [],
            device_platforms: [],
            pixel_id: pixelIdList,
            page_id: [],
            ads: [createInitialAd(selectedAccounts)]
        };

        Object.entries(defaults).forEach(([key, value]) => {
            if (form.getFieldValue(["adsets", index, key]) == null) {
                form.setFieldValue(
                    ["adsets", index, key],
                    cloneValue(value)
                );
            }
        });

        if (form.getFieldValue(["adsets", index, "DatePicker"]) == null) {
            form.setFieldValue(["adsets", index, "DatePicker"], dayjs());
        }

        if (
            budgetType === "lifetime" &&
            form.getFieldValue(["adsets", index, "DatePickerEnd"]) == null
        ) {
            form.setFieldValue(
                ["adsets", index, "DatePickerEnd"],
                dayjs().add(30, "day")
            );
        }

        if (form.getFieldValue(["adsets", index, "selectedAccount"]) == null) {
            const accounts = normalizeList(watchedAccountList);

            if (accounts.length) {
                form.setFieldValue(
                    ["adsets", index, "selectedAccount"],
                    accounts[0]
                );
            }
        }
    }, [
        form,
        index,
        budgetType,
        selectedAccounts,
        watchedAccountList,
        isCreate,
        pixelIdList
    ]);

    // Keep your existing defaults useEffect unchanged above.

    // Set default pixel selection when options become available.
    useEffect(() => {
        if (
            !form ||
            index == null ||
            !isCreate ||
            !Array.isArray(pixelIdList) ||
            !pixelIdList.length ||
            !Array.isArray(pixel_id_list) ||
            !pixel_id_list.length
        ) {
            return;
        }

        const path = ["adsets", index, "pixel_id"];
        const currentValue = form.getFieldValue(path);

        // Preserve any existing selection.
        if (Array.isArray(currentValue) && currentValue.length > 0) {
            return;
        }

        const availableValues = new Set(
            pixel_id_list.map(option => String(option.value))
        );

        const validDefaults = pixelIdList.filter(value =>
            availableValues.has(String(value))
        );

        if (validDefaults.length) {
            form.setFieldValue(path, validDefaults);
        }
    }, [form, index, isCreate, pixelIdList, pixel_id_list]);

    useEffect(() => {
        if (!form || index == null || !allCountryTree.length) return;

        const path = ["adsets", index, "countries"];
        const existing = normalizeList(form.getFieldValue(path));

        if (campaignCountryValues.length) {
            const selected = campaignCountryValues.filter(value =>
                findCountry.has(String(value))
            );

            if (JSON.stringify(existing) !== JSON.stringify(selected)) {
                form.setFieldValue(path, [...selected]);
            }

            return;
        }

        if (isCreate && !existing.length && defaultCountryValue !== undefined) {
            form.setFieldValue(path, [defaultCountryValue]);
        }
    }, [
        allCountryTree,
        campaignCountryValues,
        findCountry,
        defaultCountryValue,
        index,
        form,
        isCreate
    ]);

    useEffect(() => {
        if (!objectiveValue) return;

        const actionOptions = actionSourceOptions[objectiveValue] || [];
        const eventOptions = conversionEventOptions[objectiveValue] || [];

        const optimizationOptions =
            specialOptimizationRules[objectiveValue]?.[bidStrategyValue] ||
            optimizationGoalOptions[objectiveValue] ||
            [];

        const path = key => ["adsets", index, key];

        const currentAction = form.getFieldValue(path("action_source"));
        const currentGoal = form.getFieldValue(path("optimization_goal"));
        const currentEvent = form.getFieldValue(path("custom_event_type"));

        const nextAction = actionOptions.some(item => item.value === currentAction)
            ? currentAction
            : actionOptions[0]?.value || "";

        const nextGoal = optimizationOptions.some(item => item.value === currentGoal)
            ? currentGoal
            : optimizationOptions[0]?.value || "";

        const nextEvent = eventOptions.some(item => item.value === currentEvent)
            ? currentEvent
            : eventOptions[0]?.value || "";

        const billingOptions = billingEventOptions[nextGoal] || [];
        const currentBilling = form.getFieldValue(path("billing_event"));

        const nextBilling = billingOptions.some(item => item.value === currentBilling)
            ? currentBilling
            : billingOptions[0]?.value || "";

        [
            ["action_source", nextAction],
            ["optimization_goal", nextGoal],
            ["custom_event_type", nextEvent],
            ["billing_event", nextBilling]
        ].forEach(([key, value]) => {
            if (form.getFieldValue(path(key)) !== value) {
                form.setFieldValue(path(key), value);
            }
        });
    }, [objectiveValue, bidStrategyValue, index, form]);

    useEffect(() => {
        if (!optimizationGoalValue) return;

        const options = billingEventOptions[optimizationGoalValue] || [];
        const path = ["adsets", index, "billing_event"];
        const current = form.getFieldValue(path);

        if (!options.some(item => item.value === current)) {
            form.setFieldValue(path, options[0]?.value || "");
        }
    }, [optimizationGoalValue, index, form]);

    // const handlePlatformsChange = selected => {
    //     const selectedPlatforms = normalizeList(selected);

    //     const nextPositions = [
    //         ...new Set(
    //             selectedPlatforms.flatMap(
    //                 platform => platformPositions[platform] || []
    //             )
    //         )
    //     ];

    //     const currentAdsets = form.getFieldValue("adsets") || [];
    //     const updatedAdsets = currentAdsets.map((adset, adsetIndex) =>
    //         adsetIndex === index
    //             ? {
    //                 ...adset,
    //                 platforms: selectedPlatforms,
    //                 positions: nextPositions
    //             }
    //             : adset
    //     );

    //     form.setFieldsValue({ adsets: updatedAdsets });
    //     Promise.resolve().then(validateDevicePlatforms);
    // };

    const handlePlatformsChange = selected => {
        const selectedPlatforms = normalizeList(selected);

        const nextPositions = [
            ...new Set(
                selectedPlatforms.flatMap(
                    platform => platformPositions[platform] || []
                )
            )
        ];

        const currentAdsets = form.getFieldValue("adsets") || [];

        const updatedAdsets = currentAdsets.map((adset, adsetIndex) =>
            adsetIndex === index
                ? {
                    ...adset,
                    platforms: selectedPlatforms,
                    positions: nextPositions,
                    selectedPositions: getSelectedPositionObjects(nextPositions)
                }
                : adset
        );

        form.setFieldsValue({ adsets: updatedAdsets });
        Promise.resolve().then(validateDevicePlatforms);
    };

    // const handlePositionsChange = selected => {
    //     form.setFieldValue(
    //         ["adsets", index, "positions"],
    //         normalizeList(selected)
    //     );
    //     Promise.resolve().then(validateDevicePlatforms);
    // };

    const handlePositionsChange = selected => {
        const selectedValues = normalizeList(selected);

        form.setFieldValue(
            ["adsets", index, "positions"],
            selectedValues
        );

        form.setFieldValue(
            ["adsets", index, "selectedPositions"],
            getSelectedPositionObjects(selectedValues)
        );

        Promise.resolve().then(validateDevicePlatforms);
    };

    const positionOptions = useMemo(() => {
        const selected = new Set(platforms);

        return allPositionOptions
            .filter(item => selected.has(item.platform))
            .map(({ value, label }) => ({ value, label }));
    }, [platforms]);

    const budgetValidator = {
        validator: (_, value) => {
            const campaignValue = Number(
                form.getFieldValue("Daily_amount") || 0
            );
            const adsetValue = Number(value || 0);

            return campaignValue > 0 || adsetValue > 0
                ? Promise.resolve()
                : Promise.reject(new Error(
                    "Enter a budget greater than 0 at the campaign or ad set level."
                ));
        }
    };

    const positionValidator = {
        validator: (_, value = []) => {
            if (!Array.isArray(value)) return Promise.resolve();

            const allowed = new Set(
                platforms.flatMap(
                    platform => platformPositions[platform] || []
                )
            );

            if (value.some(position => !allowed.has(position))) {
                return Promise.reject(new Error(
                    "Select positions according to the selected platforms."
                ));
            }

            if (value.includes("sponsored_messages") && value.length > 1) {
                return Promise.reject(new Error(
                    "Messenger Sponsored Messages cannot be combined with other placements."
                ));
            }

            return Promise.resolve();
        }
    };

    const deviceValidator = {
        validator: (_, value) => {
            const devices = normalizeList(value)
                .filter(Boolean)
                .map(device =>
                    String(
                        typeof device === "object"
                            ? device.value ?? device.label
                            : device
                    ).toLowerCase()
                );

            const selectedPositions = normalizeList(
                form.getFieldValue(["adsets", index, "positions"])
            );

            if (!devices.length) {
                return Promise.reject(
                    new Error("Please select at least one device.")
                );
            }

            const mobileOnly = [
                "story_f",
                "story_i",
                "story_m",
                "facebook_reels",
                "reels",
                "rewarded_video",
                "classic"
            ];

            if (
                selectedPositions.some(position =>
                    mobileOnly.includes(position)
                ) &&
                !devices.includes("mobile")
            ) {
                return Promise.reject(
                    new Error("Selected placements require Mobile.")
                );
            }

            if (
                selectedPositions.includes("right_hand_column") &&
                !devices.includes("desktop")
            ) {
                return Promise.reject(
                    new Error("Facebook Right Column requires Desktop.")
                );
            }

            return Promise.resolve();
        }
    };

    function validateDevicePlatforms() {
        if (placements !== "manual") return;

        form.validateFields([
            ["adsets", index, "device_platforms"]
        ]).catch(() => { });
    }

    const handleMinAgeToggle = checked => {
        setLocalMinAgeEnabled(checked);
        setMinAgeToggle?.(previous => ({
            ...(previous || {}),
            [index]: checked
        }));
        form.setFieldValue(["adsets", index, "minAgeEnabled"], checked);
        form.setFieldValue(
            ["adsets", index, "Min_Age"],
            checked ? "18" : "26"
        );
    };

    const onClickShareBeneficiaryAndPayerForAllAccount = () => {
        const account = form.getFieldValue([
            "adsets", index, "selectedAccount"
        ]);

        const beneficiary = form.getFieldValue([
            "adsets", index, "Beneficiary", account
        ]) || "";

        const payer = form.getFieldValue([
            "adsets", index, "Payer", account
        ]) || "";

        watchedAccountList.forEach(accountNumber => {
            form.setFieldValue(
                ["adsets", index, "Beneficiary", accountNumber],
                beneficiary
            );

            form.setFieldValue(
                ["adsets", index, "Payer", accountNumber],
                payer
            );
        });
    };

    const onClickClearAllAccounts = () => {
        watchedAccountList.forEach(account => {
            form.setFieldValue(
                ["adsets", index, "Beneficiary", account],
                ""
            );
            form.setFieldValue(
                ["adsets", index, "Payer", account],
                ""
            );
        });
    };

    const schema = [
        {
            key: "AdsetName",
            label: "Adset Name",
            type: "input",
            required: true,
            row: 1,
            width: 3.5,
            props: { placeholder: "Enter ad set name" }
        },
        {
            key: "action_source",
            label: "Action Source",
            type: "select",
            required: true,
            row: 1,
            width: 2,
            options: actionSourceOptions[objectiveValue] || []
        },
        {
            key: "optimization_goal",
            label: "Optimization Goal",
            type: "select",
            required: true,
            row: 1,
            width: 2.5,
            options: currentOptimizationOptions.map(option => ({
                ...option,
                disabled: index !== 0 && option.value !== firstOptimizationGoal
            }))
        },
        {
            key: "custom_event_type",
            label: "Event Type",
            type: "select",
            required: true,
            row: 1,
            width: 2,
            options: conversionEventOptions[objectiveValue] || []
        },
        {
            key: "billing_event",
            label: "Billing Event",
            type: "select",
            required: true,
            row: 1,
            width: 2,
            options: billingEventOptions[optimizationGoalValue] || []
        },
        // {
        //     key: "pixel_id",
        //     label: "Pixel",
        //     type: "select",
        //     required: true,
        //     row: 2,
        //     width: 4,
        //     options: pixel_id_list,
        //     props: {
        //         mode: "multiple",
        //         allowClear: true,
        //         showSearch: true,
        //         optionFilterProp: "label",
        //         maxTagCount: 1,
        //         placeholder: "Select pixel(s)"
        //     }
        // },

        {
            key: "pixel_id",
            label: "Pixel",
            type: "select",
            required: true,
            row: 2,
            width: 4,
            options: pixel_id_list.map(option => {
                const account = String(option.value).split(" - ")[0];
                const selectedPixels = normalizeList(
                    form.getFieldValue(["adsets", index, "pixel_id"])
                );
                const selectedForAccount = selectedPixels.filter(
                    value => String(value).split(" - ")[0] === account
                );

                return {
                    ...option,
                    disabled:
                        multiplePixel === "Pixel" &&
                        selectedForAccount.length > 0 &&
                        !selectedPixels.includes(option.value)
                };
            }),
            rules: [
                {
                    validator: (_, value) => {
                        const selectedPixels = normalizeList(value);
                        const missingAccount = selectedAccounts.find(account =>
                            !selectedPixels.some(
                                pixel => String(pixel).split(" - ")[0] === String(account)
                            )
                        );

                        return missingAccount
                            ? Promise.reject(
                                new Error(`Please select a pixel for account ${missingAccount}.`)
                            )
                            : Promise.resolve();
                    }
                }
            ],
            props: {
                mode: "multiple",
                allowClear: true,
                showSearch: true,
                optionFilterProp: "label",
                maxTagCount: 1,
                placeholder: "Select pixel(s)"
            }
        },
        {
            key: "DatePicker",
            label: "Start Time",
            type: "date",
            required: true,
            row: 2,
            width: 2
        },
        {
            key: "DatePickerEnd",
            label: "End Time",
            type: "date",
            required: budgetType === "lifetime",
            hidden: budgetType !== "lifetime",
            row: 2,
            width: 2,
            rules: budgetType === "lifetime"
                ? [{
                    validator: (_, value) => {
                        const start = form.getFieldValue([
                            "adsets",
                            index,
                            "DatePicker"
                        ]);

                        if (!value) {
                            return Promise.reject(
                                new Error("Please select an end time.")
                            );
                        }

                        if (start && dayjs(value).isBefore(dayjs(start))) {
                            return Promise.reject(
                                new Error("End time must be after start time.")
                            );
                        }

                        return Promise.resolve();
                    }
                }]
                : []
        },
        {
            key: "DailyAdd_amount",
            labelNode: (
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8
                }}>
                    <span>
                        {budgetType === "lifetime"
                            ? "Lifetime Budget"
                            : "Daily Budget"}
                    </span>
                    <Tooltip title="Enable Ad Scheduling">
                        <Switch
                            size="small"
                            disabled={
                                campaignSchedulingActive ||
                                budgetType === "daily" ||
                                campaignBudget > 0
                            }
                            checked={Boolean(isAdSchedulingEnabled)}
                            style={{
                                backgroundColor: adSchedulingToShow[adsetScheduleId]
                                    ? "#91C25F"
                                    : undefined
                            }}
                            onChange={checked => {
                                form.setFieldValue(
                                    ["adsets", index, "adSchedulingEnabled"],
                                    checked
                                );
                                setAdSchedulingToShow(previous => ({
                                    ...previous,
                                    [adsetScheduleId]: checked
                                }));
                            }}
                        />
                    </Tooltip>
                </span>
            ),
            label: budgetType === "lifetime" ? "Lifetime Budget" : "Daily Budget",
            type: "number",
            required: true,
            row: 2,
            width: 2,
            rules: [budgetValidator],
            props: {
                min: 0,
                step: 0.01,
                precision: 2,
                placeholder: "$",
                disabled: campaignBudget > 0
            }
        },
        {
            key: "bid_amount",
            label: bidStrategyValue === "LOWEST_COST_WITH_BID_CAP"
                ? "Bid Cap"
                : bidStrategyValue === "COST_CAP"
                    ? "CPR goal"
                    : bidStrategyValue === "LOWEST_COST_WITH_MIN_ROAS"
                        ? "ROAS Goal"
                        : "Bid Amount",
            type: "number",
            row: 2,
            width: 1,
            hidden: !bidStrategyValue ||
                bidStrategyValue === "LOWEST_COST_WITHOUT_CAP",
            rules: [
                { required: true, message: "Please enter a bid amount!" },
                {
                    validator: (_, value) =>
                        value !== undefined &&
                            value !== null &&
                            value !== "" &&
                            Number.isFinite(Number(value)) &&
                            Number(value) > 0
                            ? Promise.resolve()
                            : Promise.reject(new Error(
                                "Please enter a valid bid amount greater than 0!"
                            ))
                }
            ],
            props: {
                min: 0.01,
                step: 0.1,
                precision: 2,
                placeholder: "$",
                onWheel: event => event.currentTarget.blur()
            }
        },
        {
            key: "countries",
            label: "Countries",
            type: "treeSelect",
            required: true,
            row: 3,
            width: 3,
            options: countryTreeData,
            // props: {
            //     treeCheckable: true,
            //     showCheckedStrategy: SHOW_CHILD,
            //     showSearch: true,
            //     allowClear: true,
            //     treeNodeFilterProp: "label",
            //     treeDefaultExpandedKeys: ["all_countries"],
            //     placeholder: campaignCountryValues.length
            //         ? "Select from campaign countries"
            //         : "Select countries",
            //     maxTagCount: 2,
            //     fieldNames: {
            //         label: "label",
            //         value: "value",
            //         children: "children"
            //     },
            //     treeLine: true,
            //     switcherIcon: ({ expanded, isLeaf }) =>
            //         isLeaf
            //             ? null
            //             : expanded
            //                 ? <DownOutlined />
            //                 : <RightOutlined />,
            //     className: `${theme === "dark" ? "dark-theme" : "light-theme"
            //         } green-border-select`,
            //     classNames: {
            //         popup: {
            //             root: `${theme === "dark"
            //                 ? "custom-dropdown"
            //                 : "custom-dropdown-light"
            //                 } campaigns-campaign-level-tree-dropdown campaigns-adset-level-tree-dropdown`
            //         }
            //     },
            //     style: { width: "100%" }
            // }
            props: {
                disabled: multipleGeo === "Geos" && index !== 0,
                treeCheckable: true,
                showCheckedStrategy: SHOW_CHILD,
                showSearch: true,
                allowClear: true,
                treeNodeFilterProp: "label",
                treeDefaultExpandedKeys: ["all_countries"],
                placeholder: campaignCountryValues.length
                    ? "Select from campaign countries"
                    : "Select countries",
                maxTagCount: 2,
                fieldNames: {
                    label: "label",
                    value: "value",
                    children: "children"
                },
                treeLine: true,
                switcherIcon: ({ expanded, isLeaf }) =>
                    isLeaf
                        ? null
                        : expanded
                            ? <DownOutlined />
                            : <RightOutlined />,
                className: `${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select`,
                classNames: {
                    popup: {
                        root: `${theme === "dark"
                            ? "custom-dropdown"
                            : "custom-dropdown-light"
                            } campaigns-campaign-level-tree-dropdown campaigns-adset-level-tree-dropdown`
                    }
                },
                style: { width: "100%" }
            }
        },
        {
            key: "Language",
            label: "Language",
            type: "select",
            required: true,
            row: 3,
            width: 2.25,
            options: languageOptions,
            props: {
                mode: "multiple",
                allowClear: true,
                showSearch: true,
                optionFilterProp: "label",
                placeholder: "Select language",
                maxTagCount: 1
            }
        },
        {
            key: "Gender",
            label: "Gender",
            type: "select",
            required: true,
            row: 3,
            width: 1,
            options: genderOptions,
            props: { disabled: isSpecialCategory }
        },
        {
            key: "Min_Age",
            labelNode: (
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8
                }}>
                    <span>Min Age</span>
                    <Switch
                        size="small"
                        checked={isMinAgeEnabled}
                        disabled={isSpecialCategory}
                        onChange={handleMinAgeToggle}
                    />
                </span>
            ),
            label: "Min Age",
            type: "select",
            required: true,
            row: 3,
            width: 1,
            options: minAgeOptions,
            props: { disabled: isSpecialCategory }
        },
        {
            key: "Max_Age",
            label: "Max Age",
            type: "select",
            required: true,
            row: 3,
            width: 1,
            options: maxAgeOptions,
            props: { disabled: isSpecialCategory }
        },
        {
            key: "placements",
            label: "Placements",
            type: "select",
            required: true,
            row: 4,
            width: 1.15,
            options: [
                {
                    value: "Advance",
                    label: "Advance",
                    disabled: network === "FB_Mnet"
                },
                { value: "manual", label: "Manual" }
            ]
        },
        {
            key: "platforms",
            label: "Platforms",
            type: "select",
            required: true,
            row: 4,
            width: 1.65,
            hidden: placements !== "manual",
            options: platformOptions,
            props: {
                mode: "multiple",
                allowClear: true,
                placeholder: "Select platforms"
            }
        },
        {
            key: "positions",
            label: "Positions",
            type: "select",
            required: true,
            row: 4,
            width: 4,
            hidden: placements !== "manual",
            options: positionOptions,
            rules: [positionValidator],
            props: {
                mode: "multiple",
                allowClear: true,
                showSearch: true,
                optionFilterProp: "label",
                placeholder: platforms.length
                    ? "Select positions"
                    : "Select platform first",
                disabled: !platforms.length
            }
        },
        {
            key: "device_platforms",
            label: "Device",
            type: "select",
            required: true,
            row: 4,
            width: 1.5,
            hidden: placements !== "manual",
            options: deviceOptions,
            rules: [deviceValidator],
            props: {
                mode: "multiple",
                allowClear: true,
                placeholder: "Select device"
            }
        }
    ];

    const renderField = field => {
        const props = {
            ...field.props,
            style: {
                ...field.props?.style,
                width: "100%",
                minWidth: 0,
                fontSize: 12
            }
        };

        if (field.type === "input") {
            return <Input {...props} variant="outlined" />;
        }

        if (field.type === "number") {
            return <InputNumber {...props} variant="outlined" />;
        }

        if (field.type === "select") {
            return (
                <Select
                    {...props}
                    variant="outlined"
                    options={field.options}
                    // onChange={
                    //     field.key === "platforms"
                    //         ? handlePlatformsChange
                    //         : field.key === "positions"
                    //             ? handlePositionsChange
                    //             : field.key === "device_platforms"
                    //                 ? validateDevicePlatforms
                    //                 : undefined
                    // }

                    onChange={
                        field.key === "platforms"
                            ? handlePlatformsChange
                            : field.key === "positions"
                                ? handlePositionsChange
                                : field.key === "device_platforms"
                                    ? validateDevicePlatforms
                                    : field.key === "pixel_id"
                                        ? value => {
                                            const selectedPixels = normalizeList(value);
                                            const currentAdsets = form.getFieldValue("adsets") || [];

                                            form.setFieldValue(
                                                "adsets",
                                                currentAdsets.map(adset => ({
                                                    ...adset,
                                                    pixel_id: [...selectedPixels]
                                                }))
                                            );

                                            currentAdsets.forEach((_, adsetIndex) => {
                                                form.validateFields([
                                                    ["adsets", adsetIndex, "pixel_id"]
                                                ]).catch(() => { });
                                            });
                                        }
                                        : undefined
                    }
                    classNames={{
                        popup: { root: "campaigns-dropdown" }
                    }}
                />
            );
        }

        if (field.type === "treeSelect") {
            return (
                <TreeSelect
                    {...props}
                    variant="outlined"
                    treeData={field.options}
                />
            );
        }

        if (field.type === "date") {
            return <DatePicker {...props} showTime variant="outlined" />;
        }

        return null;
    };

    const rows = [1, 2, 3, 4]
        .map(row => ({
            row,
            fields: schema.filter(
                field => field.row === row && !field.hidden
            )
        }))
        .filter(item => item.fields.length);

    const isLibraryCreativeAd = (ad) => {
        const source = String(ad?.mediaSource || "").toLowerCase();

        if (["creatives", "creative", "library"].includes(source)) {
            return true;
        }

        if (["upload", "local", "device"].includes(source)) {
            return false;
        }

        if (ad?.sourceCreative || ad?.creativeId || ad?.creativeAssetId) {
            return true;
        }

        const media = [
            ...(Array.isArray(ad?.media?.images) ? ad.media.images : []),
            ...(Array.isArray(ad?.media?.videos) ? ad.media.videos : []),
            ...(Array.isArray(ad?.filename)
                ? ad.filename
                : ad?.filename
                    ? [ad.filename]
                    : []),
        ];

        return media.some(item =>
            item &&
            typeof item === "object" &&
            (
                item.sourceCreative ||
                item.creativeId ||
                item.creativeAssetId ||
                item.isRemote === true
            )
        );
    };

    return (
        <>
            {/* ADD IT HERE */}
            <Form.Item
                name={[index, "id"]}
                hidden
                preserve
            >
                <Input />
            </Form.Item>
            <style>{`
                .campaigns-adset-level {
                    width: 100%;
                    min-width: 0;
                }

                .campaigns-adset-row {
                    display: flex;
                    width: 100%;
                    min-width: 0;
                    gap: 10px;
                    align-items: flex-start;
                }

                .campaigns-adset-row + .campaigns-adset-row {
                    margin-top: 4px;
                }

                .campaigns-adset-item {
                    min-width: 0;
                    margin: 0 !important;
                }

                .campaigns-adset-item .ant-form-item-label {
                    padding-bottom: 4px;
                }

                .campaigns-adset-item .ant-form-item-label > label {
                    color: #B4B4B4;
                    font-size: 13px;
                    height: auto;
                }

                .campaigns-adset-item .ant-select,
                .campaigns-adset-item .ant-input,
                .campaigns-adset-item .ant-input-number,
                .campaigns-adset-item .ant-picker {
                    width: 100%;
                    min-width: 0;
                }

                .campaigns-adset-targeting {
                    width: 100%;
                    margin: 8px 0;
                    font-size: 12px;
                    font-weight: 600;
                    color: #91c25f;
                }

                .campaigns-adset-level-tree-dropdown .ant-select-tree-switcher,
                .campaigns-campaign-level-tree-dropdown .ant-select-tree-switcher {
                    display: inline-flex !important;
                    width: 24px !important;
                    height: 24px !important;
                    align-items: center !important;
                    justify-content: center !important;
                }

                .campaigns-adset-level-tree-dropdown .ant-select-tree-indent-unit,
                .campaigns-campaign-level-tree-dropdown .ant-select-tree-indent-unit {
                    width: 24px !important;
                }

                .campaigns-adset-ads {
                    width: 100%;
                    min-width: 0;
                    margin-top: 16px;
                }

                .campaigns-adset-ads-title {
                    margin-bottom: 10px;
                    color: #91c25f;
                    font-size: 13px;
                    font-weight: 600;
                }

                .campaigns-beneficiary-payer {
                    margin-top: 12px;
                    min-width: 0;
                }

                .campaigns-beneficiary-payer-header {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .campaigns-beneficiary-payer-label {
                    color: #B4B4B4;
                }

                .campaigns-adset-schedule {
                    width: 100%;
                    min-width: 0;
                    margin: 8px 0 14px;
                    overflow: visible;
                }

                .campaigns-adset-schedule-grid-scroll {
                    width: 100%;
                    min-width: 0;
                    overflow-x: visible;
                }

                .campaigns-adset-schedule-grid {
                    width: 100%;
                    min-width: 0;
                    user-select: none;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .campaigns-adset-schedule-row {
                    display: grid;
                    grid-template-columns: 82px repeat(24, minmax(0, 1fr));
                }

                .campaigns-adset-schedule-header {
                    margin-bottom: 3px;
                }

                .campaigns-adset-schedule-hour-label {
                    min-height: 20px;
                    font-size: 10px;
                    color: #999;
                    text-align: left;
                    white-space: nowrap;
                }

                .campaigns-adset-schedule-day {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                    color: #B4B4B4;
                }

                .campaigns-adset-schedule-cell {
                    height: 15px;
                    min-width: 0;
                    border: 1px solid rgba(145,194,95,.25);
                    background: rgba(145,194,95,.06);
                    cursor: crosshair;
                }

                .campaigns-adset-schedule-cell.group-start {
                    border-left: 2px solid rgba(145,194,95,.55);
                }

                .campaigns-adset-schedule-cell.active {
                    background: #6dbdcf;
                    border-color: #249DB8;
                }

                .campaigns-adset-schedule-every-day {
                    margin-top: 4px;
                }

                @media (max-width: 600px) {
                    .campaigns-adset-row {
                        flex-wrap: wrap;
                    }

                    .campaigns-adset-row .campaigns-adset-item {
                        flex: 1 1 calc(50% - 5px) !important;
                    }

                    .campaigns-adset-schedule-grid-scroll {
                        overflow-x: auto;
                        overflow-y: hidden;
                        -webkit-overflow-scrolling: touch;
                    }

                    .campaigns-adset-schedule-grid {
                        width: 760px;
                        min-width: 760px;
                    }

                    .campaigns-adset-schedule-row {
                        grid-template-columns: 82px repeat(24, minmax(20px, 1fr));
                    }
                }

                @media (max-width: 420px) {
                    .campaigns-adset-row .campaigns-adset-item {
                        flex: 1 1 100% !important;
                    }
                }
            `}</style>

            <div className="campaigns-adset-level">
                <Form.Item
                    name={[index, "minAgeEnabled"]}
                    hidden
                    preserve
                >
                    <HiddenField />
                </Form.Item>

                <Form.Item
                    name={[index, "adSchedulingEnabled"]}
                    hidden
                    preserve
                >
                    <HiddenField />
                </Form.Item>

                <Form.Item
                    name={[index, "selectedScheduleCells"]}
                    hidden
                    preserve
                >
                    <HiddenField />
                </Form.Item>
                <Form.Item
                    name={[index, "ad_schedule"]}
                    hidden
                    preserve
                    rules={[
                        {
                            validator: async () => {
                                if (!showScheduling) return;

                                const cells =
                                    form.getFieldValue([
                                        "adsets",
                                        index,
                                        "selectedScheduleCells"
                                    ]) ||
                                    selectedByAdset[adsetScheduleId] ||
                                    {};

                                const hasSelection = Object.values(cells).some(
                                    selected => selected === true
                                );

                                if (!hasSelection) {
                                    setScheduleErrorByAdset(previous => ({
                                        ...previous,
                                        [adsetScheduleId]: true
                                    }));

                                    setShowScheduleSubmitError(true);

                                    throw new Error(
                                        "Please select at least one scheduling time slot."
                                    );
                                }

                                setScheduleErrorByAdset(previous => ({
                                    ...previous,
                                    [adsetScheduleId]: false
                                }));

                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <HiddenField />
                </Form.Item>

                {rows.map(({ row, fields }) => (
                    <div key={row}>
                        {row === 3 && (
                            <div className="campaigns-adset-targeting">
                                Targeting
                            </div>
                        )}

                        <div className={`campaigns-adset-row campaigns-adset-row-${row}`}>
                            {fields.map(field => (
                                <Form.Item
                                    key={field.key}
                                    className="campaigns-adset-item"
                                    name={[index, field.key]}
                                    dependencies={
                                        field.key === "DailyAdd_amount"
                                            ? [["Daily_amount"]]
                                            : undefined
                                    }
                                    label={field.labelNode || field.label}
                                    required={field.required}
                                    rules={[
                                        ...(field.required && field.key !== "device_platforms"
                                            ? [{
                                                required: true,
                                                message: `Please select or enter ${field.label.toLowerCase()}.`
                                            }]
                                            : []),
                                        ...(field.rules || [])
                                    ]}
                                    style={{
                                        flex: `${field.width || 1} 1 0`
                                    }}
                                    validateTrigger={
                                        field.key === "device_platforms"
                                            ? []
                                            : ["onChange", "onBlur"]
                                    }
                                >
                                    {renderField(field)}
                                </Form.Item>
                            ))}
                        </div>
                    </div>
                ))}

                {showScheduling && (
                    <div className="campaigns-adset-schedule">
                        <Form.Item
                            name={[index, "timezone_type"]}
                            label="Time Zone"
                            rules={[{
                                required: true,
                                message: "Please select a time zone"
                            }]}
                            style={{
                                maxWidth: 320,
                                marginBottom: 12
                            }}
                        >
                            <Select
                                options={[
                                    {
                                        value: "USER",
                                        label: "Viewer’s time zone"
                                    },
                                    {
                                        value: "ADVERTISER",
                                        label: "Ad account time zone"
                                    }
                                ]}
                            />
                        </Form.Item>

                        <div className="campaigns-adset-schedule-grid-scroll">
                            <AdScheduleGrid
                                selectedCells={selectedScheduleCells}
                                onCommit={updateScheduleCells}
                            />
                        </div>

                        {scheduleErrorByAdset[adsetScheduleId] && (
                            <div
                                style={{
                                    color: "#ff4d4f",
                                    marginTop: 8,
                                    fontSize: 12
                                }}
                            >
                                Please select at least one valid time slot and day
                            </div>
                        )}
                    </div>
                )}

                {beneficiaryAndPayerEnabled && (
                    <div className="campaigns-beneficiary-payer">
                        <div className="campaigns-beneficiary-payer-header">
                            <span className="campaigns-beneficiary-payer-label">
                                <span style={{ color: "red" }}>*</span> Beneficiary
                            </span>

                            <Tooltip
                                placement="top"
                                title="Value must be Page ID or BM ID"
                                styles={{
                                    root: {
                                        backgroundColor: theme === "dark" ? "#111" : "#fff",
                                        color: theme === "dark" ? "#fff" : "#000"
                                    }
                                }}
                            >
                                <InfoCircleOutlined
                                    style={{
                                        color: theme === "dark" ? "#bbb" : "#888"
                                    }}
                                />
                            </Tooltip>

                            <Form.Item
                                name={[index, "selectedAccount"]}
                                rules={[{
                                    required: true,
                                    message: "Select account"
                                }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    size="small"
                                    placeholder="Select account"
                                    style={{ width: 170 }}
                                    options={normalizeList(watchedAccountList).map(account => ({
                                        label: account,
                                        value: account
                                    }))}
                                    className={`${theme === "dark"
                                        ? "dark-theme"
                                        : "light-theme"
                                        } green-border-select`}
                                />
                            </Form.Item>

                            {normalizeList(watchedAccountList).length > 1 && (
                                <Popover
                                    trigger="click"
                                    content={
                                        <div style={{
                                            display: "flex",
                                            gap: 8
                                        }}>
                                            <Button
                                                size="small"
                                                onClick={onClickShareBeneficiaryAndPayerForAllAccount}
                                            >
                                                Share with all accounts
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={onClickClearAllAccounts}
                                            >
                                                Clear all
                                            </Button>
                                        </div>
                                    }
                                >
                                    <Button
                                        size="small"
                                        type="text"
                                        icon={<ShareAltOutlined />}
                                    />
                                </Popover>
                            )}
                        </div>

                        {normalizeList(watchedAccountList).map((account) => (
                            <div
                                key={account}
                                style={{
                                    display: selectedAccount === account ? "block" : "none",
                                }}
                            >
                                <Row gutter={12}>
                                    <Col xs={12}>
                                        <Form.Item
                                            name={[index, "Beneficiary", account]}
                                            label={`Beneficiary (${account})`}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please enter Beneficiary.",
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Enter Beneficiary ID" />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={12}>
                                        <Form.Item
                                            name={[index, "Payer", account]}
                                            label={`Payer (${account})`}
                                            rules={[
                                                {
                                                    required: showPayer,
                                                    message: "Please enter Payer.",
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Enter Payer ID" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </div>
                )}

                {/* Existing AdLevel form list remains intentionally commented out. */}
                <div className="campaigns-adset-ads">
                    {/* <Form.List name={[index, "ads"]}>
                        {(adFields, { remove }) => (
                            <>
                                {[
                                    ...adFields.filter(field =>
                                        isLibraryCreativeAd(
                                            form.getFieldValue([
                                                "adsets",
                                                index,
                                                "ads",
                                                field.name
                                            ])
                                        )
                                    ),
                                    ...adFields.filter(field =>
                                        !isLibraryCreativeAd(
                                            form.getFieldValue([
                                                "adsets",
                                                index,
                                                "ads",
                                                field.name
                                            ])
                                        )
                                    ),
                                ].map((adField, renderIndex) => {
                                    const adPath = [
                                        "adsets",
                                        index,
                                        "ads",
                                        adField.name,
                                    ];

                                    return (
                                        <div
                                            key={adField.key}
                                            style={{ marginBottom: 12 }}
                                        >
                                            <AdLevel
                                                form={form}
                                                network={network}
                                                adsetId={form.getFieldValue(["adsets", index, "id"])}
                                                adsetIndex={index}
                                                adIndex={adField.name}
                                                field={adField}
                                                adPath={adPath}
                                                mode={mode}
                                                selectedAccounts={selectedAccounts}
                                                pagesByAccount={pagesByAccount}
                                                multiplePage={multiplePage}
                                                removeAd={() => remove(adField.name)}
                                                onBatchCreate={newFiles => {
                                                    const currentAdsetName =
                                                        form.getFieldValue([
                                                            "adsets",
                                                            index,
                                                            "AdsetName",
                                                        ]) || "";

                                                    return {
                                                        ...source,
                                                        id:
                                                            globalThis.crypto?.randomUUID?.() ||
                                                            `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                                                        AdName: currentAdsetName,
                                                        AddName: currentAdsetName,
                                                        textOverridesEnabled: false,
                                                        media: {
                                                            images: isVideo ? [] : [file],
                                                            videos: isVideo ? [file] : [],
                                                            thumbnail: null,
                                                        },
                                                        accountSettings: Object.fromEntries(
                                                            Object.entries(source.accountSettings || {}).map(([key, value]) => [
                                                                key,
                                                                {
                                                                    ...value,
                                                                    creativeOverrides: {
                                                                        ...(value?.creativeOverrides || {}),
                                                                    },
                                                                },
                                                            ])
                                                        ),
                                                    };
                                                }}
                                                userData={userData}
                                                auth={auth}
                                                theme={theme}
                                                username={username}
                                                showCreativeStrip={renderIndex === 0}
                                                pageidList={pageidList}
                                                page_id_list={page_id_list}
                                            />
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </Form.List> */}
                    <Form.List name={[index, "ads"]}>
                        {(adFields, { remove }) => {
                            const orderedAdFields = [
                                ...adFields.filter((field) =>
                                    isLibraryCreativeAd(
                                        form.getFieldValue([
                                            "adsets",
                                            index,
                                            "ads",
                                            field.name,
                                        ])
                                    )
                                ),
                                ...adFields.filter(
                                    (field) =>
                                        !isLibraryCreativeAd(
                                            form.getFieldValue([
                                                "adsets",
                                                index,
                                                "ads",
                                                field.name,
                                            ])
                                        )
                                ),
                            ];

                            const visibleAdFields = isDynamicCreative
                                ? adFields.slice(0, 1)
                                : orderedAdFields;

                            return (
                                <>
                                    {visibleAdFields.map((adField, renderIndex) => {
                                        const adPath = [
                                            "adsets",
                                            index,
                                            "ads",
                                            adField.name,
                                        ];

                                        return (
                                            <div
                                                key={adField.key}
                                                style={{ marginBottom: 12 }}
                                            >
                                                <AdLevel
                                                    form={form}
                                                    network={network}
                                                    adsetId={form.getFieldValue([
                                                        "adsets",
                                                        index,
                                                        "id",
                                                    ])}
                                                    adsetIndex={index}
                                                    adIndex={adField.name}
                                                    field={adField}
                                                    adPath={adPath}
                                                    mode={mode}
                                                    selectedAccounts={selectedAccounts}
                                                    pagesByAccount={pagesByAccount}
                                                    removeAd={() => remove(adField.name)}
                                                    onBatchCreate={newFiles => {
                                                        const currentAdsetName =
                                                            form.getFieldValue([
                                                                "adsets",
                                                                index,
                                                                "AdsetName",
                                                            ]) || "";

                                                        return {
                                                            ...source,
                                                            id:
                                                                globalThis.crypto?.randomUUID?.() ||
                                                                `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                                                            AdName: currentAdsetName,
                                                            AddName: currentAdsetName,
                                                            textOverridesEnabled: false,
                                                            media: {
                                                                images: isVideo ? [] : [file],
                                                                videos: isVideo ? [file] : [],
                                                                thumbnail: null,
                                                            },
                                                            accountSettings: Object.fromEntries(
                                                                Object.entries(source.accountSettings || {}).map(([key, value]) => [
                                                                    key,
                                                                    {
                                                                        ...value,
                                                                        creativeOverrides: {
                                                                            ...(value?.creativeOverrides || {}),
                                                                        },
                                                                    },
                                                                ])
                                                            ),
                                                        };
                                                    }}
                                                    userData={userData}
                                                    auth={auth}
                                                    theme={theme}
                                                    username={username}
                                                    showCreativeStrip={renderIndex === 0}
                                                    pageidList={pageidList}
                                                    page_id_list={page_id_list}
                                                    multiplePage={multiplePage}
                                                />
                                            </div>
                                        );
                                    })}
                                </>
                            );
                        }}
                    </Form.List>
                </div>
            </div>
        </>
    );
};


export default AdSetLevel;