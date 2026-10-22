"use client";

export default function useEditFile({
    setSelectedImage,
    setIsEditorVisible,
    message,
}) {
    const handleEditFile = (image) => {
        if (!image || !image.url) {
            if (message) {
                message.error(
                    "Invalid image selected for editing."
                );
            } else {
                console.error(
                    "Invalid image selected for editing."
                );
            }

            return;
        }

        try {
            const correctedFileUrl = image.url?.replace(
                "s3.us-east-1.amazonaws.com",
                "s3.ap-south-1.amazonaws.com"
            );
            const proxyUrl =
                `/api/creatives/proxy?url=${encodeURIComponent(
                    correctedFileUrl
                )}`;

            console.log(
                "Edit image:",
                image
            );

            setSelectedImage({
                ...image,
                url: proxyUrl,
            });

            setIsEditorVisible(true);
        } catch (error) {
            console.error(
                "Error opening image editor:",
                error
            );

            if (message) {
                message.error(
                    "Failed to open image editor."
                );
            }
        }
    };

    return {
        handleEditFile,
    };
}