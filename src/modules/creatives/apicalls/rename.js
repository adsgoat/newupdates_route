export default function useRenameFile({
    inlineName,
    setInlineName,
    setEditingUid,
    setContextMenu,
    setSelectedImages,
    selectedImagesRef,
    images,
    userdetails,
    getUserFiles,
    message,
}) {
    // ==========================================
    // START RENAME
    // ==========================================
    const startRename = (image) => {
        if (!image) {
            message.error("No file selected.");
            return;
        }

        console.log("========== RENAME START ==========");
        console.log("Selected item:", image);

        setEditingUid(image.uid);

        // Remove extension while editing
        setInlineName(
            image.name?.includes(".")
                ? image.name.substring(
                      0,
                      image.name.lastIndexOf(".")
                  )
                : image.name || ""
        );

        // Clear selection
        setSelectedImages([]);
        selectedImagesRef.current = [];

        // Close context menu
        setContextMenu((prev) => ({
            ...prev,
            visible: false,
        }));
    };

    // ==========================================
    // INLINE RENAME
    // ==========================================
    const handleInlineRename = async (image) => {
        if (!inlineName.trim()) {
            message.error("Name cannot be empty");
            return;
        }

        if (!image) {
            message.error("No file selected.");
            return;
        }

        const oldKey = image.uid;

        // Find folder path
        const lastSlashIndex = oldKey.lastIndexOf("/");

        const basePath =
            oldKey.substring(0, lastSlashIndex + 1);

        // Get original extension
        const extension = image.isFolder
            ? ""
            : image.name?.includes(".")
            ? image.name.substring(
                  image.name.lastIndexOf(".")
              )
            : "";

        const newName = inlineName.trim();

        // Build new S3 key
        const newKey = image.isFolder
            ? `${basePath}${newName}/`
            : `${basePath}${newName}${extension}`;

        console.log("========== RENAME ==========");
        console.log("Old key:", oldKey);
        console.log("New name:", newName);
        console.log("Extension:", extension);
        console.log("New key:", newKey);
        console.log("Is folder:", image.isFolder);

        // Nothing changed
        if (newKey === oldKey) {
            setEditingUid(null);
            setInlineName("");
            return;
        }

        try {
            // ==========================================
            // FOLDER RENAME
            // ==========================================
            if (image.isFolder) {
                const response = await fetch(
                    "/api/creatives/folders/renamefolder",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            oldFolderKey: oldKey,
                            newFolderKey: newKey,
                            username:
                                userdetails?.userName,
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

                const data =
                    await response.json();

                console.log(
                    "Folder rename response:",
                    data
                );
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
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            key: oldKey,
                            newFilename: newKey,
                            username:
                                userdetails?.userName,
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

                const data =
                    await response.json();

                console.log(
                    "File rename response:",
                    data
                );
            }

            // ==========================================
            // SUCCESS
            // ==========================================
            message.success(
                image.isFolder
                    ? "Folder renamed successfully"
                    : "File renamed successfully"
            );

            setEditingUid(null);
            setInlineName("");

            // Refresh existing user files
            if (getUserFiles) {
                await getUserFiles();
            }
        } catch (error) {
            console.error(
                "Rename failed:",
                error?.message || error
            );

            message.error(
                error?.message ||
                    "Failed to rename file."
            );
        }
    };

    return {
        startRename,
        handleInlineRename,
    };
}