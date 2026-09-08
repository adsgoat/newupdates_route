export default function useCopyFile({
    username,
    currentFolder,
    uploadPrefix,
    getUserFiles,
    message,
}) {
    const getCloneNumber = (name, images) => {
        const dotIndex = name.lastIndexOf(".");

        const base =
            dotIndex > -1 ? name.substring(0, dotIndex)
                : name;

        const extension =
            dotIndex > -1
                ? name.substring(dotIndex)
                : "";

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

    const copyFile = async (file, images = []) => {
        if (!file) {
            message.error("No file selected.");
            return;
        }

        try {
            console.log("========== COPY ==========");
            console.log("File:", file);
            console.log("Is folder:", file.isFolder);

            const sourceKey = file.uid;
            const name = file.name;

            // =========================
            // FOLDER COPY
            // =========================
            if (file.isFolder) {
                const destinationKey =
                    `${uploadPrefix}${currentFolder}${name}/`;

                const response = await fetch(
                    "/api/creatives/foldercopy",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            sourceKey,
                            destinationKey,
                            username: username,
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

            // =========================
            // FILE COPY
            // =========================
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
                    "Source:",
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

                // Get original file through Next proxy
                const normalizedUrl = file.url?.replace(
                    "s3.us-east-1.amazonaws.com",
                    "s3.ap-south-1.amazonaws.com"
                );

                console.log("Original URL:", file.url);
                console.log("Normalized URL:", normalizedUrl);

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

                const copiedFile = new File(
                    [blob],
                    newName,
                    {
                        type:
                            blob.type ||
                            "application/octet-stream",
                    }
                );

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
                    username
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
                    ? "Folder copied successfully"
                    : "File copied successfully"
            );

            if (getUserFiles) {
                await getUserFiles();
            }

            return {
                ok: true,
            };
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );

            message.error(
                error?.message ||
                "Failed to copy."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        copyFile,
    };
}