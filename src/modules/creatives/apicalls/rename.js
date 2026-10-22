export default function useRenameFile({
    inlineName,
    setInlineName,
    setEditingUid,
    setContextMenu,
    setSelectedImages,
    selectedImagesRef,
    images,
    userdetails,
    username,
    getUserFiles,
    getFolderFiles,
    currentFolder,
    message,
}) {

    // ==========================================
    // ACTUAL RENAME API
    // ==========================================
    const renameItem = async (image, renameName) => {
        if (!image) {
            message.error("No file selected.");
            return false;
        }

        const newName = renameName?.trim();

        if (!newName) {
            message.error("Name cannot be empty");
            return false;
        }

        const oldKey = image.uid;

        const lastSlashIndex = oldKey.lastIndexOf("/");

        const basePath =
            oldKey.substring(0, lastSlashIndex + 1);

        const extension = image.isFolder
            ? ""
            : image.name?.includes(".")
                ? image.name.substring(
                    image.name.lastIndexOf(".")
                )
                : "";

        const newKey = image.isFolder
            ? `${basePath}${newName}/`
            : `${basePath}${newName}${extension}`;

        console.log("========== RENAME ==========");
        console.log("Old key:", oldKey);
        console.log("New name:", newName);
        console.log("New key:", newKey);
        console.log("Is folder:", image.isFolder);

        // Nothing changed
        if (newKey === oldKey) {
            return true;
        }

        try {
            // ==========================================
            // FOLDER RENAME
            // ==========================================
            if (image.isFolder) {
                const response = await fetch(
                    "/api/creatives/folderrename",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            oldFolderKey: oldKey,
                            newFolderKey: newKey,
                            username: username,
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData =
                        await response.json().catch(
                            () => ({})
                        );

                    throw new Error(
                        errorData?.message ||
                        `Folder rename failed: ${response.status}`
                    );
                }

                await response.json();
            }

            // ==========================================
            // FILE RENAME
            // ==========================================
            else {
                const response = await fetch(
                    "/api/creatives/userfilesrename",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            key: oldKey,
                            newFilename: newKey,
                            username: username,
                        }),
                    }
                );

                if (!response.ok) {
                    const errorData =
                        await response.json().catch(
                            () => ({})
                        );

                    throw new Error(
                        errorData?.message ||
                        `File rename failed: ${response.status}`
                    );
                }

                await response.json();
            }

            message.success(
                image.isFolder
                    ? "Folder renamed successfully"
                    : "File renamed successfully"
            );

            if (image.isFolder) {
                if (currentFolder) {
                    await getFolderFiles(currentFolder);
                } else {
                    await getUserFiles();
                }
            } else {
                if (currentFolder) {
                    await getFolderFiles(currentFolder);
                } else {
                    await getUserFiles();
                }
            }

            return true;
        } catch (error) {
            console.error(
                "Rename failed:",
                error?.message || error
            );

            message.error(
                error?.message ||
                "Failed to rename file."
            );

            return false;
        }
    };

    // ==========================================
    // START INLINE RENAME
    // ==========================================
    const startRename = (image) => {
        if (!image) {
            message.error("No file selected.");
            return;
        }

        setEditingUid(image.uid);

        setInlineName(
            image.name?.includes(".")
                ? image.name.substring(
                    0,
                    image.name.lastIndexOf(".")
                )
                : image.name || ""
        );

        setSelectedImages([]);
        selectedImagesRef.current = [];

        setContextMenu((prev) => ({
            ...prev,
            visible: false,
        }));
    };

    // ==========================================
    // INLINE RENAME
    // ==========================================
    const handleInlineRename = async (image) => {
        const success = await renameItem(
            image,
            inlineName
        );

        if (!success) return;

        setEditingUid(null);
        setInlineName("");
    };

    return {
        startRename,
        handleInlineRename,
        renameItem,
    };
}