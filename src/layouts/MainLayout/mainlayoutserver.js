"use client";

import { useState } from "react";
import Header from "./Topbar";
import Sidebar from "./Sidebar";
import dayjs from "dayjs";

export default function MainLayoutClient({
    children,
    userRole,
    userProfileImage,
    stickyNotes,
    userData,
    userPermissionsInfo,
    userdetails,
    theme,
    isAuthenticated,
    email,
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
            }}
        >
            {/* SIDEBAR */}
            <div className="sidebar-wrapper">
                <Sidebar
                    role={userRole}
                    userPermissions={userPermissionsInfo}
                    theme={theme}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />
            </div>

            {/* RIGHT SIDE */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    minHeight: 0,
                }}
            >
                {/* TOPBAR */}
                <Header
                    profileImage={userProfileImage}
                    stickyNotes={stickyNotes}
                    userdetails={userdetails}
                    theme={theme}
                    isAuthenticated={isAuthenticated}
                    email={email}
                    userdata={userData}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />

                {/* CONTENT */}
                <main
                    style={{
                        flex: 1,
                        minHeight: 0,
                        margin: "8px 8px 0px 8px",
                        backgroundColor:
                            theme === "dark"
                                ? "#282628"
                                : "#ededed",
                        overflow: "hidden",
                    }}
                >
                    {children}
                </main>

                {/* FOOTER */}
                <h5
                    style={{
                        fontWeight: "100",
                        marginBottom: "2px",
                        marginLeft: "10px",
                        marginTop: "2px",
                        fontSize: "10px",
                        color:
                            theme === "dark"
                                ? "#fff"
                                : "#000",
                    }}
                >
                    Copyright © {dayjs().format("YYYY")} All
                    rights reserved | vyaktimetrics
                </h5>
            </div>
        </div>
    );
}