"use client";

import { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import moment from "moment-timezone";
import ct from "countries-and-timezones";

import {
    Drawer,
    Card,
    Row,
    Col,
    Space,
    Typography,
    Spin,
    Dropdown,
    theme as antdTheme,
} from "antd";
import ReusableButton from "@/components/topbar/reusablebutton";
import ReusableSelect from "@/components/topbar/select";
import {
    LeftOutlined,
    RightOutlined,
    SettingOutlined,
    CloseOutlined,
    StarOutlined,
    StarFilled,
} from "@ant-design/icons";

import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";

const { Text } = Typography;
const { useToken } = antdTheme;
import "../../../styles/topbar.css"

export default function WorldTimeBuddy({
    open,
    onClose,
    theme,
}) {
    const { token: antdToken } = useToken();

    const [timezones, setTimezones] = useState([]);

    const [selectedTimezones, setSelectedTimezones] =
        useState([
            "Europe/London",
            "Asia/Kolkata",
        ]);

    const [favorites, setFavorites] = useState([]);

    const [now, setNow] =
        useState(DateTime.now());

    const [dayOffset, setDayOffset] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [showTimezones, setShowTimezones] =
        useState(false);

    const [markWeekends, setMarkWeekends] =
        useState(false);

    const [hoveredHourIndex, setHoveredHourIndex] =
        useState(null);

    const scrollRef = useRef(null);

    /*
     * ==============================
     * FETCH TIMEZONES
     * ==============================
     */

    useEffect(() => {
        const fetchZones = async () => {
            try {
                setLoading(true);

                const res = await fetch("/api/topbar/timezones", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch timezones");
                }

                const apiData = await res.json();

                if (!res.ok) {
                    // throw new Error(
                    //     `Timezone API failed: ${res.status}`
                    // );
                }
                const zones =
                    apiData.timezones || [];

                const enriched =
                    zones.map((zone) => {
                        const m =
                            moment().tz(zone);

                        const parts =
                            zone.split("/");

                        const city =
                            parts
                                .pop()
                                ?.replace(
                                    /_/g,
                                    " "
                                ) || zone;

                        const region =
                            parts.join(
                                " / "
                            );

                        const abbr =
                            m.format("z");

                        const offset =
                            m.format("Z");

                        const tzInfo =
                            ct.getTimezone(
                                zone
                            );

                        let country = "";

                        if (
                            tzInfo?.countries
                                ?.length
                        ) {
                            const c =
                                tzInfo
                                    .countries[0];

                            country =
                                ct.getCountry(
                                    c
                                )?.name ||
                                region;
                        } else {
                            country =
                                region || "—";
                        }

                        return {
                            zone,
                            city,
                            country,
                            abbr,
                            offset,
                            searchKey:
                                `${zone} ${city} ${country} ${abbr}`.toLowerCase(),
                        };
                    });

                setTimezones(enriched);
            } catch (err) {
                console.error(
                    "Global Clock timezone error:",
                    err
                );
            } finally {
                setLoading(false);
            }
        };
        fetchZones();

    }, []);

    /*
     * ==============================
     * LIVE CLOCK
     * ==============================
     */

    useEffect(() => {
        const id = setInterval(() => {
            setNow(DateTime.now());
        }, 1000);

        return () => clearInterval(id);
    }, []);

    /*
     * ==============================
     * DATE NAVIGATION
     * ==============================
     */

    const displayNow =
        now.plus({
            days: dayOffset,
        });

    const goToPreviousDay = () => {
        setDayOffset((d) => d - 1);
    };

    const goToNextDay = () => {
        setDayOffset((d) => d + 1);
    };

    const goToToday = () => {
        setDayOffset(0);
    };

    /*
     * ==============================
     * TIMEZONE MANAGEMENT
     * ==============================
     */

    const addTimezone = (zone) => {
        if (
            !selectedTimezones.includes(
                zone
            )
        ) {
            setSelectedTimezones([
                ...selectedTimezones,
                zone,
            ]);
        }
    };

    const removeTimezone = (zone) => {
        setSelectedTimezones(
            selectedTimezones.filter(
                (z) => z !== zone
            )
        );

        /*
         * Also remove from favorites
         * when timezone is removed.
         */
        setFavorites((prev) =>
            prev.filter(
                (z) => z !== zone
            )
        );
    };

    /*
     * ==============================
     * FAVORITES
     * ==============================
     */

    const toggleFavorite = (zone) => {
        const isFav =
            favorites.includes(zone);

        const updated = isFav
            ? favorites.filter(
                (z) => z !== zone
            )
            : [
                zone,
                ...favorites,
            ];

        const reordered = [
            ...updated.filter((z) =>
                selectedTimezones.includes(
                    z
                )
            ),

            ...selectedTimezones.filter(
                (z) =>
                    !updated.includes(z)
            ),
        ];

        setFavorites(updated);

        setSelectedTimezones(
            reordered
        );
    };

    /*
     * ==============================
     * RELATIVE OFFSET
     * ==============================
     */

    const getRelativeOffset = (
        zone
    ) => {
        if (
            !selectedTimezones.length
        ) {
            return "";
        }

        const base =
            now.setZone(
                selectedTimezones[0]
            );

        const target =
            now.setZone(zone);

        const diff =
            (target.offset -
                base.offset) /
            60;

        return diff > 0
            ? `+${diff}`
            : diff.toString();
    };

    /*
     * ==============================
     * ALIGNED HOURS
     * ==============================
     */

    const getAlignedHours = (
        baseZone,
        targetZone,
        displayNow
    ) => {
        const baseNow =
            displayNow.setZone(
                baseZone
            );

        const targetNow =
            displayNow.setZone(
                targetZone
            );

        const offsetDiffHours =
            (targetNow.offset -
                baseNow.offset) /
            60;

        const startOfBaseDay =
            baseNow.startOf(
                "day"
            );

        const startAligned =
            startOfBaseDay.plus({
                hours:
                    offsetDiffHours,
            });

        return Array.from(
            { length: 24 },
            (_, i) => {
                const dt =
                    startAligned.plus({
                        hours: i,
                    });

                const isCurrentHour =
                    dayOffset === 0 &&
                    dt.hasSame(
                        targetNow,
                        "hour"
                    );

                const isNewDay =
                    i > 0 &&
                    dt.day !==
                    startAligned
                        .plus({
                            hours:
                                i - 1,
                        }).day;

                return {
                    dt,
                    isCurrentHour,
                    isNewDay,
                };
            }
        );
    };

    /*
     * ==============================
     * DRAG / DROP
     * ==============================
     */

    const onDragEnd = (
        result
    ) => {
        if (
            !result.destination
        ) {
            return;
        }

        const reordered = [
            ...selectedTimezones,
        ];

        const [moved] =
            reordered.splice(
                result.source.index,
                1
            );

        reordered.splice(
            result.destination.index,
            0,
            moved
        );

        setSelectedTimezones(
            reordered
        );
    };

    /*
     * ==============================
     * SEARCH
     * ==============================
     */

    const filterOption = (
        input,
        option
    ) => {
        return (
            option?.searchKey ??
            ""
        ).includes(
            input.toLowerCase()
        );
    };

    /*
     * ==============================
     * RENDER
     * ==============================
     */

    return (
        <Drawer
            classNames={{
                section: "global-clock-content",
            }}
            open={open}
            onClose={onClose}
            placement="right"
            size="90%"
            title={
                <span
                    style={{
                        color: theme === "dark" ? "#fff" : "#000",
                        fontWeight: 600,
                    }}
                >
                    🌐 Global Clockwise
                </span>
            }
            closeIcon={
                <CloseOutlined
                    style={{
                        color: theme === "dark" ? "#fff" : "#000",
                        fontSize: 16,
                    }}
                />
            }
            destroyOnHidden

            styles={{
                header: {
                    backgroundColor: theme === "dark" ? "#333" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                    borderBottom:
                        theme === "dark"
                            ? "1px solid #555"
                            : "1px solid #f0f0f0",
                },

                body: {
                    padding: 0,
                    backgroundColor:
                        theme === "dark"
                            ? "#333"
                            : "#fff",
                },

                section: {
                    backgroundColor:
                        theme === "dark"
                            ? "#333"
                            : "#fff",
                },
            }}
        >
            <div
                className="global-clock-container"
                style={{
                    padding: 6,
                    maxWidth: 1400,
                    margin: "0 auto",
                    backgroundColor: theme === "dark" ? "#333" : "#fff",
                    minHeight: "100%",
                    fontSize: 12,
                    padding: "10px"
                }}
            >
                {/* TOP CONTROLS */}

                <Row
                    className="global-clock-controls"
                    gutter={[8, 8]}
                    align="middle"
                    style={{
                        marginBottom: 8,
                        fontSize: 12,
                    }}
                >
                    {/* SEARCH */}

                    <Col flex="auto">
                        <ReusableSelect
                            className={`global-clock-search ${theme === "dark" ? "global-clock-search-dark" : ""
                                }`}
                            theme={theme}
                            showSearch
                            loading={loading}
                            placeholder={
                                <span
                                    style={{
                                        color: theme === "dark" ? "#fff" : "#999",
                                    }}
                                >
                                    Search...
                                </span>
                            }
                            dropdownClassName={
                                theme === "dark" ? "custom-dropdown" : undefined
                            }
                            style={{
                                background: theme === "dark" ? "#333" : "#fff",
                                color: theme === "dark" ? "#fff" : "#333",
                                width: "60%",
                                fontSize: 12,
                            }}
                            filterOption={filterOption}
                            onChange={addTimezone}
                            options={timezones
                                .filter(
                                    (tz) => !selectedTimezones.includes(tz.zone)
                                )
                                .map((tz) => ({
                                    value: tz.zone,
                                    label: `${tz.city}, ${tz.country} (${tz.abbr})`,
                                    searchKey: tz.searchKey,
                                }))}
                        />
                    </Col>

                    {/* DATE NAVIGATION */}

                    <Col>
                        <Space>
                            <ReusableButton
                                icon={
                                    <LeftOutlined />
                                }
                                onClick={
                                    goToPreviousDay
                                }
                                style={{
                                    backgroundColor:
                                        theme ===
                                            "dark"
                                            ? "#333"
                                            : "#fff",

                                    border:
                                        "1px solid #91C25F",

                                    color:
                                        theme ===
                                            "dark"
                                            ? "#fff"
                                            : "#333",
                                }}
                            />

                            <Text
                                style={{
                                    color:
                                        theme ===
                                            "dark"
                                            ? "#fff"
                                            : "#000",
                                }}
                            >
                                {displayNow.toFormat(
                                    "ccc, LLL d"
                                )}

                                {dayOffset !==
                                    0
                                    ? " "
                                    : ""}
                            </Text>

                            <ReusableButton
                                icon={
                                    <RightOutlined />
                                }
                                onClick={
                                    goToNextDay
                                }
                                style={{
                                    backgroundColor:
                                        theme ===
                                            "dark"
                                            ? "#333"
                                            : "#fff",

                                    border:
                                        "1px solid #91C25F",

                                    color:
                                        theme ===
                                            "dark"
                                            ? "#91C25F"
                                            : "#2f4f2f",
                                }}
                            />

                            {dayOffset !==
                                0 && (
                                    <ReusableButton
                                        onClick={
                                            goToToday
                                        }
                                        size="small"
                                        style={{
                                            color:
                                                theme ===
                                                    "dark"
                                                    ? "#fff"
                                                    : "#333",
                                        }}
                                    >
                                        Today
                                    </ReusableButton>
                                )}
                        </Space>
                    </Col>

                    {/* SETTINGS */}

                    <Col>
                        <Dropdown
                            trigger={[
                                "click",
                            ]}
                            popupRender={() => (
                                <div
                                    style={{
                                        background:
                                            theme ===
                                                "dark"
                                                ? "#555"
                                                : "#fff",

                                        border:
                                            "1px solid #ddd",

                                        borderRadius: 4,

                                        padding: 8,

                                        boxShadow:
                                            "0 2px 6px rgba(0,0,0,0.15)",

                                        width: 180,
                                    }}
                                >
                                    <label
                                        style={{
                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            gap: 5,

                                            padding: "4px 6px",
                                            fontSize: 12,

                                            cursor:
                                                "pointer",

                                            color:
                                                theme ===
                                                    "dark"
                                                    ? "#fff"
                                                    : "#000",
                                        }}
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                showTimezones
                                            }
                                            onChange={() =>
                                                setShowTimezones(
                                                    !showTimezones
                                                )
                                            }
                                            style={{
                                                accentColor:
                                                    "#91C25F",

                                                height: 16,

                                                width: 16,

                                                cursor:
                                                    "pointer",
                                            }}
                                        />

                                        Show Timezones
                                    </label>

                                    <label
                                        style={{
                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            gap: 8,

                                            padding:
                                                "6px 8px",

                                            cursor:
                                                "pointer",

                                            color:
                                                theme ===
                                                    "dark"
                                                    ? "#fff"
                                                    : "#000",
                                        }}
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                markWeekends
                                            }
                                            onChange={() =>
                                                setMarkWeekends(
                                                    !markWeekends
                                                )
                                            }
                                            style={{
                                                accentColor:
                                                    "#91C25F",

                                                width: 16,

                                                height: 16,

                                                cursor:
                                                    "pointer",
                                            }}
                                        />

                                        Mark Weekends
                                    </label>
                                </div>
                            )}
                        >
                            <ReusableButton
                                icon={
                                    <SettingOutlined />
                                }
                                style={{
                                    backgroundColor:
                                        "#91C25F",

                                    border:
                                        "1px solid #91C25F",

                                    color: "#fff",
                                }}
                            />
                        </Dropdown>
                    </Col>
                </Row>

                {/* CLOCK */}

                {loading ? (
                    <div
                        style={{
                            textAlign:
                                "center",

                            padding: 40,
                        }}
                    >
                        <Spin />{" "}
                        Loading all timezones...
                    </div>
                ) : (
                    <Card
                        styles={{
                            body: {
                                padding: 0,
                                overflow: "hidden",
                            },
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",
                            }}
                            ref={
                                scrollRef
                            }
                        >
                            {/* LEFT TIMEZONE LIST */}

                            <div
                                className="global-clock-timezones"
                                style={{
                                    width: 280,
                                    minWidth: 280,

                                    background:
                                        theme ===
                                            "dark"
                                            ? "#333"
                                            : "#f7f7f7",

                                    borderRight:
                                        `1px solid ${antdToken.colorBorderSecondary}`,
                                }}
                            >
                                <DragDropContext
                                    onDragEnd={
                                        onDragEnd
                                    }
                                >
                                    <Droppable
                                        droppableId="zones"
                                    >
                                        {(
                                            provided
                                        ) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={
                                                    provided.innerRef
                                                }
                                            >
                                                {selectedTimezones.map(
                                                    (
                                                        zone,
                                                        index
                                                    ) => {
                                                        const info =
                                                            timezones.find(
                                                                (
                                                                    t
                                                                ) =>
                                                                    t.zone ===
                                                                    zone
                                                            );

                                                        if (
                                                            !info
                                                        ) {
                                                            return null;
                                                        }

                                                        const zonedTime =
                                                            displayNow.setZone(
                                                                zone
                                                            );

                                                        const offsetRel =
                                                            getRelativeOffset(
                                                                zone
                                                            );

                                                        return (
                                                            <Draggable
                                                                key={
                                                                    zone
                                                                }
                                                                draggableId={
                                                                    zone
                                                                }
                                                                index={
                                                                    index
                                                                }
                                                            >
                                                                {(
                                                                    prov
                                                                ) => (
                                                                    <div
                                                                        ref={
                                                                            prov.innerRef
                                                                        }
                                                                        {...prov.draggableProps}
                                                                        {...prov.dragHandleProps}
                                                                        style={{
                                                                            ...prov
                                                                                .draggableProps
                                                                                .style,

                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            height: 50,
                                                                            paddingLeft: 6,
                                                                            marginBottom: 2,
                                                                            fontSize: 12,
                                                                            borderBottom:
                                                                                `1px solid ${antdToken.colorBorderSecondary}`,
                                                                            background:
                                                                                theme ===
                                                                                    "dark"
                                                                                    ? "#555"
                                                                                    : "#fff",

                                                                            borderRadius: 4,
                                                                            cursor: "grab",
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                width: 50,
                                                                                textAlign:
                                                                                    "right",
                                                                                paddingRight: 8,
                                                                            }}
                                                                        >
                                                                            <Text
                                                                                style={{
                                                                                    color:
                                                                                        theme ===
                                                                                            "dark"
                                                                                            ? "#ccc"
                                                                                            : "#555",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    offsetRel
                                                                                }
                                                                            </Text>
                                                                        </div>

                                                                        <div>
                                                                            <Text
                                                                                style={{
                                                                                    fontWeight: 500,
                                                                                    fontSize: 12,
                                                                                    color:
                                                                                        theme ===
                                                                                            "dark"
                                                                                            ? "#fff"
                                                                                            : "#000",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    info.city
                                                                                }
                                                                            </Text>

                                                                            {showTimezones && (
                                                                                <Text
                                                                                    style={{
                                                                                        color:
                                                                                            theme ===
                                                                                                "dark"
                                                                                                ? "#aaa"
                                                                                                : "#888",

                                                                                        marginLeft: 4,
                                                                                        fontSize: 12,
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        info.abbr
                                                                                    }
                                                                                </Text>
                                                                            )}

                                                                            <br />

                                                                            <Text
                                                                                style={{
                                                                                    fontSize: 12,

                                                                                    color:
                                                                                        theme ===
                                                                                            "dark"
                                                                                            ? "#aaa"
                                                                                            : "#666",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    info.country
                                                                                }
                                                                            </Text>
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                marginLeft:
                                                                                    "auto",

                                                                                paddingRight: 8,

                                                                                textAlign:
                                                                                    "right",
                                                                            }}
                                                                        >
                                                                            <Text
                                                                                style={{
                                                                                    color:
                                                                                        theme ===
                                                                                            "dark"
                                                                                            ? "#fff"
                                                                                            : "#000",
                                                                                    fontSize: 12,
                                                                                }}

                                                                            >
                                                                                {zonedTime.toFormat(
                                                                                    "h:mm a"
                                                                                )}
                                                                            </Text>

                                                                            <br />

                                                                            <Text
                                                                                style={{
                                                                                    fontSize: 12,

                                                                                    color:
                                                                                        theme ===
                                                                                            "dark"
                                                                                            ? "#aaa"
                                                                                            : "#888",
                                                                                }}
                                                                            >
                                                                                {zonedTime.toFormat(
                                                                                    "ccc, LLL d"
                                                                                )}
                                                                            </Text>
                                                                        </div>

                                                                        <ReusableButton
                                                                            type="text"
                                                                            size="small"
                                                                            icon={
                                                                                favorites.includes(
                                                                                    zone
                                                                                ) ? (
                                                                                    <StarFilled />
                                                                                ) : (
                                                                                    <StarOutlined />
                                                                                )
                                                                            }
                                                                            onClick={() =>
                                                                                toggleFavorite(
                                                                                    zone
                                                                                )
                                                                            }
                                                                            style={{
                                                                                border: "none",
                                                                                color:
                                                                                    favorites.includes(
                                                                                        zone
                                                                                    )
                                                                                        ? "#faad14"
                                                                                        : undefined,
                                                                            }}
                                                                        />

                                                                        <ReusableButton
                                                                            type="text"
                                                                            danger
                                                                            size="small"
                                                                            icon={
                                                                                <CloseOutlined />
                                                                            }
                                                                            style={{
                                                                                border: "none",
                                                                                color:
                                                                                    theme ===
                                                                                        "dark"
                                                                                        ? "#fff"
                                                                                        : "#333",
                                                                            }}
                                                                            onClick={() =>
                                                                                removeTimezone(
                                                                                    zone
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    }
                                                )}

                                                {
                                                    provided.placeholder
                                                }
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>

                            {/* HOURS */}

                            <div
                                className="global-clock-hours"
                                style={{
                                    width: "100%",
                                    overflow: "hidden",
                                    background:
                                        theme === "dark"
                                            ? "#555"
                                            : "#fff",
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                {selectedTimezones.map(
                                    (zone) => {
                                        const hours =
                                            getAlignedHours(
                                                selectedTimezones[0],
                                                zone,
                                                displayNow
                                            );

                                        return (
                                            <div
                                                key={
                                                    zone
                                                }
                                                style={{
                                                    display: "flex",
                                                    width: "100%",
                                                    height: 48,
                                                    paddingLeft: 0,
                                                    marginBottom: 1,
                                                    fontSize: 11,
                                                    boxSizing: "border-box",
                                                    borderBottom:
                                                        `1px solid ${antdToken.colorBorderSecondary}`,


                                                }}
                                            >
                                                {hours.map(
                                                    (
                                                        h,
                                                        i
                                                    ) => (
                                                        <div
                                                            key={
                                                                i
                                                            }
                                                            onMouseEnter={() =>
                                                                setHoveredHourIndex(
                                                                    i
                                                                )
                                                            }
                                                            onMouseLeave={() =>
                                                                setHoveredHourIndex(
                                                                    null
                                                                )
                                                            }
                                                            style={{
                                                                flex: 1,
                                                                minWidth: 0,
                                                                width: "auto",
                                                                textAlign: "center",
                                                                padding: "2px 0",
                                                                fontSize: 11,
                                                                boxSizing: "border-box",
                                                                borderRadius:
                                                                    h.isNewDay
                                                                        ? "8px"
                                                                        : 0,

                                                                backgroundColor:
                                                                    h.isCurrentHour
                                                                        ? "#3b82f6"
                                                                        : markWeekends &&
                                                                            (h.dt.weekday ===
                                                                                6 ||
                                                                                h.dt.weekday ===
                                                                                7)
                                                                            ? "#fbe9e7"
                                                                            : h.dt.hasSame(
                                                                                displayNow.setZone(
                                                                                    zone
                                                                                ),
                                                                                "day"
                                                                            )
                                                                                ? "#e6f0ff"
                                                                                : "#fffbe6",

                                                                color:
                                                                    h.isCurrentHour
                                                                        ? "#fff"
                                                                        : "#000",

                                                                borderLeft:
                                                                    `1px solid ${antdToken.colorBorderSecondary}`,

                                                                position:
                                                                    "relative",

                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <div>
                                                                {h.dt.toFormat(
                                                                    "h"
                                                                )}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                }}
                                                            >
                                                                {h.dt.toFormat(
                                                                    "a"
                                                                )}
                                                            </div>

                                                            {hoveredHourIndex ===
                                                                i && (
                                                                    <div
                                                                        style={{
                                                                            position:
                                                                                "absolute",

                                                                            top: 0,

                                                                            left: 0,

                                                                            right: 0,

                                                                            bottom: 0,

                                                                            border:
                                                                                "2px solid black",

                                                                            pointerEvents:
                                                                                "none",
                                                                        }}
                                                                    />
                                                                )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </Drawer>
    );
}