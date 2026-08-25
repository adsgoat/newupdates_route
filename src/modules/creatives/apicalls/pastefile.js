export default function usePasteFile({
    username,
    currentFolder,
    uploadPrefix,
    images,
    clipboardFile,
    setClipboardFile,
    getUserFiles,
    message,
}) {
    // =========================================
    // GET ACTUAL FILE LIST
    // =========================================
    const getFileList = () => {
        if (Array.isArray(images)) {
            return images;
        }

        if (Array.isArray(images?.files)) {
            return images.files;
        }

        if (Array.isArray(images?.data)) {
            return images.data;
        }

        return [];
    };

    // =========================================
    // GET NEW FILE NAME
    // =========================================
    const getNewFileName = (name) => {
        const fileList = getFileList();

        const dotIndex = name.lastIndexOf(".");

        const base =
            dotIndex > -1
                ? name.substring(0, dotIndex)
                : name;

        const extension =
            dotIndex > -1
                ? name.substring(dotIndex)
                : "";

        let newName = name;
        let number = 1;

        while (
            fileList.some(
                (item) =>
                    !item.isFolder &&
                    item.name === newName
            )
        ) {
            newName =
                `${base}(${number})${extension}`;

            number++;
        }

        return newName;
    };

    // =========================================
    // PASTE
    // =========================================
    const pasteFile = async () => {
        if (
            !clipboardFile ||
            clipboardFile.length === 0
        ) {
            message.error("Nothing to paste.");

            return {
                ok: false,
            };
        }

        try {
            console.log("========== PASTE FILE ==========");
            console.log("Clipboard:", clipboardFile);
            console.log("Username:", username);
            console.log("Current folder:", currentFolder);

            for (const file of clipboardFile) {
                // Currently handling files only
                if (file.isFolder) {
                    console.warn(
                        "Folder paste skipped:",
                        file.name
                    );

                    continue;
                }

                const action = file.action;
                const sourceKey = file.uid;

                const newName = getNewFileName(
                    file.name
                );

                const destinationKey =
                    `${uploadPrefix}${currentFolder}${newName}`;

                console.log("Action:", action);
                console.log("File:", file.name);
                console.log("Source Key:", sourceKey);
                console.log("Destination Key:", destinationKey);
                console.log("Username:", username);

                // =========================================
                // COPY
                // =========================================
                if (action === "copy") {
                    console.log("========== COPY PASTE ==========");

                    // Fix S3 region
                    const normalizedUrl =
                        file.url?.replace(
                            "s3.us-east-1.amazonaws.com",
                            "s3.ap-south-1.amazonaws.com"
                        );

                    console.log(
                        "Original URL:",
                        file.url
                    );

                    console.log(
                        "Normalized URL:",
                        normalizedUrl
                    );

                    if (!normalizedUrl) {
                        throw new Error(
                            "File URL is missing."
                        );
                    }

                    // Get original file through proxy
                    const proxyResponse =
                        await fetch(
                            `/api/creatives/proxy?url=${encodeURIComponent(
                                normalizedUrl
                            )}`
                        );

                    if (!proxyResponse.ok) {
                        throw new Error(
                            `Failed to get original file: ${proxyResponse.status}`
                        );
                    }

                    const blob =
                        await proxyResponse.blob();

                    if (!blob.size) {
                        throw new Error(
                            "Original file is empty."
                        );
                    }

                    console.log(
                        "Downloaded blob size:",
                        blob.size
                    );

                    // Create new file
                    const copiedFile =
                        new File(
                            [blob],
                            newName,
                            {
                                type:
                                    blob.type ||
                                    "application/octet-stream",
                            }
                        );

                    // Create FormData
                    const formData =
                        new FormData();

                    formData.append(
                        "file",
                        copiedFile
                    );

                    formData.append(
                        "filename",
                        destinationKey
                    );

                    formData.append(
                        "folder",
                        currentFolder
                    );

                    formData.append(
                        "username",
                        username || ""
                    );

                    console.log(
                        "Uploading copied file:",
                        newName
                    );

                    console.log(
                        "Upload destination:",
                        destinationKey
                    );

                    // Upload
                    const uploadResponse =
                        await fetch(
                            "/api/creatives/upload",
                            {
                                method: "POST",
                                body: formData,
                            }
                        );

                    if (!uploadResponse.ok) {
                        const error =
                            await uploadResponse
                                .json()
                                .catch(() => ({}));

                        throw new Error(
                            error?.message ||
                            `Copy paste failed: ${uploadResponse.status}`
                        );
                    }

                    console.log(
                        "Copy paste successful"
                    );
                }

                // =========================================
                // CUT
                // =========================================
                else if (action === "cut") {
                    console.log("========== CUT PASTE ==========");

                    const response =
                        await fetch(
                            "/api/creatives/fileorfolder",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify({
                                    sourceKey,
                                    destinationKey,
                                    username,
                                }),
                            }
                        );

                    if (!response.ok) {
                        const error =
                            await response
                                .json()
                                .catch(() => ({}));

                        throw new Error(
                            error?.message ||
                            `Cut paste failed: ${response.status}`
                        );
                    }

                    console.log(
                        "Cut paste successful"
                    );
                }

                else {
                    console.warn(
                        "Unknown clipboard action:",
                        action
                    );
                }
            }

            // =========================================
            // SUCCESS
            // =========================================
            message.success(
                "File pasted successfully"
            );

            // Clear clipboard
            setClipboardFile([]);

            // Refresh files
            if (getUserFiles) {
                await getUserFiles();
            }

            return {
                ok: true,
            };

        } catch (error) {
            console.error(
                "Paste file failed:",
                error
            );

            message.error(
                error?.message ||
                "Failed to paste file."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        pasteFile,
    };
}