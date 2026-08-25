export default function useMoveToBin({
    username,
    getUserFiles,
    message,
}) {
    const moveToBin = async (items) => {
        if (!items || items.length === 0) {
            message.error("No file selected.");
            return {
                ok: false,
            };
        }

        try {
            console.log("========== MOVE TO BIN ==========");
            console.log("Items:", items);

            await Promise.all(
                items.map(async (item) => {
                    console.log("Moving:", item);
                    console.log("Is folder:", item.isFolder);
                    console.log("UID:", item.uid);

                    let response;

                    // =========================
                    // FOLDER
                    // =========================
                    if (item.isFolder) {
                        response = await fetch(
                            "/api/creatives/folderdelete",
                            {
                                method: "DELETE",
                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify({
                                    folderKey: item.uid,
                                    username:username,
                                }),
                            }
                        );
                    }

                    else {
                        response = await fetch(
                            "/api/creatives/userfilesdelete",
                            {
                                method: "DELETE",
                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },
                                body: JSON.stringify({
                                    fileKey: item.uid,
                                    username:username,
                                }),
                            }
                        );
                    }

                    if (!response.ok) {
                        const error =
                            await response
                                .json()
                                .catch(() => ({}));

                        throw new Error(
                            error?.message ||
                                `Move to bin failed: ${response.status}`
                        );
                    }
                })
            );

            message.success(
                items.length === 1
                    ? "Moved to bin successfully"
                    : "Selected items moved to bin successfully"
            );

            // Refresh using your existing Get User Files
            if (getUserFiles) {
                await getUserFiles();
            }

            return {
                ok: true,
            };
        } catch (error) {
            console.error(
                "Move to bin failed:",
                error
            );

            message.error(
                error?.message ||
                    "Failed to move items to bin."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        moveToBin,
    };
}