"use client";

export default function useRestore({
    username,
    selectedKey,
    selectedAccountNumber,
    message,
    fetchTrashFiles,
}) {
    const handleRestore = async (items) => {
        if (!items || items.length === 0) {
            message.error("No file selected.");
            return {
                ok: false,
            };
        }

        if (!selectedKey || !selectedAccountNumber) {
            console.error("Restore missing:", {
                selectedKey,
                selectedAccountNumber,
            });

            message.error(
                "Please select a network and account."
            );

            return {
                ok: false,
            };
        }

        try {
            await Promise.all(
                items.map(async (item) => {
                    const trashKey = item.uid;

                    const match = trashKey.match(
                        /Trashfiles\/(?:[^/]+\/)?(.+)/
                    );

                    const relativePath = match?.[1];

                    if (!relativePath) {
                        throw new Error(
                            "Invalid original path"
                        );
                    }

                    const originalKey =
                        `${selectedKey}/${selectedAccountNumber}/${relativePath}`;

                    console.log("========== RESTORE ==========");
                    console.log("trashKey:", trashKey);
                    console.log(
                        "selectedKey:",
                        selectedKey
                    );
                    console.log(
                        "selectedAccountNumber:",
                        selectedAccountNumber
                    );
                    console.log(
                        "relativePath:",
                        relativePath
                    );
                    console.log(
                        "originalKey:",
                        originalKey
                    );

                    const response = await fetch(
                        "/api/creatives/trashfiles",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                                username,
                            },
                            body: JSON.stringify({
                                trashKey,
                                originalKey,
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
                                `Restore failed: ${response.status}`
                        );
                    }
                })
            );

            message.success(
                items.length === 1
                    ? "Restored successfully"
                    : "Selected items restored successfully"
            );

            if (fetchTrashFiles) {
                await fetchTrashFiles();
            }

            return {
                ok: true,
            };
        } catch (error) {
            console.error(
                "Restore failed:",
                error
            );

            message.error(
                error?.message ||
                    "Failed to restore."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        handleRestore,
    };
}