export default function useAddToCampaign({
    userdetails,
    setCheckboxSelected,
    selectedImagesRef,
    setHighlightedFolders,
    getFileType,
    message,
}) {
    const addToCampaign = async (folder) => {
        if (!folder) {
            message.error("No folder selected.");
            return {
                ok: false,
            };
        }

        try {
            const folderKey = folder.uid;

            console.log(
                "========== ADD TO CAMPAIGN =========="
            );
            console.log("Folder:", folder);
            console.log("Folder key:", folderKey);

            const params = new URLSearchParams({
                username:
                    userdetails?.userName || "",
                folder: folderKey,
            });

            const response = await fetch(
                `/api/creatives/userfiles?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to get folder files: ${response.status}`
                );
            }

            const data = await response.json();

            const files = (data.images || [])
                .filter(
                    (file) =>
                        !file.key.endsWith("/")
                )
                .map((file) => ({
                    uid: file.key,
                    name:
                        file.key
                            .split("/")
                            .pop(),
                    url: `https://sudheer-fbimages.s3.amazonaws.com/${file.key}`,
                    type: getFileType(
                        file.key
                    ),
                }));

            console.log(
                "Files added to campaign:",
                files
            );

            setCheckboxSelected((prev) => {
                const merged = [
                    ...prev,
                    ...files,
                ].filter(
                    (item, index, array) =>
                        array.findIndex(
                            (x) =>
                                x.uid === item.uid
                        ) === index
                );

                selectedImagesRef.current =
                    merged;

                return merged;
            });

            setHighlightedFolders((prev) => [
                ...new Set([
                    ...prev,
                    folderKey,
                ]),
            ]);

            message.success(
                `${files.length} files added to campaign`
            );

            return {
                ok: true,
                files,
            };
        } catch (error) {
            console.error(
                "Add to campaign failed:",
                error
            );

            message.error(
                error?.message ||
                "Failed to add files to campaign."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    return {
        addToCampaign,
    };
}