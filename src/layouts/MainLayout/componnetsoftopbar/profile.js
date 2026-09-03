"use client";

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Avatar,
    Dropdown,
   
} from "antd";

import {
    CameraOutlined,
    UserOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import ResuableModal from "@/components/topbar/modal";
export default function Profile({
    userdetails,
    email,
    adAccounts = {},
    theme,
}) {
    /* =========================================================
       THEME
    ========================================================= */

    const darkMode = theme === "dark";

    /* =========================================================
       USER DETAILS
    ========================================================= */

    const parsedUserDetails =
        typeof userdetails === "string"
            ? (() => {
                try {
                    return JSON.parse(userdetails);
                } catch {
                    return {};
                }
            })()
            : userdetails || {};

    /* =========================================================
       PROFILE STATES
    ========================================================= */

    const [profileModalOpen, setProfileModalOpen] =
        useState(false);

    const [profileImage, setProfileImage] =
        useState(null);

    const [previewImage, setPreviewImage] =
        useState(null);

    const [imageFile, setImageFile] =
        useState(null);

    const [uploading, setUploading] =
        useState(false);

    const [loadingProfileImage, setLoadingProfileImage] =
        useState(false);

    const fileInputRef = useRef(null);

    /* =========================================================
       FETCH USER PROFILE IMAGE
    ========================================================= */

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (!email) return;

            try {
                setLoadingProfileImage(true);

                const response = await fetch(
                    `/api/topbar/userdata?email=${encodeURIComponent(
                        email
                    )}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch user data"
                    );
                }

                const result = await response.json();

                const imageUrl =
                    result?.data?.profileImage ||
                    result?.profileImage ||
                    null;

                if (imageUrl) {
                    setProfileImage(imageUrl);
                    setPreviewImage(imageUrl);
                }
            } catch (error) {
                console.error(
                    "Failed to load profile image:",
                    error
                );
            } finally {
                setLoadingProfileImage(false);
            }
        };

        fetchProfileImage();
    }, [email]);

    /* =========================================================
       CLEANUP PREVIEW URL
    ========================================================= */

    useEffect(() => {
        return () => {
            if (
                previewImage &&
                previewImage.startsWith("blob:")
            ) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    /* =========================================================
       OPEN PROFILE MODAL
    ========================================================= */

    const handleOpenProfile = () => {
        setProfileModalOpen(true);
    };

    /* =========================================================
       OPEN FILE SELECTOR
    ========================================================= */

    const handleUploadClick = () => {
        if (uploading) return;

        fileInputRef.current?.click();
    };

    /* =========================================================
       IMAGE SELECT
    ========================================================= */

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        /* -----------------------------------------
           IMAGE TYPE VALIDATION
        ------------------------------------------ */

        if (!file.type.startsWith("image/")) {
            console.error(
                "Please select a valid image file."
            );

            event.target.value = "";

            return;
        }

        /* -----------------------------------------
           IMAGE SIZE VALIDATION
           5 MB
        ------------------------------------------ */

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            console.error(
                "Image size should be less than 5 MB."
            );

            event.target.value = "";

            return;
        }

        /* -----------------------------------------
           REMOVE OLD PREVIEW URL
        ------------------------------------------ */

        if (
            previewImage &&
            previewImage.startsWith("blob:")
        ) {
            URL.revokeObjectURL(previewImage);
        }

        /* -----------------------------------------
           CREATE PREVIEW
        ------------------------------------------ */

        const previewUrl =
            URL.createObjectURL(file);

        setImageFile(file);

        setPreviewImage(previewUrl);
    };

    /* =========================================================
       CONFIRM IMAGE UPLOAD
    ========================================================= */
    const storeImageUrlInDb = async (imageUrl) => {
        try {
            if (!imageUrl) {
                throw new Error("Image URL is required");
            }

            const response = await fetch(
                "/api/topbar/saveprofile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        imageUrl,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error || "Failed to save image URL"
                );
            }

            return data;
        } catch (error) {
            console.error(
                "Error storing image URL in database:",
                error
            );

            throw error;
        }
    };
    const handleConfirmUpload = async () => {
        if (!imageFile) {
            return;
        }

        try {
            setUploading(true);

            /* -----------------------------------------
               FORM DATA
            ------------------------------------------ */

            const formData = new FormData();

            formData.append(
                "file",
                imageFile
            );

            /* -----------------------------------------
               INTERNAL NEXT.JS API
            ------------------------------------------ */

            const response = await fetch(
                "/api/topbar/profileupload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data =
                await response.json();

            console.log(
                "Profile image upload response:",
                data
            );

            /* -----------------------------------------
               API ERROR
            ------------------------------------------ */

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Failed to upload profile image"
                );
            }

            /* -----------------------------------------
               SUCCESS RESPONSE
            ------------------------------------------ */

            if (
                !data?.success ||
                !data?.imageUrl
            ) {
                throw new Error(
                    data?.error ||
                    "Image URL was not returned"
                );
            }

            const newImageUrl = data.imageUrl;

            /* -----------------------------------------
               SAVE IMAGE URL IN DATABASE
            ------------------------------------------ */

            const saveResponse = await storeImageUrlInDb(newImageUrl);

            if (
                !saveResponse?.success &&
                !saveResponse?.data?.success
            ) {
                throw new Error(
                    saveResponse?.error ||
                    "Failed to save image URL in database"
                );
            }

            /* -----------------------------------------
               UPDATE PROFILE IMAGE
            ------------------------------------------ */

            setProfileImage(newImageUrl);
            setPreviewImage(newImageUrl);

            /* -----------------------------------------
               CLEAR SELECTED FILE
            ------------------------------------------ */

            setImageFile(null);

            /* -----------------------------------------
               CLEAR INPUT
            ------------------------------------------ */

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            console.log(
                "Profile image uploaded and URL saved successfully"
            );

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            console.log(
                "Profile image updated successfully"
            );
        } catch (error) {
            console.error(
                "Profile image upload failed:",
                error
            );
        } finally {
            setUploading(false);
        }
    };

    /* =========================================================
       CANCEL IMAGE CHANGE
    ========================================================= */

    const handleCancelImage = () => {
        if (
            previewImage &&
            previewImage.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                previewImage
            );
        }

        /* -----------------------------------------
           RESTORE OLD IMAGE
        ------------------------------------------ */

        setPreviewImage(
            profileImage
        );

        /* -----------------------------------------
           CLEAR FILE
        ------------------------------------------ */

        setImageFile(null);

        /* -----------------------------------------
           CLEAR INPUT
        ------------------------------------------ */

        if (fileInputRef.current) {
            fileInputRef.current.value =
                "";
        }
    };

    /* =========================================================
       CLOSE PROFILE MODAL
    ========================================================= */

    const handleCloseProfile = () => {
        if (imageFile) {
            handleCancelImage();
        }

        setProfileModalOpen(false);
    };

    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleSignOut = async () => {
        try {
            const response = await fetch("/api/topbar/logout", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userdetails?.email || email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Logout API failed:", data);
                throw new Error(data?.error || "Logout failed");
            }

            window.location.href = "/";
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    /* =========================================================
       AD ACCOUNTS
    ========================================================= */

    const renderAdAccounts = () => {
        if (
            !adAccounts ||
            typeof adAccounts !== "object" ||
            Object.keys(adAccounts).length === 0
        ) {
            return (
                <div
                    style={{
                        fontSize: "12px",
                        color: darkMode
                            ? "#999"
                            : "#888",
                    }}
                >
                    No ad accounts assigned
                </div>
            );
        }

        return Object.entries(
            adAccounts
        ).map(
            ([network, accounts]) => (
                <div
                    key={network}
                    style={{
                        marginBottom:
                            "10px",
                    }}
                >
                    {/* NETWORK */}

                    <div
                        style={{
                            fontSize:
                                "12px",
                            fontWeight: 600,
                            marginBottom:
                                "5px",
                            color: darkMode
                                ? "#fff"
                                : "#333",
                        }}
                    >
                        {network}
                    </div>

                    {/* ACCOUNTS */}

                    <div
                        style={{
                            display: "flex",
                            flexWrap:
                                "wrap",
                            gap: "5px",
                        }}
                    >
                        {Array.isArray(
                            accounts
                        ) &&
                            accounts.map(
                                (
                                    account,
                                    index
                                ) => {
                                    const accountNumber =
                                        typeof account ===
                                            "object"
                                            ? account?.accountNumber
                                            : account;

                                    return (
                                        <span
                                            key={`${network}-${index}`}
                                            style={{
                                                display:
                                                    "inline-block",
                                                padding:
                                                    "4px 8px",
                                                borderRadius:
                                                    "4px",
                                                backgroundColor:
                                                    darkMode
                                                        ? "#2d2d2d"
                                                        : "#f1f1f1",
                                                color: darkMode
                                                    ? "#ddd"
                                                    : "#555",
                                                fontSize:
                                                    "11px",
                                                wordBreak:
                                                    "break-word",
                                            }}
                                        >
                                            {accountNumber ||
                                                "—"}
                                        </span>
                                    );
                                }
                            )}
                    </div>
                </div>
            )
        );
    };

    /* =========================================================
       PROFILE IMAGE USED OUTSIDE MODAL
    ========================================================= */

    const currentImage =
        previewImage ||
        profileImage;

    /* =========================================================
       RETURN
    ========================================================= */
    const profileMenuItems = [
        {
            key: "profile",
            label: (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        minWidth: "100px",
                        color: darkMode ? "#fff" : "#333",
                    }}
                >
                    <UserOutlined
                        style={{
                            fontSize: "14px",
                            color: darkMode ? "#fff" : "#333",
                        }}
                    />

                    <span>Profile</span>
                </div>
            ),
        },

        {
            type: "divider",
        },

        {
            key: "logout",
            label: (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#ff4d4f",
                        minWidth: "100px",
                    }}
                >
                    <LogoutOutlined
                        style={{
                            fontSize: "14px",
                            color: "#ff4d4f",
                        }}
                    />



                    <span>Sign out</span>
                </div>
            ),
        },
    ];

    const handleProfileMenuClick = ({
        key,
    }) => {
        if (key === "profile") {
            handleOpenProfile();
        }

        if (key === "logout") {
            handleSignOut();
        }
    };
    return (
        <>
            {/* =================================================
                PROFILE AVATAR
            ================================================= */}
            <Dropdown
                menu={{
                    items: profileMenuItems,
                    onClick: handleProfileMenuClick,
                }}
                trigger={["click"]}
                placement="bottomRight"
                styles={{
                    root: {
                        minWidth: "140px",
                    },
                }}
                popupRender={(menu) => (
                    <div
                        className={darkMode ? "profile-dropdown-dark" : "profile-dropdown-light"}
                    >
                        {menu}
                    </div>
                )}
            >
                <div
                    style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Avatar
                        size={34}
                        src={currentImage}
                        icon={
                            !currentImage ? (
                                <UserOutlined />
                            ) : undefined
                        }
                        style={{
                            backgroundColor: darkMode
                                ? "#2f2f2f"
                                : "#f0f0f0",

                            color: darkMode
                                ? "#aaa"
                                : "#777",
                        }}
                    />
                </div>
            </Dropdown>

            {/* =================================================
                PROFILE MODAL
            ================================================= */}

            <ResuableModal
                theme={theme}
                open={
                    profileModalOpen
                }
                title={
                    <span
                        style={{
                            color: theme === "dark" ? "#fff" : "#000",
                            fontWeight: 600,
                        }}
                    >
                        Profile
                    </span>
                }

                centered
                width={400}
                footer={null}
                destroyOnHidden
                onCancel={
                    handleCloseProfile
                }
                styles={{
                    container: {
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    },
                    content: {
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#000',
                    },
                    header: {
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#000',
                    },
                    body: {
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#000',
                    },
                    footer: {
                        backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    },
                    close: {
                        color: theme === 'dark' ? '#fff' : '#000',
                    },
                }}
            >
                {/* =================================================
                    PROFILE + USER DETAILS
                ================================================= */}

                <div
                    className="profile-user-section"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "4px 0 12px",
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    {/* =============================================
                        PROFILE IMAGE
                    ============================================== */}

                    <div
                        style={{
                            position:
                                "relative",
                            width: "72px",
                            height: "72px",
                            minWidth: "72px",
                            flexShrink: 0,

                        }}
                    >
                        <Avatar
                            size={72}
                            src={
                                currentImage
                            }
                            icon={
                                !currentImage ? (
                                    <UserOutlined />
                                ) : undefined
                            }
                            style={{
                                backgroundColor:
                                    darkMode
                                        ? "#2f2f2f"
                                        : "#f0f0f0",
                                color:
                                    darkMode
                                        ? "#aaa"
                                        : "#777",
                            }}
                        />

                        {/* =========================================
                            CAMERA BUTTON
                        ========================================== */}

                        <button
                            type="button"
                            onClick={
                                handleUploadClick
                            }
                            disabled={
                                uploading
                            }
                            aria-label="Change profile picture"
                            style={{
                                position:
                                    "absolute",
                                right:
                                    "-3px",
                                bottom:
                                    "-3px",
                                width:
                                    "27px",
                                height:
                                    "27px",
                                padding: 0,
                                borderRadius:
                                    "50%",
                                border: `2px solid ${darkMode
                                    ? "#1f1f1f"
                                    : "#fff"
                                    }`,
                                background:
                                    uploading
                                        ? "#999"
                                        : "#91c25f",
                                color: "#fff",
                                cursor:
                                    uploading
                                        ? "not-allowed"
                                        : "pointer",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                boxShadow:
                                    "0 1px 4px rgba(0,0,0,0.25)",
                            }}
                        >
                            <CameraOutlined
                                style={{
                                    fontSize:
                                        "13px",
                                }}
                            />
                        </button>
                    </div>

                    {/* =============================================
                        USER DETAILS
                    ============================================== */}

                    <div
                        style={{
                            flex: 1,
                            minWidth: 0,
                            lineHeight:
                                1.6,
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns: "60px minmax(0, 1fr)",
                                columnGap: "8px",
                                rowGap: "5px",
                                fontSize: "12px",
                                width: "100%",
                            }}
                        >
                            {/* USERNAME */}

                            <span
                                style={{
                                    color:
                                        darkMode
                                            ? "#999"
                                            : "#888",
                                }}
                            >
                                Username
                            </span>

                            <span
                                style={{
                                    fontWeight:
                                        500,
                                    color:
                                        darkMode
                                            ? "#fff"
                                            : "#333",
                                    wordBreak:
                                        "break-word",
                                }}
                            >
                                {parsedUserDetails?.username ||
                                    parsedUserDetails?.userName ||
                                    "—"}
                            </span>

                            {/* EMAIL */}

                            <span
                                style={{
                                    color:
                                        darkMode
                                            ? "#999"
                                            : "#888",
                                }}
                            >
                                Email
                            </span>

                            <span
                                style={{
                                    fontWeight:
                                        500,
                                    color:
                                        darkMode
                                            ? "#fff"
                                            : "#333",
                                    wordBreak:
                                        "break-word",
                                }}
                            >
                                {parsedUserDetails?.email ||
                                    email ||
                                    "—"}
                            </span>

                            {/* ROLE */}

                            <span
                                style={{
                                    color:
                                        darkMode
                                            ? "#999"
                                            : "#888",
                                }}
                            >
                                Role
                            </span>

                            <span
                                style={{
                                    fontWeight:
                                        500,
                                    color:
                                        darkMode
                                            ? "#fff"
                                            : "#333",
                                }}
                            >
                                {parsedUserDetails?.role ||
                                    "—"}
                            </span>

                            {/* GENDER */}

                            <span
                                style={{
                                    color:
                                        darkMode
                                            ? "#999"
                                            : "#888",
                                }}
                            >
                                Gender
                            </span>

                            <span
                                style={{
                                    fontWeight:
                                        500,
                                    color:
                                        darkMode
                                            ? "#fff"
                                            : "#333",
                                }}
                            >
                                {parsedUserDetails?.gender ||
                                    "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FILE INPUT
                ================================================= */}

                <input
                    ref={
                        fileInputRef
                    }
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    hidden
                    onChange={
                        handleImageChange
                    }
                />

                {/* =================================================
                    IMAGE CONFIRM / CANCEL
                ================================================= */}

                {imageFile && (
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between",
                            gap: "10px",
                            padding:
                                "8px 0 12px",
                            borderBottom: `1px solid ${darkMode
                                ? "#333"
                                : "#e5e5e5"
                                }`,
                        }}
                    >
                        {/* SELECTED FILE */}

                        <div
                            style={{
                                minWidth: 0,
                                flex: 1,
                                fontSize:
                                    "11px",
                                color:
                                    darkMode
                                        ? "#aaa"
                                        : "#777",
                                overflow:
                                    "hidden",
                                textOverflow:
                                    "ellipsis",
                                whiteSpace:
                                    "nowrap",
                            }}
                            title={
                                imageFile.name
                            }
                        >
                            {imageFile.name}
                        </div>

                        {/* ACTIONS */}

                        <div
                            style={{
                                display:
                                    "flex",
                                gap: "6px",
                                flexShrink: 0,
                            }}
                        >
                            {/* CANCEL */}

                            <button
                                type="button"
                                onClick={
                                    handleCancelImage
                                }
                                disabled={
                                    uploading
                                }
                                style={{
                                    border: `1px solid ${darkMode
                                        ? "#444"
                                        : "#d9d9d9"
                                        }`,
                                    background:
                                        "transparent",
                                    color:
                                        darkMode
                                            ? "#ddd"
                                            : "#555",
                                    padding:
                                        "4px 10px",
                                    borderRadius:
                                        "4px",
                                    fontSize:
                                        "11px",
                                    cursor:
                                        uploading
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                            >
                                Cancel
                            </button>

                            {/* CONFIRM */}

                            <button
                                type="button"
                                onClick={
                                    handleConfirmUpload
                                }
                                disabled={
                                    uploading
                                }
                                style={{
                                    border:
                                        "none",
                                    background:
                                        uploading
                                            ? "#a0ba8580"
                                            : "#91c25f",
                                    color:
                                        "#fff",
                                    padding:
                                        "4px 11px",
                                    borderRadius:
                                        "4px",
                                    fontSize:
                                        "11px",
                                    cursor:
                                        uploading
                                            ? "not-allowed"
                                            : "pointer",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: "5px",
                                }}
                            >
                                {uploading && (
                                    <span
                                        style={{
                                            width:
                                                "11px",
                                            height:
                                                "11px",
                                            border:
                                                "2px solid rgba(255,255,255,0.4)",
                                            borderTopColor:
                                                "#fff",
                                            borderRadius:
                                                "50%",
                                            animation:
                                                "profileSpin 0.7s linear infinite",
                                        }}
                                    />
                                )}

                                {uploading
                                    ? "Saving..."
                                    : "Confirm"}
                            </button>
                        </div>
                    </div>
                )}

                {/* =================================================
                    AD ACCOUNTS
                ================================================= */}

                <div
                    style={{
                        borderTop:
                            imageFile
                                ? "none"
                                : `1px solid ${darkMode
                                    ? "#333"
                                    : "#e5e5e5"
                                }`,
                        paddingTop:
                            "10px",
                    }}
                >
                    <div
                        style={{
                            fontSize:
                                "13px",
                            fontWeight:
                                600,
                            marginBottom:
                                "7px",
                            color:
                                darkMode
                                    ? "#fff"
                                    : "#333",
                        }}
                    >
                        Ad Accounts
                    </div>

                    <div
                        style={{
                            maxHeight:
                                "170px",
                            overflowY:
                                "auto",
                            paddingRight:
                                "2px",
                        }}
                    >
                        {renderAdAccounts()}
                    </div>
                </div>

                {/* =================================================
                    LOGOUT
                ================================================= */}

                <div
                    style={{
                        marginTop:
                            "14px",
                        paddingTop:
                            "10px",
                        borderTop: `1px solid ${darkMode
                            ? "#333"
                            : "#e5e5e5"
                            }`,
                        display:
                            "flex",
                        justifyContent:
                            "flex-end",
                    }}
                >
                    <button
                        type="button"
                        onClick={
                            handleSignOut
                        }
                        style={{
                            border:
                                "none",
                            background:
                                "transparent",
                            color:
                                "#ff4d4f",
                            fontSize:
                                "12px",
                            cursor:
                                "pointer",
                            padding:
                                "3px 0",
                        }}
                    >
                        Sign out
                    </button>
                </div>

                {/* =================================================
                    RESPONSIVE + SPINNER CSS
                ================================================= */}

                <style>
                    {`
                        @keyframes profileSpin {
                            from {
                                transform: rotate(0deg);
                            }

                            to {
                                transform: rotate(360deg);
                            }
                        }

                        @media (max-width: 480px) {
                            .profile-user-section {
                                gap: 14px !important;
                            }

                            .profile-user-section
                            .ant-avatar {
                                width: 72px !important;
                                height: 72px !important;
                                line-height: 72px !important;
                            }

                            .profile-user-section
                            > div:first-child {
                                width: 72px !important;
                                height: 72px !important;
                                min-width: 72px !important;
                            }
                        }

                        @media (max-width: 360px) {
                            .profile-user-section {
                                gap: 10px !important;
                            }

                            .profile-user-section
                            .ant-avatar {
                                width: 64px !important;
                                height: 64px !important;
                                line-height: 64px !important;
                            }

                            .profile-user-section
                            > div:first-child {
                                width: 64px !important;
                                height: 64px !important;
                                min-width: 64px !important;
                            }

                            .profile-user-section
                            .anticon {
                                font-size: 11px !important;
                            }
                        }

                        @media (max-width: 480px) {
                            .ant-modal {
                                max-width: calc(100vw - 24px) !important;
                                margin: 12px auto !important;
                            }
                        }

                        @media (max-width: 360px) {
                            .ant-modal {
                                max-width: calc(100vw - 16px) !important;
                                margin: 8px auto !important;
                            }
                        }
                    `}
                </style>
            </ResuableModal>
        </>
    );
}