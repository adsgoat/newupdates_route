"use client";

import React from "react";
import Image from "next/image";

import {
    DoubleRightOutlined,
    DoubleLeftOutlined,
    CalculatorOutlined,
} from "@ant-design/icons";

import { Avatar } from "antd";
import { TfiWorld } from "react-icons/tfi";

import NotificationDropdown from "../componnetsoftopbar/notificationdropdown";
import Calculator from "../componnetsoftopbar/calculator";
import WorldTimeBuddy from "../componnetsoftopbar/globalclock";
import Profile from "../componnetsoftopbar/profile";
import StickyNotes from "../componnetsoftopbar/stickynotes";
import "../../../styles/topbar.css"

import {
    StickyNote2Outlined,
    WbSunnyOutlined,
    DarkModeOutlined,
} from "@mui/icons-material";
import { useState } from "react";

export default function TopbarActions({
    profileImage,
    stickyNotes,
    userdetails,
    theme,
    email,
    userdata
}) {
    const darkMode = theme === "dark";

    const [showIcons, setShowIcons] = useState(true);

    const [openCalculator, setOpenCalculator] = useState(false);
    const [openWorldTime, setOpenWorldTime] = useState(false);
    const [openStickyNotes, setOpenStickyNotes] = useState(false);


    const handleThemeToggle = async () => {
        const newTheme = darkMode ? "light" : "dark";

        try {
            const response = await fetch("/api/topbar/theme", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    theme: newTheme,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update theme");
            }

            window.location.reload();
        } catch (error) {
            console.error("Theme update failed:", error);
        }
    };

    return (
        <>
            <div
                className="topbar-actions"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "1em",
                    height: "60px",
                    justifyContent: "flex-end",
                    marginLeft: "auto",
                    width: "100%",
                }}
            >
                {/* LOGO */}

                <div
                    className="topbar-left"
                    style={{
                        marginRight: "auto",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {/* <Image
                        src={
                            darkMode
                                ? "/ssk2.png"
                                : "/ssk1.png"
                        }
                        width={70}
                        height={35}
                        priority
                        alt="Logo"
                        className="logo"
                        style={{
                            margin: "0px 12px",
                            width: "60%",
                            height: "revert-layer",
                            objectFit: "contain",
                        }}
                    /> */}
                </div>

                {/* RIGHT ICONS */}

                <div
                    className="navbar-2"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    {/* SHOW ICONS */}

                    {!showIcons && (
                        <div>
                            <DoubleLeftOutlined
                                className="mobile-double-left"
                                onClick={() =>
                                    setShowIcons(true)
                                }
                                style={{
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    color: darkMode ? "#fff" : "#333",
                                }}
                            />
                        </div>
                    )}

                    {showIcons && (
                        <>
                            {/* NOTIFICATION */}

                            {userdetails?.role !==
                                "Revenue_Partner" && (
                                    <NotificationDropdown
                                        userdetails={
                                            userdetails
                                        }
                                        theme={theme}
                                        email={email}
                                    />
                                )}

                            {/* STICKY NOTES */}

                            {userdetails?.role !== "Revenue_Partner" && (
                                <StickyNote2Outlined
                                    onClick={() => setOpenStickyNotes(true)}
                                    titleAccess="Sticky Notes"
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        color: darkMode ? "#fff" : "#333",
                                    }}
                                />
                            )}
                            {/* CALCULATOR */}

                            {userdetails?.role !==
                                "Revenue_Partner" && (
                                    <CalculatorOutlined
                                        onClick={() => setOpenCalculator(true)}
                                        title="Calculator"
                                        style={{
                                            fontSize: "16px",
                                            cursor: "pointer",
                                            color: darkMode ? "#fff" : "#333",
                                        }}
                                    />
                                )}

                            {/* WORLD TIME */}
                            <TfiWorld
                                size={16}
                                onClick={() => setOpenWorldTime(true)}
                                title="World Time"
                                style={{
                                    cursor: "pointer",
                                    color: darkMode ? "#fff" : "#333",
                                }}
                            />

                            {/* THEME */}

                            {darkMode ? (
                                <WbSunnyOutlined
                                    onClick={handleThemeToggle}
                                    titleAccess="Light Mode"
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        color: "#fff",
                                    }}
                                />
                            ) : (
                                <DarkModeOutlined
                                    onClick={handleThemeToggle}
                                    titleAccess="Dark Mode"
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        color: "#333",
                                    }}
                                />
                            )}



                        </>
                    )}
                    {showIcons && (
                        <div>
                            <DoubleRightOutlined
                                className="mobile-double-left"
                                onClick={() =>
                                    setShowIcons(false)
                                }
                                style={{
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    color: darkMode ? "#fff" : "#333",
                                }}
                            />
                        </div>
                    )}
                    {/* PROFILE */}

                    <Profile
                        userdetails={userdetails}
                        email={email}
                        profileImage={profileImage}
                        theme={theme}
                        adAccounts={userdata}
                    />
                </div>
            </div>

            {/* CALCULATOR MODAL */}

            <Calculator
                open={openCalculator}
                onClose={() =>
                    setOpenCalculator(false)
                }
                theme={theme}
            />
            <WorldTimeBuddy
                open={openWorldTime}
                onClose={() =>
                    setOpenWorldTime(false)
                }
                theme={theme}
            />
            <StickyNotes
                open={openStickyNotes}
                setOpen={setOpenStickyNotes}
                email={email}
                theme={theme}
                userdetails={userdetails}
            />
        </>
    );
}