"use client";

import React from "react";
import {
    CopyOutlined,
} from "@ant-design/icons";

import {
    MdEdit,
    MdDriveFileRenameOutline,
} from "react-icons/md";

import {
    HiOutlineDuplicate,
} from "react-icons/hi";
import downloadFile from "@/modules/creatives/apicalls/downloadfile";
import { message } from "antd";

export default function CreativeContextMenu({
    contextMenu,
    setContextMenu,

    menuRef,
    theme,

    isTrashView,

    // Selection
    selectedImages,
    setSelectedImages,
    selectedImagesRef,

    // Clipboard
    clipboardFile,
    setClipboardFile,

    // Main actions
    startRename,
    handleInlineRename,
    handleCloneFile,


    // Rename
    setEditingUid,
    setInlineName,
    extractDisplayName,

    // Modals
    showDeleteModal,
    setDeleteFolderModal,
    setNewFolderModal,

    // Folder
    handleFolderClick,

    // Campaign
    handleAddToCampaign,

    // Trash
    handlePermanentDelete,
    handleRestore,

    // Multi select
    handleMultiCopy,
    handleMultiCut,
    handleMultiDelete,
    handleMultiRename,
    duplicateFile,
    // Paste
    handlePaste,
    copyFile,
    // Hover states
    isHoveredEdit,
    setIsHoveredEdit,

    isHoveredRename,
    setIsHoveredRename,

    isHoveredDuplicate,
    setIsHoveredDuplicate,

    isHoveredCopy,
    setIsHoveredCopy,

    isHoveredCut,
    setIsHoveredCut,

    isHoveredDelete,
    setIsHoveredDelete,

    isHoveredRestore,
    setIsHoveredRestore,
    handleEditFile,
    images,
    moveToBin,
    addToCampaign
}) {
    if (!contextMenu?.visible) {
        return null;
    }

    const target = contextMenu.target;

    const selectedList =
        contextMenu.selectedList || [];

    const isMultiSelect =
        selectedList.length > 1;

    const closeMenu = () => {
        setContextMenu({
            ...contextMenu,
            visible: false,
        });
    };

    return (
        <div
            ref={menuRef}
            className="custom-context-menu"
            style={{
                position: "fixed",
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                zIndex: 9999,
                width: "180px",
                background:
                    theme === "dark"
                        ? "#2a2a2a"
                        : "#fff",
                color:
                    theme === "dark"
                        ? "#fff"
                        : "#000",
                boxShadow:
                    "0 4px 12px rgba(0,0,0,0.15)",
                borderRadius: "6px",
                padding: "8px 0",
            }}
            onMouseLeave={closeMenu}
        >

            {/* ================================================= */}
            {/* BLANK SPACE */}
            {/* ================================================= */}

            {!target && (
                <>
                    <div
                        style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setNewFolderModal({
                                visible: true,
                                name: "",
                                mode: "create",
                                folderToRename: null,
                            });

                            closeMenu();
                        }}
                    >
                        ➕ New Folder
                    </div>

                    {clipboardFile?.length > 0 && (
                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                await handlePaste();

                                closeMenu();
                            }}
                        >
                            📄 Paste
                        </div>
                    )}
                </>
            )}

            {/* ================================================= */}
            {/* TRASH */}
            {/* ================================================= */}

            {isTrashView &&
                (selectedList.length > 0 ||
                    target) && (
                    <>
                        {/* <div
                            style={{
                                padding: "5px",
                                fontWeight: "bold",

                            }}
                        >
                            {selectedList.length > 0
                                ? `${selectedList.length} selected`
                                : target?.name}
                        </div> */}

                        {/* DELETE PERMANENTLY */}

                        <div
                            style={{
                                padding: "5px",
                                color: "red",
                                backgroundColor:
                                    isHoveredDelete
                                        ? "#e6f7ff"
                                        : "transparent",
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                await handlePermanentDelete();

                                closeMenu();
                            }}
                            onMouseEnter={() =>
                                setIsHoveredDelete(true)
                            }
                            onMouseLeave={() =>
                                setIsHoveredDelete(false)
                            }
                        >
                            ❌ Delete Permanently
                        </div>

                        {/* RESTORE */}

                        <div
                            style={{
                                padding: "5px",
                                backgroundColor:
                                    isHoveredRestore
                                        ? "#e6f7ff"
                                        : "transparent",
                                color:
                                    isHoveredRestore
                                        ? "#333"
                                        : "inherit",
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                await handleRestore();

                                closeMenu();
                            }}
                            onMouseEnter={() =>
                                setIsHoveredRestore(true)
                            }
                            onMouseLeave={() =>
                                setIsHoveredRestore(false)
                            }
                        >
                            🔁 Restore
                        </div>
                    </>
                )}

            {/* ================================================= */}
            {/* NORMAL MULTIPLE SELECTION */}
            {/* ================================================= */}

            {!isTrashView &&
                isMultiSelect && (
                    <>
                        <div
                            style={{
                                padding: "8px 12px",
                                fontWeight: "bold",
                            }}
                        >
                            {selectedList.length} selected
                        </div>

                        {/* ADD TO CAMPAIGN */}

                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                await addToCampaign(
                                    contextMenu.target
                                );

                                setContextMenu({
                                    ...contextMenu,
                                    visible: false,
                                });
                            }}
                        >
                            ➕ Add to Campaign
                        </div>

                        {/* COPY */}

                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                handleMultiCopy();

                                closeMenu();
                            }}
                        >
                            <CopyOutlined
                                style={{
                                    marginRight: 8,
                                }}
                            />
                            Copy
                        </div>

                        {/* CUT */}

                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                setClipboardFile([
                                    {
                                        ...target,
                                        action: "cut",
                                        isFolder: false,
                                    },
                                ]);

                                setSelectedImages([]);
                                selectedImagesRef.current = [];

                                setContextMenu({
                                    ...contextMenu,
                                    visible: false,
                                });
                            }}
                        >
                            ✂️ Cut
                        </div>

                        {/* MOVE TO BIN */}

                        <div
                            style={{
                                padding: "8px 12px",
                                color: "red",
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                await moveToBin([contextMenu.target]);

                                closeMenu();
                            }}
                        >
                            🗑️ Move to Bin
                        </div>

                        {/* RENAME ALL */}

                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                handleMultiRename();

                                closeMenu();
                            }}
                        >
                            ✏️ Rename All
                        </div>
                    </>
                )}

            {/* ================================================= */}
            {/* NORMAL SINGLE ITEM */}
            {/* ================================================= */}

            {!isTrashView &&
                !isMultiSelect &&
                target && (
                    <>
                        {/* FOLDER */}

                        {contextMenu.isFolder ? (
                            <>
                                {/* ADD TO CAMPAIGN */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={async () => {
                                        await handleAddToCampaign();

                                        closeMenu();
                                    }}
                                >
                                    ➕ Add to Campaign
                                </div>

                                {/* OPEN */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        handleFolderClick(
                                            target.name
                                        );

                                        setSelectedImages(
                                            []
                                        );

                                        selectedImagesRef.current =
                                            [];

                                        closeMenu();
                                    }}
                                >
                                    📂 Open
                                </div>

                                {/* RENAME */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setNewFolderModal({
                                            visible: true,
                                            name: target.name,
                                            mode: "rename",
                                            folderToRename:
                                                target,
                                        });

                                        setSelectedImages(
                                            []
                                        );

                                        closeMenu();
                                    }}
                                >
                                    <MdDriveFileRenameOutline
                                        style={{
                                            fontSize: "16px",
                                            marginRight: "8px",
                                        }}
                                    />
                                    Rename
                                </div>

                                {/* COPY */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setClipboardFile([
                                            {
                                                ...target,
                                                action: "copy",
                                                isFolder: true,
                                            },
                                        ]);

                                        setSelectedImages(
                                            []
                                        );

                                        closeMenu();
                                    }}
                                >
                                    <CopyOutlined
                                        style={{
                                            marginRight: 8,
                                        }}
                                    />
                                    Copy
                                </div>

                                {/* CUT */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setClipboardFile([
                                            {
                                                ...target,
                                                action: "cut",
                                                isFolder: true,
                                            },
                                        ]);

                                        setSelectedImages(
                                            []
                                        );

                                        closeMenu();
                                    }}
                                >
                                    ✂️ Cut
                                </div>

                                {/* MOVE TO BIN */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        color: "red",
                                        cursor: "pointer",
                                    }}
                                    onClick={async () => {
                                        await moveToBin([target]);

                                        setSelectedImages([]);
                                        selectedImagesRef.current = [];

                                        closeMenu();
                                    }}
                                >
                                    🗑️ Move to Bin
                                </div>
                            </>
                        ) : (
                            /* ================================= */
                            /* FILE */
                            /* ================================= */

                            <>
                                {/* DOWNLOAD */}

                                <div
                                    style={{ padding: '8px 12px', cursor: 'pointer' }}
                                    onClick={async () => {
                                        try {
                                            const target = contextMenu.target;
                                            setContextMenu({ ...contextMenu, visible: false });
                                            const url = target?.url;
                                            const name = target?.name || (target?.uid?.split('/').pop() || 'file');
                                            if (!url) {
                                                message.error("File URL unavailable for download");
                                                return;
                                            }
                                            message.info(`Downloading ${name}...`);
                                            const res = await downloadFile(url, name);
                                            if (res.ok) message.success(`Downloaded ${name}`);
                                            else message.error(`Failed to download ${name}`);
                                        } catch (err) {
                                            console.error(err);
                                            message.error("Download failed");
                                        }
                                    }}
                                >
                                    ⬇️ Download
                                </div>

                                {/* EDIT */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor:
                                            isHoveredEdit
                                                ? "#e6f7ff"
                                                : "transparent",
                                        color:
                                            isHoveredEdit
                                                ? "#333"
                                                : "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {

                                        handleEditFile(contextMenu.target)

                                        setSelectedImages(
                                            []
                                        );

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredEdit(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredEdit(
                                            false
                                        )
                                    }

                                >
                                    <MdEdit
                                        style={{
                                            fontSize: "16px",
                                            marginRight: "8px",
                                        }}
                                    />
                                    Edit
                                </div>

                                {/* RENAME */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor: isHoveredRename
                                            ? "#e6f7ff"
                                            : "transparent",
                                        color: isHoveredRename
                                            ? "#333"
                                            : "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        startRename(contextMenu.target);
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredRename(true)
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredRename(false)
                                    }
                                >
                                    <MdDriveFileRenameOutline
                                        style={{
                                            fontSize: "16px",
                                            marginRight: "8px",
                                        }}
                                    />
                                    Rename
                                </div>

                                {/* DUPLICATE */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor:
                                            isHoveredDuplicate
                                                ? "#e6f7ff"
                                                : "transparent",
                                        color:
                                            isHoveredDuplicate
                                                ? "#333"
                                                : "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={async () => {
                                        await duplicateFile(
                                            contextMenu.target,
                                            images
                                        );
                                        setContextMenu({
                                            visible: false,
                                        });
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredDuplicate(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredDuplicate(
                                            false
                                        )
                                    }
                                >
                                    <HiOutlineDuplicate
                                        style={{
                                            fontSize: "16px",
                                            marginRight: "8px",
                                        }}
                                    />
                                    Duplicate
                                </div>

                                {/* MOVE TO BIN */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        color: "red",
                                        backgroundColor:
                                            isHoveredDelete
                                                ? "#e6f7ff"
                                                : "transparent",
                                        cursor: "pointer",
                                    }}
                                    onClick={async () => {
                                        await moveToBin([target]);

                                        setSelectedImages([]);
                                        selectedImagesRef.current = [];

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredDelete(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredDelete(
                                            false
                                        )
                                    }
                                >
                                    🗑️ Move to Bin
                                </div>

                                {/* COPY */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor:
                                            isHoveredCopy
                                                ? "#e6f7ff"
                                                : "transparent",
                                        color:
                                            isHoveredCopy
                                                ? "#333"
                                                : "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setClipboardFile([
                                            {
                                                ...target,
                                                action: "copy",
                                                isFolder: false,
                                            },
                                        ]);

                                        setSelectedImages(
                                            []
                                        );

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredCopy(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredCopy(
                                            false
                                        )
                                    }
                                >
                                    <CopyOutlined
                                        style={{
                                            marginRight: 8,
                                        }}
                                    />
                                    Copy
                                </div>

                                {/* CUT */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        backgroundColor:
                                            isHoveredCut
                                                ? "#e6f7ff"
                                                : "transparent",
                                        color:
                                            isHoveredCut
                                                ? "#333"
                                                : "inherit",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setClipboardFile([
                                            {
                                                ...target,
                                                action: "cut",
                                                isFolder: true,
                                            },
                                        ]);

                                        setSelectedImages([]);
                                        selectedImagesRef.current = [];

                                        setContextMenu({
                                            ...contextMenu,
                                            visible: false,
                                        });
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredCut(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredCut(
                                            false
                                        )
                                    }
                                >
                                    ✂️ Cut
                                </div>
                            </>
                        )}
                    </>
                )}
        </div>
    );
}