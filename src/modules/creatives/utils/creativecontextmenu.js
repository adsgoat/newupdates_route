"use client";

import React from "react";
import { CopyOutlined } from "@ant-design/icons";
import {
    MdEdit,
    MdDriveFileRenameOutline,
} from "react-icons/md";
import { HiOutlineDuplicate } from "react-icons/hi";

import downloadFile from "@/modules/creatives/apicalls/downloadfile";


export default function CreativeContextMenu({
    contextMenu,
    setContextMenu,
    menuRef,
    theme,
    message,
    isTrashView,
    selectedImages,
    setSelectedImages,
    selectedImagesRef,

    // Clipboard
    clipboardFile,
    setClipboardFile,

    // Actions
    startRename,
    handleInlineRename,
    handleCloneFile,
    onPaste,

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
    copyFile,
    moveToBin,
    addToCampaign,

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
}) {
    if (!contextMenu?.visible) {
        return null;
    }

    const target = contextMenu?.target || null;

    const selectedList =
        contextMenu?.selectedList || [];

    const isMultiSelect =
        selectedList.length > 1;

    /*
     * IMPORTANT
     * Always get folder status from target.
     * Do not depend only on contextMenu.isFolder.
     */
    const isFolder =
        !!target?.isFolder;

    const hasClipboard =
        Array.isArray(clipboardFile) &&
        clipboardFile.length > 0;

    const closeMenu = () => {
        setContextMenu((prev) => ({
            ...prev,
            visible: false,
        }));
    };

    /*
     * Save file/folder into clipboard
     */
    const handleCopy = (item) => {
        if (!item) {
            return;
        }

        console.log("========== CONTEXT COPY ==========");
        console.log("Item:", item);
        console.log("Is folder:", !!item.isFolder);

        setClipboardFile([
            {
                ...item,
                action: "copy",
                isFolder: !!item.isFolder,
            },
        ]);

        setSelectedImages?.([]);
        if (selectedImagesRef) {
            selectedImagesRef.current = [];
        }

        closeMenu();
    };

    /*
     * Save file/folder into clipboard as CUT
     */
    const handleCut = (item) => {
        if (!item) {
            return;
        }

        console.log("========== CONTEXT CUT ==========");
        console.log("Item:", item);
        console.log("Is folder:", !!item.isFolder);

        setClipboardFile([
            {
                ...item,
                action: "cut",
                isFolder: !!item.isFolder,
            },
        ]);

        setSelectedImages?.([]);
        if (selectedImagesRef) {
            selectedImagesRef.current = [];
        }

        closeMenu();
    };

    /*
     * Paste
     *
     * If the user right-clicks a folder,
     * pass that folder as the destination context.
     *
     * Your pasteFile hook can use currentFolder
     * from page state.
     */
    const handlePasteClick = async () => {
        if (!hasClipboard) {
            return;
        }

        console.log("========== CONTEXT PASTE ==========");
        console.log("Clipboard:", clipboardFile);
        console.log("Target:", target);
        console.log("Target is folder:", isFolder);

        try {
            const result = await onPaste?.({
                targetFolder: isFolder
                    ? target
                    : null,
            });

            if (result?.ok) {
                closeMenu();
            }
        } catch (error) {
            console.error(
                "Paste from context menu failed:",
                error
            );
        }
    };

    /*
     * Common hover style
     */
    const hoverStyle = (
        hovered,
        color = "inherit"
    ) => ({
        padding: "8px 12px",
        backgroundColor: hovered
            ? "#e6f7ff"
            : "transparent",
        color,
        cursor: "pointer",
    });

    return (
        <div
            ref={menuRef}
            className="custom-context-menu"
            style={{
                position: "fixed",
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                zIndex: 9999,
                width: "190px",
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
            {/* BLANK AREA */}
            {/* ================================================= */}

            {!target && (
                <>
                    <div
                        style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            setNewFolderModal?.({
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

                    {hasClipboard && (
                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={handlePasteClick}
                        >
                            📄 Paste
                        </div>
                    )}
                </>
            )}

            {/* ================================================= */}
            {/* TRASH VIEW */}
            {/* ================================================= */}

            {isTrashView &&
                (selectedList.length > 0 || target) && (
                    <>
                        <div
                            style={{
                                padding: "8px 12px",
                                color: "red",
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                await handlePermanentDelete?.();
                                closeMenu();
                            }}
                        >
                            ❌ Delete Permanently
                        </div>

                        <div
                            style={hoverStyle(
                                isHoveredRestore
                            )}
                            onClick={async () => {
                                await handleRestore?.();
                                closeMenu();
                            }}
                            onMouseEnter={() =>
                                setIsHoveredRestore?.(true)
                            }
                            onMouseLeave={() =>
                                setIsHoveredRestore?.(false)
                            }
                        >
                            🔁 Restore
                        </div>
                    </>
                )}

            {/* ================================================= */}
            {/* MULTIPLE SELECTION */}
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
                                await addToCampaign?.(
                                    selectedList
                                );
                                closeMenu();
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
                                if (handleMultiCopy) {
                                    handleMultiCopy();
                                } else {
                                    setClipboardFile?.(
                                        selectedList.map(
                                            (item) => ({
                                                ...item,
                                                action: "copy",
                                                isFolder:
                                                    !!item.isFolder,
                                            })
                                        )
                                    );
                                }

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
                                if (handleMultiCut) {
                                    handleMultiCut();
                                } else {
                                    setClipboardFile?.(
                                        selectedList.map(
                                            (item) => ({
                                                ...item,
                                                action: "cut",
                                                isFolder:
                                                    !!item.isFolder,
                                            })
                                        )
                                    );
                                }

                                setSelectedImages?.([]);

                                if (selectedImagesRef) {
                                    selectedImagesRef.current =
                                        [];
                                }

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
                                await moveToBin?.(
                                    selectedList
                                );
                                closeMenu();
                            }}
                        >
                            🗑️ Move to Bin
                        </div>

                        {/* RENAME */}

                        <div
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                handleMultiRename?.();
                                closeMenu();
                            }}
                        >
                            ✏️ Rename All
                        </div>
                    </>
                )}

            {/* ================================================= */}
            {/* SINGLE ITEM */}
            {/* ================================================= */}

            {!isTrashView &&
                !isMultiSelect &&
                target && (
                    <>
                        {/* ========================================= */}
                        {/* FOLDER */}
                        {/* ========================================= */}

                        {isFolder ? (
                            <>
                                {/* OPEN */}

                                <div
                                    style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        handleFolderClick?.(
                                            target.name
                                        );

                                        setSelectedImages?.([]);

                                        if (
                                            selectedImagesRef
                                        ) {
                                            selectedImagesRef.current =
                                                [];
                                        }

                                        closeMenu();
                                    }}
                                >
                                    📂 Open
                                </div>

                                {/* PASTE INTO FOLDER */}

                               

                                {/* ADD TO CAMPAIGN */}

                                <div
                                    style={{
                                        padding:
                                            "8px 12px",
                                        cursor:
                                            "pointer",
                                    }}
                                    onClick={async () => {
                                        await handleAddToCampaign?.(
                                            target
                                        );

                                        closeMenu();
                                    }}
                                >
                                    ➕ Add to Campaign
                                </div>

                                {/* RENAME */}

                                <div
                                    style={hoverStyle(
                                        isHoveredRename
                                    )}
                                    onClick={() => {
                                        setNewFolderModal?.({
                                            visible: true,
                                            name:
                                                target.name,
                                            mode: "rename",
                                            folderToRename:
                                                target,
                                        });

                                        setSelectedImages?.([]);

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredRename?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredRename?.(
                                            false
                                        )
                                    }
                                >
                                    <MdDriveFileRenameOutline
                                        style={{
                                            fontSize:
                                                "16px",
                                            marginRight:
                                                "8px",
                                        }}
                                    />
                                    Rename
                                </div>

                                {/* COPY FOLDER */}

                                <div
                                    style={hoverStyle(
                                        isHoveredCopy
                                    )}
                                    onClick={() =>
                                        handleCopy(target)
                                    }
                                    onMouseEnter={() =>
                                        setIsHoveredCopy?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredCopy?.(
                                            false
                                        )
                                    }
                                >
                                    <CopyOutlined
                                        style={{
                                            marginRight:
                                                8,
                                        }}
                                    />
                                    Copy
                                </div>

                                {/* CUT FOLDER */}

                                <div
                                    style={hoverStyle(
                                        isHoveredCut
                                    )}
                                    onClick={() =>
                                        handleCut(target)
                                    }
                                    onMouseEnter={() =>
                                        setIsHoveredCut?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredCut?.(
                                            false
                                        )
                                    }
                                >
                                    ✂️ Cut
                                </div>

                                {/* MOVE TO BIN */}

                                <div
                                    style={{
                                        padding:
                                            "8px 12px",
                                        color: "red",
                                        backgroundColor:
                                            isHoveredDelete
                                                ? "#e6f7ff"
                                                : "transparent",
                                        cursor:
                                            "pointer",
                                    }}
                                    onClick={async () => {
                                        await moveToBin?.([
                                            target,
                                        ]);

                                        setSelectedImages?.(
                                            []
                                        );

                                        if (
                                            selectedImagesRef
                                        ) {
                                            selectedImagesRef.current =
                                                [];
                                        }

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredDelete?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredDelete?.(
                                            false
                                        )
                                    }
                                >
                                    🗑️ Move to Bin
                                </div>
                            </>
                        ) : (
                            /* ========================================= */
                            /* FILE */
                            /* ========================================= */

                            <>
                                {/* DOWNLOAD */}

                                <div
                                    style={{
                                        padding:
                                            "8px 12px",
                                        cursor:
                                            "pointer",
                                    }}
                                    onClick={async () => {
                                        try {
                                            const url =
                                                target?.url;

                                            const name =
                                                target?.name ||
                                                target?.uid
                                                    ?.split(
                                                        "/"
                                                    )
                                                    .pop() ||
                                                "file";

                                            closeMenu();

                                            if (!url) {
                                                message.error(
                                                    "File URL unavailable for download"
                                                );
                                                return;
                                            }

                                            message.info(
                                                `Downloading ${name}...`
                                            );

                                            const res =
                                                await downloadFile(
                                                    url,
                                                    name
                                                );

                                            if (res.ok) {
                                                message.success(
                                                    `Downloaded ${name}`
                                                );
                                            } else {
                                                message.error(
                                                    `Failed to download ${name}`
                                                );
                                            }
                                        } catch (error) {
                                            console.error(
                                                error
                                            );

                                            message.error(
                                                "Download failed"
                                            );
                                        }
                                    }}
                                >
                                    ⬇️ Download
                                </div>

                                {/* EDIT */}

                                <div
                                    style={hoverStyle(
                                        isHoveredEdit
                                    )}
                                    onClick={() => {
                                        handleEditFile?.(
                                            target
                                        );

                                        setSelectedImages?.(
                                            []
                                        );

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredEdit?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredEdit?.(
                                            false
                                        )
                                    }
                                >
                                    <MdEdit
                                        style={{
                                            fontSize:
                                                "16px",
                                            marginRight:
                                                "8px",
                                        }}
                                    />
                                    Edit
                                </div>

                                {/* RENAME */}

                                <div
                                    style={hoverStyle(
                                        isHoveredRename
                                    )}
                                    onClick={() => {
                                        startRename?.(
                                            target
                                        );
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredRename?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredRename?.(
                                            false
                                        )
                                    }
                                >
                                    <MdDriveFileRenameOutline
                                        style={{
                                            fontSize:
                                                "16px",
                                            marginRight:
                                                "8px",
                                        }}
                                    />
                                    Rename
                                </div>

                                {/* DUPLICATE */}

                                <div
                                    style={hoverStyle(
                                        isHoveredDuplicate
                                    )}
                                    onClick={async () => {
                                        await duplicateFile?.(
                                            target,
                                            images
                                        );

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredDuplicate?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredDuplicate?.(
                                            false
                                        )
                                    }
                                >
                                    <HiOutlineDuplicate
                                        style={{
                                            fontSize:
                                                "16px",
                                            marginRight:
                                                "8px",
                                        }}
                                    />
                                    Duplicate
                                </div>

                                {/* MOVE TO BIN */}

                                <div
                                    style={{
                                        padding:
                                            "8px 12px",
                                        color: "red",
                                        backgroundColor:
                                            isHoveredDelete
                                                ? "#e6f7ff"
                                                : "transparent",
                                        cursor:
                                            "pointer",
                                    }}
                                    onClick={async () => {
                                        await moveToBin?.([
                                            target,
                                        ]);

                                        setSelectedImages?.(
                                            []
                                        );

                                        if (
                                            selectedImagesRef
                                        ) {
                                            selectedImagesRef.current =
                                                [];
                                        }

                                        closeMenu();
                                    }}
                                    onMouseEnter={() =>
                                        setIsHoveredDelete?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredDelete?.(
                                            false
                                        )
                                    }
                                >
                                    🗑️ Move to Bin
                                </div>

                                {/* COPY FILE */}

                                <div
                                    style={hoverStyle(
                                        isHoveredCopy
                                    )}
                                    onClick={() =>
                                        handleCopy(target)
                                    }
                                    onMouseEnter={() =>
                                        setIsHoveredCopy?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredCopy?.(
                                            false
                                        )
                                    }
                                >
                                    <CopyOutlined
                                        style={{
                                            marginRight:
                                                8,
                                        }}
                                    />
                                    Copy
                                </div>

                                {/* CUT FILE */}

                                <div
                                    style={hoverStyle(
                                        isHoveredCut
                                    )}
                                    onClick={() =>
                                        handleCut(target)
                                    }
                                    onMouseEnter={() =>
                                        setIsHoveredCut?.(
                                            true
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setIsHoveredCut?.(
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