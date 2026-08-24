"use client";

import { useState } from "react";

export default function useTrash({
    userName,
    selectedKey,
    selectedAccountNumber,
    setSelectedImages,
    selectedImagesRef,
    fetchUserImages,
}) {
    const [isTrashView, setIsTrashView] = useState(false);

    const [trashItems, setTrashItems] = useState([]);

    const [trashLoading, setTrashLoading] = useState(false);

    // =========================================================
    // FETCH TRASH FILES
    // =========================================================

    const fetchTrashFiles = async () => {
        if (
            // !userName ||
            !selectedKey ||
            !selectedAccountNumber
        ) {
            console.log(
                "Trash fetch skipped - missing user/account information"
            );
            return;
        }

        setTrashLoading(true);

        const trashPath =
            `${selectedKey}/${selectedAccountNumber}`;

        console.log(
            "========== FETCH TRASH =========="
        );

        console.log(
            "Username:",
            userName
        );

        console.log(
            "Selected Key:",
            selectedKey
        );

        console.log(
            "Selected Account:",
            selectedAccountNumber
        );

        console.log(
            "Trash Path:",
            trashPath
        );

        try {
            const params = new URLSearchParams({
                username: userName,
                folder: trashPath,
            });

            const response = await fetch(
                `/api/creatives/trashfiles?${params.toString()}`
            );

            const data = await response.json();

            console.log(
                "Trash API response:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `Failed to fetch trash files: ${response.status}`
                );
            }

            const images = data?.images;

            if (!Array.isArray(images)) {
                console.log(
                    "Trash API returned no images"
                );

                setTrashItems([]);
                return;
            }

            const filteredItems = images
                .filter((file) => {
                    const key = file?.key;

                    if (!key) {
                        return false;
                    }

                    if (key === trashPath) {
                        return false;
                    }

                    const trashPrefix =
                        `${trashPath}/Trashfiles/`;

                    const relativePath =
                        key.startsWith(trashPrefix)
                            ? key.replace(
                                trashPrefix,
                                ""
                            )
                            : "";

                    const isFolder =
                        key.endsWith("/");

                    const isImmediateChild =
                        relativePath !== "" &&
                        !relativePath.includes("/");

                    const folderRelativePath =
                        relativePath.endsWith("/")
                            ? relativePath.slice(0, -1)
                            : relativePath;

                    const isImmediateFolder =
                        isFolder &&
                        folderRelativePath !== "" &&
                        !folderRelativePath.includes("/");

                    return (
                        isImmediateChild ||
                        isImmediateFolder
                    );
                })
                .map((file) => {
                    const key = file?.key || "";

                    const isFolder =
                        key.endsWith("/");

                    const name = key
                        .split("/")
                        .filter(Boolean)
                        .pop();

                    return {
                        uid: key,

                        name,

                        status: "done",

                        url: isFolder
                            ? null
                            : `https://sudheer-fbimages.s3.amazonaws.com/${key}`,

                        isFolder,

                        createdDate:
                            file.createdDate ||
                            null,

                        modifiedDate:
                            file.modifiedDate ||
                            null,

                        uploadDate:
                            file.uploadDate ||
                            null,
                    };
                });

            console.log(
                "Filtered trash items:",
                filteredItems
            );

            setTrashItems(filteredItems);
        } catch (error) {
            console.error(
                "Error fetching trash files:",
                error
            );

            setTrashItems([]);
        } finally {
            setTrashLoading(false);
        }
    };

    // =========================================================
    // OPEN / CLOSE TRASH
    // =========================================================

    const toggleTrashView = async () => {
        const nextValue =
            !isTrashView;

        console.log(
            "========== TRASH TOGGLE =========="
        );

        console.log(
            "Current Trash View:",
            isTrashView
        );

        console.log(
            "Next Trash View:",
            nextValue
        );

        setIsTrashView(nextValue);

        setSelectedImages?.([]);

        if (selectedImagesRef) {
            selectedImagesRef.current = [];
        }

        if (nextValue) {
            await fetchTrashFiles();
        } else {
            setTrashItems([]);
        }
    };

    const closeTrashView = () => {
        setIsTrashView(false);

        setTrashItems([]);

        setSelectedImages?.([]);

        if (selectedImagesRef) {
            selectedImagesRef.current = [];
        }
    };

    // =========================================================
    // PERMANENT DELETE
    // =========================================================

    const permanentlyDeleteItems = async (
        items = []
    ) => {
        if (!items.length) {
            return;
        }

        try {
            await Promise.all(
                items.map(async (item) => {
                    const response =
                        await fetch(
                            "/api/creatives/trashfiles",
                            {
                                method: "DELETE",

                                headers: {
                                    Authorization:
                                        localStorage.getItem(
                                            "token"
                                        ),

                                    username:
                                        userName,

                                    "x-file":
                                        item.uid,
                                },
                            }
                        );

                    if (!response.ok) {
                        const error =
                            await response
                                .json()
                                .catch(
                                    () => ({})
                                );

                        throw new Error(
                            error?.message ||
                            `Delete failed: ${response.status}`
                        );
                    }
                })
            );

            setSelectedImages?.([]);

            if (selectedImagesRef) {
                selectedImagesRef.current = [];
            }

            // Refresh Trash
            await fetchTrashFiles();

            // Refresh normal files
            if (fetchUserImages) {
                await fetchUserImages();
            }
        } catch (error) {
            console.error(
                "Permanent delete failed:",
                error
            );

            throw error;
        }
    };

    // =========================================================
    // RESTORE ITEMS
    // =========================================================

    const restoreItems = async (
        items = []
    ) => {
        if (!items.length) {
            return;
        }

        try {
            await Promise.all(
                items.map(async (item) => {
                    const trashKey =
                        item.uid;

                    /*
                     * Example:
                     *
                     * FB_Mnet/
                     * 3564501213830980/
                     * Trashfiles/
                     * Image1.jpeg
                     *
                     * We need:
                     *
                     * Image1.jpeg
                     */

                    const match =
                        trashKey.match(
                            /Trashfiles\/(?:[^/]+\/)?(.+)/
                        );

                    const relativePath =
                        match?.[1];

                    if (!relativePath) {
                        throw new Error(
                            "Invalid original path"
                        );
                    }

                    const originalKey =
                        `${selectedKey}/${selectedAccountNumber}/${relativePath}`;

                    console.log(
                        "========== RESTORE =========="
                    );

                    console.log(
                        "Trash Key:",
                        trashKey
                    );

                    console.log(
                        "Original Key:",
                        originalKey
                    );

                    const response =
                        await fetch(
                            "/api/creatives/trashfiles",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    Authorization:
                                        localStorage.getItem(
                                            "token"
                                        ),

                                    username:
                                        userName,
                                },

                                body:
                                    JSON.stringify({
                                        trashKey,
                                        originalKey,
                                    }),
                            }
                        );

                    if (!response.ok) {
                        const error =
                            await response
                                .json()
                                .catch(
                                    () => ({})
                                );

                        throw new Error(
                            error?.message ||
                            `Restore failed: ${response.status}`
                        );
                    }
                })
            );

            setSelectedImages?.([]);

            if (selectedImagesRef) {
                selectedImagesRef.current = [];
            }

            // Refresh normal files
            if (fetchUserImages) {
                await fetchUserImages();
            }

            // Refresh Trash
            await fetchTrashFiles();
        } catch (error) {
            console.error(
                "Restore failed:",
                error
            );

            throw error;
        }
    };

    // =========================================================
    // REMOVE ITEM FROM LOCAL TRASH LIST
    // =========================================================

    const removeTrashItemsLocally = (
        items = []
    ) => {
        const ids = new Set(
            items.map(
                (item) => item.uid
            )
        );

        setTrashItems(
            (prev) =>
                prev.filter(
                    (item) =>
                        !ids.has(item.uid)
                )
        );
    };

    // =========================================================
    // RETURN
    // =========================================================

    return {
        // State
        isTrashView,
        trashItems,
        trashLoading,

        // Fetch
        fetchTrashFiles,

        // View
        toggleTrashView,
        closeTrashView,

        // Actions
        permanentlyDeleteItems,
        restoreItems,

        // Local helper
        removeTrashItemsLocally,
    };
}