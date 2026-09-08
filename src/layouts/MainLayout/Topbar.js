
"use client";

import React from "react";
import Image from "next/image";

import TopbarActions from "../MainLayout/componnetsoftopbar/topbaractions";


export default function Header({
    onComplete,
    usersDataForLogin,
    profileImage,
    stickyNotes,
    userdetails,
    theme,
    isAuthenticated,
    email,
    userdata,
    mobileMenuOpen,
    setMobileMenuOpen,
}) {
    const darkMode = theme === "dark";

    return (
        <div
            className="topbar"
            style={{
                backgroundColor: darkMode
                    ? "#3f3e3e"
                    : "#fff",
            }}
        >
            {isAuthenticated && (
                <TopbarActions
                    usersDataForLogin={usersDataForLogin}
                    onComplete={onComplete}
                    profileImage={profileImage}
                    stickyNotes={stickyNotes}
                    userdetails={userdetails}
                    theme={theme}
                    email={email}
                    userdata={userdata}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />
            )}
        </div>
    );
}

