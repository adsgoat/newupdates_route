
"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import axios from "axios";
import {
    Badge,
    Divider,
    Dropdown,
    Menu,
    notification,
} from "antd";

import {
    BellOutlined,
    CloseOutlined,
} from "@ant-design/icons";

import {
    FaVolumeMute,
    FaVolumeUp,
} from "react-icons/fa";

import moment from "moment-timezone";
import { io } from "socket.io-client";
import ReusableButton from "@/components/topbar/reusablebutton";
import ReusableModal from "@/components/topbar/modal";




// ======================================================
// SOCKET
// ======================================================

const socket = io(
    "https://app.vyaktimetrics.com",
    {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        randomizationFactor: 0.5,
    }
);



// ======================================================
// NOTIFICATION DROPDOWN
// ======================================================

export default function NotificationDropdown({
    userdetails,
    theme,
    email

}) {

    const darkMode =
        theme === "dark";


    // ==================================================
    // ANT DESIGN NOTIFICATION
    // ==================================================

    const [
        api,
        contextHolder,
    ] = notification.useNotification();


    // ==================================================
    // STATE
    // ==================================================

    const [
        notifications,
        setNotifications,
    ] = useState({});

    const [
        isMuted,
        setIsMuted,
    ] = useState(false);

    const [
        expandedIndex,
        setExpandedIndex,
    ] = useState(null);

    const [
        hoveredIndex,
        setHoveredIndex,
    ] = useState(null);

    const [
        showAll,
        setShowAll,
    ] = useState(false);

    const [
        previewUrl,
        setPreviewUrl,
    ] = useState(null);

    const [
        isPreviewVisible,
        setIsPreviewVisible,
    ] = useState(false);


    // ==================================================
    // REFS
    // ==================================================

    const prevNotificationsRef =
        useRef({});

    const isMutedRef =
        useRef(false);

    const themeForNotifications =
        useRef(theme);


    // ==================================================
    // USER EMAIL
    // ==================================================




    // ==================================================
    // UPDATE THEME REF
    // ==================================================

    useEffect(() => {

        themeForNotifications.current =
            theme;

    }, [theme]);


    // ==================================================
    // UPDATE MUTE REF
    // ==================================================

    useEffect(() => {

        isMutedRef.current =
            isMuted;

    }, [isMuted]);


    // ==================================================
    // PLAY NOTIFICATION SOUND
    // ==================================================

    const playNotificationSound =
        useCallback(() => {

            const audio = new Audio("/notification_sounds.mp3");

            audio
                .play()
                .catch((error) => {
                    console.error(
                        "Notification sound error:",
                        error
                    );
                });

        }, []);


    // ==================================================
    // FETCH NOTIFICATIONS
    // ==================================================

    const fetchNotifications = useCallback(async () => {
        if (!email) {
            console.log("Notification email is missing");
            return {};
        }

        try {
            console.log("Notification email from props:", email);

            const response = await fetch(
                "/api/topbar/getnotifications",
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                console.error(
                    "Notification API failed:",
                    response.status,
                    errorData
                );

                return {};
            }

            const data = await response.json();

            console.log(
                "NOTIFICATION API RESPONSE:",
                data
            );

            const result =
                data?.notifications &&
                    typeof data.notifications === "object"
                    ? data.notifications
                    : data;

            return (
                result &&
                    typeof result === "object"
                    ? result
                    : {}
            );
        } catch (error) {
            console.error(
                "Error fetching notifications:",
                error
            );

            return {};
        }
    }, [email]);


    // ==================================================
    // INITIAL FETCH
    // ==================================================

    useEffect(() => {

        if (!email) {
            return;
        }


        let mounted = true;


        const loadNotifications =
            async () => {

                const initial =
                    await fetchNotifications();


                if (!mounted) {
                    return;
                }


                /*
                 * Set UI.
                 */

                setNotifications(
                    initial || {}
                );


                /*
                 * IMPORTANT:
                 *
                 * Initial notifications should
                 * NOT create popup notifications.
                 *
                 * They are only used as the
                 * previous state.
                 */

                prevNotificationsRef.current =
                    initial || {};
            };


        loadNotifications();


        return () => {
            mounted = false;
        };

    }, [
        email,
        fetchNotifications,
    ]);


    // ==================================================
    // FETCH SOUND SETTING
    // ==================================================

    useEffect(() => {

        if (
            !email
        ) {
            return;
        }


        let mounted = true;


        const fetchNotificationSound = async () => {
            try {
                const response = await fetch(
                    "/api/topbar/getnotificationsound",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!mounted) {
                    return;
                }

                if (!response.ok) {
                    const errorData =
                        await response
                            .json()
                            .catch(() => ({}));

                    console.error(
                        "Notification sound API failed:",
                        response.status,
                        errorData
                    );

                    return;
                }

                const data =
                    await response.json();

                console.log(
                    "Notification sound response:",
                    data
                );

                const muted =
                    data?.notificationSound ===
                    "true";

                setIsMuted(muted);

                isMutedRef.current = muted;
            } catch (error) {
                console.error(
                    "Failed to load notification sound setting:",
                    error
                );
            }
        };

        fetchNotificationSound();




        return () => {
            mounted = false;
        };

    }, [
        email,

    ]);


    // ==================================================
    // TOGGLE MUTE
    // ==================================================

    const toggleMute = async (event) => {
        event.stopPropagation();

        const newMuteState = !isMuted;

        // Update UI immediately
        setIsMuted(newMuteState);
        isMutedRef.current = newMuteState;

        try {
            const response = await fetch(
                "/api/topbar/updatenotificationsound",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isMuted: newMuteState,
                    }),
                }
            );

            if (!response.ok) {
                const errorData =
                    await response
                        .json()
                        .catch(() => ({}));

                console.error(
                    "Failed to update sound setting:",
                    errorData
                );

                throw new Error(
                    "Failed to update sound setting"
                );
            }

            const data =
                await response.json();

            console.log(
                "Notification sound updated:",
                data
            );
        } catch (error) {
            console.error(
                "Failed to update sound setting:",
                error
            );

            // Restore previous state
            setIsMuted(!newMuteState);
            isMutedRef.current = !newMuteState;
        }
    };

    // ==================================================
    // SHOW NEW NOTIFICATION POPUP
    // ==================================================

    const showAllAntdNotificationsSequentially =
        useCallback(
            (newItems) => {

                if (
                    !Array.isArray(
                        newItems
                    ) ||
                    newItems.length === 0
                ) {
                    return;
                }


                newItems.forEach(
                    (notif, index) => {

                        setTimeout(
                            () => {

                                /*
                                 * Sound
                                 */

                                if (
                                    !isMutedRef.current
                                ) {
                                    playNotificationSound();
                                }


                                /*
                                 * Ant Design popup
                                 */

                                api.open({
                                    key:
                                        `notify-${Date.now()}-${index}`,
                                    title: (
                                        <span
                                            style={{
                                                color:
                                                    themeForNotifications.current === "dark"
                                                        ? "#fff"
                                                        : "#000",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {notif?._category || "Notification"}
                                        </span>
                                    ),


                                    description:
                                        notif?.message ||
                                        notif?.title ||
                                        "",

                                    placement:
                                        "topRight",

                                    duration:
                                        5,

                                    pauseOnHover:
                                        true,

                                    showProgress:
                                        true,

                                    className:
                                        themeForNotifications
                                            .current ===
                                            "dark"
                                            ? "custom-dark-notification"
                                            : "",
                                });

                            },
                            index * 500
                        );
                    }
                );

            },
            [
                api,
                playNotificationSound,
            ]
        );


    // ==================================================
    // SOCKET SETUP
    // ==================================================

    useEffect(() => {

        if (!email) {
            return;
        }


        /*
         * Register user.
         */

        const registerUser =
            () => {

                socket.emit(
                    "register",
                    email
                );
            };


        /*
         * Socket already connected.
         */

        if (socket.connected) {
            registerUser();
        }


        /*
         * Connect / reconnect.
         */

        const handleConnect =
            () => {

                registerUser();
            };


        socket.on(
            "connect",
            handleConnect
        );


        /*
         * Notification update.
         */

        const handleUpdate =
            async () => {

                const newNotifications =
                    await fetchNotifications();


                const oldNotifications =
                    prevNotificationsRef.current ||
                    {};


                const newlyAdded = [];


                /*
                 * Compare each notification
                 * category.
                 */

                for (
                    const category of Object.keys(
                        newNotifications || {}
                    )
                ) {

                    const newItems =
                        Array.isArray(
                            newNotifications[
                            category
                            ]
                        )
                            ? newNotifications[
                            category
                            ]
                            : [];


                    const oldItems =
                        Array.isArray(
                            oldNotifications[
                            category
                            ]
                        )
                            ? oldNotifications[
                            category
                            ]
                            : [];


                    /*
                     * Find newly added
                     * notifications.
                     */

                    const newInCategory =
                        newItems.filter(
                            (newItem) => {

                                return !oldItems.some(
                                    (oldItem) => {

                                        /*
                                         * First compare ID.
                                         */

                                        if (
                                            newItem?.id &&
                                            oldItem?.id
                                        ) {

                                            return (
                                                newItem.id ===
                                                oldItem.id
                                            );
                                        }


                                        /*
                                         * Fallback comparison.
                                         */

                                        return (
                                            oldItem?.message ===
                                            newItem?.message &&
                                            new Date(
                                                oldItem?.date
                                            ).getTime() ===
                                            new Date(
                                                newItem?.date
                                            ).getTime()
                                        );
                                    }
                                );
                            }
                        );


                    /*
                     * Add category name.
                     */

                    newInCategory.forEach(
                        (item) => {

                            newlyAdded.push({
                                ...item,

                                _category:
                                    category,
                            });

                        }
                    );
                }


                /*
                 * Your old behavior:
                 *
                 * If multiple notifications arrive,
                 * show only the latest one.
                 */

                if (
                    newlyAdded.length > 0
                ) {

                    const latestNotification =
                        newlyAdded.reduce(
                            (
                                latest,
                                current
                            ) => {

                                const latestTime =
                                    new Date(
                                        latest?.date
                                    ).getTime();


                                const currentTime =
                                    new Date(
                                        current?.date
                                    ).getTime();


                                return (
                                    currentTime >
                                    latestTime
                                )
                                    ? current
                                    : latest;

                            }
                        );


                    showAllAntdNotificationsSequentially(
                        [
                            latestNotification,
                        ]
                    );
                }


                /*
                 * Save current state
                 * for next comparison.
                 */

                prevNotificationsRef.current =
                    newNotifications || {};


                /*
                 * Update dropdown.
                 */

                setNotifications(
                    newNotifications || {}
                );

            };


        socket.on(
            "notifications_updated",
            handleUpdate
        );


        /*
         * Cleanup.
         */

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "notifications_updated",
                handleUpdate
            );

        };

    }, [
        email,
        fetchNotifications,
        showAllAntdNotificationsSequentially,
    ]);


    // ==================================================
    // MARK ONE AS SEEN
    // ==================================================

    const onClickNotificationView = async (item, key) => {
        if (!item || !key) {
            return false;
        }

        try {
            const response = await fetch(
                "/api/topbar/notificationview",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        key,
                        item,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({}));

                console.error(
                    "Failed to mark notification as seen:",
                    response.status,
                    errorData
                );

                return false;
            }

            return true;
        } catch (error) {
            console.error(
                "Failed to mark notification as seen:",
                error
            );

            return false;
        }
    };


    // ==================================================
    // MARK ALL AS SEEN
    // ==================================================

    const handleClearAll = async (event) => {
        event.stopPropagation();

        try {
            const response = await fetch(
                "/api/topbar/markallnotifications",
                {
                    method: "PUT",
                }
            );

            if (!response.ok) {
                const errorData =
                    await response.json().catch(() => ({}));

                console.error(
                    "Failed to mark all as seen:",
                    errorData
                );

                throw new Error(
                    "Failed to mark all notifications as seen"
                );
            }

            /*
             * Fetch the latest DB state.
             */
            const freshNotifications =
                await fetchNotifications();


            prevNotificationsRef.current =
                freshNotifications || {};

            setNotifications(
                freshNotifications || {}
            );


            setExpandedIndex(null);
        } catch (error) {
            console.error(
                "❌ Failed to mark all as seen:",
                error
            );
        }
    };


    // ==================================================
    // EXPAND CATEGORY
    // ==================================================

    const handleExpand =
        (index) => {

            setExpandedIndex(
                index === expandedIndex
                    ? null
                    : index
            );

        };


    // ==================================================
    // CATEGORY LIST
    // ==================================================

    const items =
        Object.entries(
            notifications || {}
        )
            .filter(
                ([, value]) =>
                    Array.isArray(value)
            )
            .map(
                ([key, value]) => ({
                    label: key,
                    count:
                        value.length,
                    color:
                        "#EC7117",
                })
            );


    const displayedItems =
        showAll
            ? items
            : items.slice(
                0,
                5
            );


    // ==================================================
    // TOTAL COUNT
    // ==================================================

    const notificationCount =
        Object.values(
            notifications || {}
        )
            .filter(
                Array.isArray
            )
            .flat()
            .length;


    // ==================================================
    // NOTIFICATION MENU
    // ==================================================

    const menu = (

        <Menu
            className="notification-menu"
            style={{
                color: darkMode ? "#fff" : "#000",
                borderRadius: 8,
                width: "min(280px, calc(100vw - 24px))",
                maxWidth: "calc(100vw - 24px)",
                paddingBottom: 0,
                background: darkMode ? "#333" : "#fff",
            }}
        >

            {/* ==========================================
                HEADER
            ========================================== */}

            <Menu.Item
                key="notification-header"
            >

                <div
                    style={{
                        display:
                            "flex",

                        justifyContent:
                            "space-between",

                        alignItems:
                            "center",
                    }}
                >

                    <span
                        style={{
                            color:
                                darkMode
                                    ? "#fff"
                                    : "#000",

                            fontWeight:
                                500,
                        }}
                    >
                        Notifications
                    </span>


                    <span
                        onClick={
                            toggleMute
                        }

                        style={{
                            display:
                                "flex",

                            alignItems:
                                "center",

                            cursor:
                                "pointer",
                        }}
                    >

                        {isMuted ? (
                            <FaVolumeMute
                                size={18}
                                style={{
                                    color: darkMode ? "#fff" : "#333",
                                    cursor: "pointer",
                                }}
                            />
                        ) : (
                            <FaVolumeUp
                                size={18}
                                style={{
                                    color: darkMode ? "#fff" : "#333",
                                    cursor: "pointer",
                                }}
                            />
                        )}

                    </span>

                </div>

            </Menu.Item>


            <Menu.Divider
                style={{
                    borderTop:
                        `1px solid ${darkMode
                            ? "#808080"
                            : "#ccc"
                        }`,
                }}
            />


            {/* ==========================================
                CATEGORY LIST
            ========================================== */}

            <Menu.Item
                key="notification-list"
                style={{
                    padding: 0,
                }}
            >

                <div
                    style={{
                        maxHeight:
                            240,

                        overflowY:
                            "auto",

                        background:
                            darkMode
                                ? "#333"
                                : "#fff",
                    }}
                >

                    {displayedItems.length ===
                        0 ? (

                        <div
                            style={{
                                padding:
                                    "25px 15px",

                                textAlign:
                                    "center",

                                color:
                                    darkMode
                                        ? "#aaa"
                                        : "#888",

                                fontSize:
                                    13,
                            }}
                        >
                            No notifications
                        </div>

                    ) : (

                        displayedItems.map(
                            (
                                {
                                    label,
                                    count,
                                    color,
                                },
                                index
                            ) => {

                                const categoryNotifications =
                                    Array.isArray(
                                        notifications[
                                        label
                                        ]
                                    )
                                        ? [
                                            ...notifications[
                                            label
                                            ],
                                        ]
                                        : [];


                                /*
                                 * Latest notification first.
                                 */

                                categoryNotifications.sort(
                                    (
                                        a,
                                        b
                                    ) => {

                                        return (
                                            moment(
                                                b?.date,
                                                "DD-MM-YYYY hh:mm A"
                                            ).valueOf() -
                                            moment(
                                                a?.date,
                                                "DD-MM-YYYY hh:mm A"
                                            ).valueOf()
                                        );

                                    }
                                );


                                return (

                                    <div
                                        key={
                                            `${label}-${index}`
                                        }
                                    >

                                        {/* CATEGORY */}

                                        <div
                                            onClick={(
                                                event
                                            ) => {

                                                event.stopPropagation();

                                                handleExpand(
                                                    index
                                                );

                                            }}

                                            onMouseEnter={() =>
                                                setHoveredIndex(
                                                    index
                                                )
                                            }

                                            onMouseLeave={() =>
                                                setHoveredIndex(
                                                    null
                                                )
                                            }

                                            style={{
                                                display:
                                                    "flex",

                                                justifyContent:
                                                    "space-between",

                                                alignItems:
                                                    "center",

                                                padding:
                                                    "8px 16px",

                                                cursor:
                                                    "pointer",

                                                color:
                                                    expandedIndex ===
                                                        index ||
                                                        hoveredIndex ===
                                                        index
                                                        ? "#91C25F"
                                                        : darkMode
                                                            ? "#fff"
                                                            : "#000",

                                                textDecoration:
                                                    expandedIndex ===
                                                        index
                                                        ? "underline"
                                                        : "none",

                                                transition:
                                                    "color 0.2s ease",
                                            }}
                                        >

                                            <span>
                                                {label}
                                            </span>


                                            <Badge
                                                count={
                                                    count
                                                }

                                                style={{

                                                    backgroundColor: "#EC7117",
                                                    color:
                                                        darkMode
                                                            ? "#000"
                                                            : "#fff",

                                                    border:
                                                        "1px solid #EC7117",
                                                }}
                                            />

                                        </div>


                                        {/* ==================================
                                            EXPANDED ITEMS
                                        ================================== */}

                                        {expandedIndex ===
                                            index && (

                                                <div>

                                                    {categoryNotifications.map(
                                                        (
                                                            item,
                                                            subIdx
                                                        ) => (

                                                            <div
                                                                key={
                                                                    `sub-${label}-${subIdx}-${item?.id || item?.date}`
                                                                }

                                                                style={{
                                                                    display:
                                                                        "flex",

                                                                    flexDirection:
                                                                        "column",

                                                                    padding:
                                                                        "12px 16px",

                                                                    marginBottom:
                                                                        10,

                                                                    borderRadius:
                                                                        6,

                                                                    fontSize:
                                                                        14,

                                                                    color:
                                                                        darkMode
                                                                            ? "#fff"
                                                                            : "#444",

                                                                    minHeight:
                                                                        80,
                                                                }}
                                                            >

                                                                {/* DATE + CLOSE */}

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",

                                                                        justifyContent:
                                                                            "flex-end",

                                                                        alignItems:
                                                                            "center",

                                                                        fontSize:
                                                                            12,
                                                                    }}
                                                                >

                                                                    <span>
                                                                        {
                                                                            item?.date
                                                                        }
                                                                    </span>


                                                                    <CloseOutlined
                                                                        style={{
                                                                            marginLeft:
                                                                                8,

                                                                            cursor:
                                                                                "pointer",

                                                                            color:
                                                                                "#999",

                                                                            fontSize:
                                                                                12,
                                                                        }}

                                                                        onClick={async (event) => {
                                                                            event.stopPropagation();

                                                                            const success = await onClickNotificationView(
                                                                                item,
                                                                                label
                                                                            );

                                                                            if (!success) {
                                                                                return;
                                                                            }

                                                                            setNotifications((previous) => {
                                                                                const updated = { ...previous };

                                                                                updated[label] = (updated[label] || []).filter((currentItem) => {
                                                                                    if (item?.id && currentItem?.id) {
                                                                                        return currentItem.id !== item.id;
                                                                                    }

                                                                                    return !(
                                                                                        currentItem?.message === item?.message &&
                                                                                        currentItem?.date === item?.date &&
                                                                                        currentItem?.title === item?.title
                                                                                    );
                                                                                });

                                                                                return updated;
                                                                            });
                                                                        }}
                                                                    />

                                                                </div>


                                                                {/* CONTENT */}

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",

                                                                        justifyContent:
                                                                            "space-between",

                                                                        alignItems:
                                                                            "center",
                                                                    }}
                                                                >

                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                12,

                                                                            flex:
                                                                                1,

                                                                            marginRight:
                                                                                10,

                                                                            width:
                                                                                "100%",
                                                                        }}
                                                                    >

                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "flex",

                                                                                flexDirection:
                                                                                    "column",

                                                                                gap:
                                                                                    8,
                                                                            }}
                                                                        >

                                                                            {/* TITLE */}

                                                                            <div
                                                                                className="notification-title"
                                                                                style={{
                                                                                    fontWeight:
                                                                                        "bold",

                                                                                    fontSize:
                                                                                        16,

                                                                                    color:
                                                                                        darkMode
                                                                                            ? "#fff"
                                                                                            : "#333",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item?.title
                                                                                }
                                                                            </div>


                                                                            {/* MESSAGE */}

                                                                            <div
                                                                                className="notification-message"
                                                                                style={{
                                                                                    fontSize:
                                                                                        14,

                                                                                    color:
                                                                                        darkMode
                                                                                            ? "#fff"
                                                                                            : "#333",

                                                                                    wordWrap:
                                                                                        "break-word",

                                                                                    overflowWrap:
                                                                                        "break-word",

                                                                                    whiteSpace:
                                                                                        "pre-wrap",

                                                                                    wordBreak:
                                                                                        "break-word",

                                                                                    maxWidth:
                                                                                        "100%",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item?.message
                                                                                }
                                                                            </div>


                                                                            {/* IMAGE / VIDEO */}

                                                                            {item?.imageUrl && (

                                                                                item.imageUrl
                                                                                    .toLowerCase()
                                                                                    .includes(
                                                                                        ".mp4"
                                                                                    ) ? (

                                                                                    <video
                                                                                        controls
                                                                                        src={
                                                                                            item.imageUrl
                                                                                        }

                                                                                        style={{
                                                                                            width:
                                                                                                "100%",

                                                                                            height:
                                                                                                200,

                                                                                            objectFit:
                                                                                                "cover",

                                                                                            borderRadius:
                                                                                                8,

                                                                                            cursor:
                                                                                                "pointer",
                                                                                        }}

                                                                                        onClick={(
                                                                                            event
                                                                                        ) => {

                                                                                            event.stopPropagation();

                                                                                            setPreviewUrl(
                                                                                                item.imageUrl
                                                                                            );

                                                                                            setIsPreviewVisible(
                                                                                                true
                                                                                            );

                                                                                        }}
                                                                                    />

                                                                                ) : (

                                                                                    <img
                                                                                        src={
                                                                                            item.imageUrl
                                                                                        }

                                                                                        alt="Notification"

                                                                                        style={{
                                                                                            width:
                                                                                                "100%",

                                                                                            height:
                                                                                                200,

                                                                                            objectFit:
                                                                                                "cover",

                                                                                            borderRadius:
                                                                                                8,

                                                                                            cursor:
                                                                                                "pointer",
                                                                                        }}

                                                                                        onClick={(
                                                                                            event
                                                                                        ) => {

                                                                                            event.stopPropagation();

                                                                                            setPreviewUrl(
                                                                                                item.imageUrl
                                                                                            );

                                                                                            setIsPreviewVisible(
                                                                                                true
                                                                                            );

                                                                                        }}
                                                                                    />

                                                                                )

                                                                            )}

                                                                        </div>


                                                                        <Divider
                                                                            style={{
                                                                                margin:
                                                                                    "3px 0",

                                                                                borderColor:
                                                                                    darkMode
                                                                                        ? "#808080"
                                                                                        : "#ccc",
                                                                            }}
                                                                        />

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            )}

                                    </div>

                                );

                            }
                        )

                    )}

                </div>

            </Menu.Item>


            {/* ==========================================
                FOOTER
            ========================================== */}

            <Menu.Divider
                style={{
                    borderTop:
                        `1px solid ${darkMode
                            ? "#808080"
                            : "#ccc"
                        }`,
                }}
            />


            <Menu.Item
                key="mark-all"
                style={{
                    padding: 0,
                }}
            >

                <div
                    style={{
                        display:
                            "flex",

                        justifyContent:
                            "flex-end",

                        alignItems:
                            "center",

                        padding:
                            "10px 16px",
                    }}
                >

                    <ReusableButton
                        type="primary"
                        theme={theme}
                        style={{
                            backgroundColor:
                                "#91C25F",

                            color:
                                "#000",

                            border:
                                "none",

                            boxShadow:
                                "none",

                            height:
                                25,

                            fontSize:
                                12,
                        }}

                        onClick={
                            handleClearAll
                        }
                    >
                        Mark all as seen
                    </ReusableButton>

                </div>

            </Menu.Item>

        </Menu>
    );


    // ==================================================
    // PREVIEW MODAL
    // ==================================================

    const previewModal = (

        <ReusableModal
            open={
                isPreviewVisible
            }

            footer={
                null
            }

            onCancel={() =>
                setIsPreviewVisible(
                    false
                )
            }

            centered

            width="100%"

            zIndex={3000}
            theme={theme}
            getContainer={
                typeof document !==
                    "undefined"
                    ? document.body
                    : undefined
            }

            // bodyStyle={{
            //     margin: 0,

            //     padding: 0,

            //     overflow:
            //         "hidden",
            // }}

            style={{
                maxWidth:
                    "80vw",
            }}
        >

            {previewUrl
                ?.toLowerCase()
                .includes(".mp4") ? (

                <video
                    src={
                        previewUrl
                    }

                    controls

                    style={{
                        width:
                            "100%",

                        height:
                            "80vh",

                        objectFit:
                            "contain",

                        borderRadius:
                            8,
                    }}
                />

            ) : (

                <img
                    src={
                        previewUrl
                    }

                    alt="Preview"

                    style={{
                        width:
                            "100%",

                        height:
                            "90vh",

                        objectFit:
                            "contain",

                        borderRadius:
                            8,
                    }}
                />

            )}

        </ReusableModal>
    );


    // ==================================================
    // RETURN
    // ==================================================

    return (
        <>
            {contextHolder}

            <Dropdown
                popupRender={() =>
                    menu
                }

                trigger={[
                    "click",
                ]}

                placement="bottomRight"
                classNames={{
                    root: "notification-dropdown",
                }}
            >

                <div
                    className="notification-trigger"
                    style={{
                        position: "relative",
                        cursor: "pointer",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >

                    <BellOutlined
                        style={{
                            fontSize:
                                18,

                            color:
                                darkMode
                                    ? "#fff"
                                    : "#000",
                        }}
                    />


                    {notificationCount >
                        0 && (

                            <Badge
                                count={
                                    notificationCount > 99
                                        ? "99+"
                                        : notificationCount
                                }
                                overflowCount={99}
                                style={{
                                    position: "absolute",
                                    top: -20,
                                    right: -13,
                                    minWidth: "20px",
                                    height: "20px",
                                    lineHeight: "20px",
                                    padding: "0 5px",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    borderRadius: "10px",
                                    zIndex: 10,
                                }}
                            />
                        )}

                </div>

            </Dropdown>

            {previewModal}

        </>
    );
}

