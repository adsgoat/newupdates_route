
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
    userdata
}) {
    const darkMode = theme === "dark";

    return (
        <div
            className="topbar"
            style={{
                backgroundColor: darkMode
                    ? "#333"
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
                />
            )}
        </div>
    );
}

