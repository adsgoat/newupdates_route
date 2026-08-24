"use client";

import { message } from "antd";

export default function useImageUrl({
    urlInput,
    setUrlInput,

    setPreviewFile,
    setPendingFiles,
    setUploadingIndex,
    setUploadFileList,
    setFileInputName,
    setTotalFiles,
    setIsModalVisible,
    setLoading,
}) {
    const handleUploadURL = async () => {
        if (!urlInput.trim()) {
            message.error("Please enter a valid URL.");
            return;
        }

        // =========================================
        // RESET PREVIOUS UPLOAD STATE
        // =========================================

        setPreviewFile(null);
        setPendingFiles([]);
        setUploadingIndex(0);
        setUploadFileList([]);
        setFileInputName("");

        try {
            setLoading(true);

            let finalUrl = urlInput.trim();

            console.log("Image URL entered:", finalUrl);

            // =========================================
            // BASE64 DATA URL
            // =========================================

            if (finalUrl.startsWith("data:")) {
                const matches = finalUrl.match(
                    /^data:(.+);base64,(.+)$/
                );

                if (!matches) {
                    throw new Error(
                        "Invalid data URL format."
                    );
                }

                const contentType = matches[1];
                const base64Data = matches[2];

                const byteString = atob(base64Data);

                const uint8Array = new Uint8Array(
                    byteString.length
                );

                for (
                    let i = 0;
                    i < byteString.length;
                    i++
                ) {
                    uint8Array[i] =
                        byteString.charCodeAt(i);
                }

                const blob = new Blob(
                    [uint8Array],
                    {
                        type: contentType,
                    }
                );

                const ext =
                    contentType.split("/")[1] || "jpg";

                const fileName =
                    `data_url_${Date.now()}.${ext}`;

                const file = new File(
                    [blob],
                    fileName,
                    {
                        type: contentType,
                    }
                );

                setPreviewFile({
                    url: URL.createObjectURL(blob),
                    name: fileName,
                    file,
                    type: contentType.startsWith("video")
                        ? "video"
                        : "image",
                });

                setPendingFiles((prev) =>
                    prev
                        ? [...prev, file]
                        : [file]
                );

                setTotalFiles(
                    (prev) => prev + 1
                );

                setFileInputName(
                    fileName.replace(
                        /\.[^/.]+$/,
                        ""
                    )
                );

                setUrlInput("");

                setIsModalVisible(true);

                return;
            }

            // =========================================
            // GOOGLE IMAGE URL
            // =========================================

            const urlObj = new URL(finalUrl);

            const imgurlParam =
                urlObj.searchParams.get("imgurl");

            if (
                imgurlParam &&
                imgurlParam.startsWith("http")
            ) {
                finalUrl =
                    decodeURIComponent(imgurlParam);

                console.log(
                    "Extracted Image URL:",
                    finalUrl
                );
            }

            // =========================================
            // BACKEND PROXY
            // =========================================

            const proxyUrl =
                `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(
                    finalUrl
                )}`;

            console.log(
                "Proxy URL:",
                proxyUrl
            );

            const response = await fetch(
                proxyUrl,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            localStorage.getItem(
                                "token"
                            ),
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch file. Status: ${response.status}`
                );
            }

            // =========================================
            // CONTENT TYPE
            // =========================================

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";

            console.log(
                "Content Type:",
                contentType
            );

            if (
                !contentType.startsWith("image") &&
                !contentType.startsWith("video")
            ) {
                throw new Error(
                    "The URL does not point to a valid image or video file."
                );
            }

            // =========================================
            // CREATE BLOB
            // =========================================

            const blob =
                await response.blob();

            console.log(
                "File fetched successfully:",
                blob
            );

            // =========================================
            // FILE EXTENSION
            // =========================================

            const extension =
                contentType.split("/")[1] ||
                "jpg";

            const fileName =
                `url_file_${Date.now()}.${extension}`;

            // =========================================
            // CREATE FILE
            // =========================================

            const file = new File(
                [blob],
                fileName,
                {
                    type: contentType,
                }
            );

            // =========================================
            // PREVIEW FILE
            // =========================================

            setPreviewFile({
                url: URL.createObjectURL(blob),
                name: fileName,
                file,
                type: contentType.startsWith(
                    "video"
                )
                    ? "video"
                    : "image",
            });

            // =========================================
            // PENDING FILES
            // =========================================

            setPendingFiles((prev) =>
                prev
                    ? [...prev, file]
                    : [file]
            );

            // =========================================
            // FILE COUNT
            // =========================================

            setTotalFiles(
                (prev) => prev + 1
            );

            // =========================================
            // FILE NAME
            // =========================================

            setFileInputName(
                fileName.replace(
                    /\.[^/.]+$/,
                    ""
                )
            );

            // =========================================
            // CLEAR URL INPUT
            // =========================================

            setUrlInput("");

            // =========================================
            // OPEN CONFIRM UPLOAD MODAL
            // =========================================

            setIsModalVisible(true);

        } catch (error) {
            console.error(
                "Image URL Error:",
                error
            );

            message.error(
                error.message ||
                    "Failed to fetch or decode the file."
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        handleUploadURL,
    };
}