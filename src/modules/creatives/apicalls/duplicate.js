export default function useDuplicateFile({
    userdetails,
    currentFolder,
    uploadPrefix,
    getUserFiles,
    message,
}) {
    const getCloneNumber = (name, images) => {
        const dotIndex = name.lastIndexOf(".");

        const base =
            dotIndex > -1
                ? name.substring(0, dotIndex)
                : name;

        const extension =
            dotIndex > -1
                ? name.substring(dotIndex)
                : "";

        // Get actual file array
        const fileList = Array.isArray(images)
            ? images
            : Array.isArray(images?.files)
                ? images.files
                : Array.isArray(images?.data)
                    ? images.data
                    : [];

        let number = 1;

        while (
            fileList.some(
                (item) =>
                    item.name ===
                    `${base}(${number})${extension}`
            )
        ) {
            number++;
        }

        return number;
    };
    const duplicateFile = async (file, images) => {
        if (!file) {
            message.error("No file selected.");
            return;
        }

        try {
            console.log("========== DUPLICATE ==========");
            console.log("File:", file);
            console.log("Is folder:", file.isFolder);

            const sourceKey = file.uid;
            const name = file.name;

            // =====================================
            // FOLDER
            // =====================================
            if (file.isFolder) {
                const destinationKey =
                    `${uploadPrefix}${currentFolder}${name}/`;

                console.log(
                    "Folder source:",
                    sourceKey
                );

                console.log(
                    "Folder destination:",
                    destinationKey
                );

                const response = await fetch(
                    "/api/creatives/folders/foldercopy",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            sourceKey,
                            destinationKey,
                            username:
                                userdetails?.userName,
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
                        `Copy folder failed: ${response.status}`
                    );
                }
            }

            // =====================================
            // FILE
            // =====================================
            else {
                const cloneNumber =
                    getCloneNumber(name, images);

                const dotIndex =
                    name.lastIndexOf(".");

                const base =
                    dotIndex > -1
                        ? name.substring(
                            0,
                            dotIndex
                        )
                        : name;

                const extension =
                    dotIndex > -1
                        ? name.substring(dotIndex)
                        : "";

                const newName =
                    `${base}(${cloneNumber})${extension}`;

                const destinationKey =
                    `${uploadPrefix}${currentFolder}${newName}`;

                console.log(
                    "Source URL:",
                    file.url
                );

                console.log(
                    "New name:",
                    newName
                );

                console.log(
                    "Destination:",
                    destinationKey
                );

                const correctedFileUrl = file.url?.replace(
                    "s3.us-east-1.amazonaws.com",
                    "s3.ap-south-1.amazonaws.com"
                );

                console.log("Original URL:", file.url);
                console.log("Corrected URL:", correctedFileUrl);

                const proxyUrl =
                    `/api/creatives/proxy?url=${encodeURIComponent(
                        correctedFileUrl
                    )}`;

                const proxyResponse =
                    await fetch(proxyUrl);

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

                const copiedFile = new File(
                    [blob],
                    newName,
                    {
                        type:
                            blob.type ||
                            "application/octet-stream",
                    }
                );

                // Upload through Next.js API
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
                    userdetails?.userName || ""
                );

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
                        `Upload failed: ${uploadResponse.status}`
                    );
                }
            }

            message.success(
                file.isFolder
                    ? "Folder duplicated successfully"
                    : "File duplicated successfully"
            );

            // Refresh existing Get User Files
            if (getUserFiles) {
                await getUserFiles();
            }

            return {
                ok: true,
            };
        } catch (error) {
            console.error(
                "Duplicate failed:",
                error
            );

            message.error(
                error?.message ||
                "Failed to duplicate."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        duplicateFile,
    };
}