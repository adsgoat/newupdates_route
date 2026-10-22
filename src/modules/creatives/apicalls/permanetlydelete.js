"use client";

export default function usePermanentDelete({
    username,
    message,
    fetchTrashFiles,
}) {
    const handlePermanentDelete = async (items) => {
        if (!items || items.length === 0) {
            message.error("No file selected.");
            return {
                ok: false,
            };
        }

        try {
            console.log(
                "========== PERMANENT DELETE =========="
            );
            console.log("Items:", items);

            await Promise.all(
                items.map(async (item) => {
                    console.log(
                        "Deleting permanently:",
                        item
                    );
                    console.log(
                        "UID:",
                        item.uid
                    );

                    const response = await fetch(
                        "/api/creatives/trashfiles",
                        {
                            method: "DELETE",
                            headers: {
                                username,
                                "x-file": item.uid,
                            },
                        }
                    );

                    if (!response.ok) {
                        const error =
                            await response
                                .json()
                                .catch(() => ({}));

                        throw new Error(
                            error?.message ||
                            `Permanent delete failed: ${response.status}`
                        );
                    }
                })
            );

            message.success(
                items.length === 1
                    ? "Deleted permanently"
                    : "Selected items deleted permanently"
            );

            // Refresh trash files
            if (fetchTrashFiles) {
                console.log(
                    "Refreshing trash files..."
                );

                await fetchTrashFiles();
            }

            return {
                ok: true,
            };
        } catch (error) {
            console.error(
                "Permanent delete failed:",
                error
            );

            message.error(
                error?.message ||
                "Failed to delete permanently."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        handlePermanentDelete,
    };
}