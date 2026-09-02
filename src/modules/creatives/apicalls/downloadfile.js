const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
};

export default async function downloadFile(
    fileUrl,
    filename
) {
    const safeName =
        filename ||
        fileUrl.split("/").pop() ||
        "download";

    try {
        const proxyUrl =
            `https://app.vyaktimetrics.com/creatives/proxy?url=${encodeURIComponent(
                fileUrl
            )}`;

        const res = await fetch(proxyUrl, {
            method: "GET",
            headers: {
                Authorization:
                    localStorage.getItem("token"),
            },
        });

        if (res.ok) {
            const blob = await res.blob();

            if (blob.size > 0) {
                downloadBlob(
                    blob,
                    safeName
                );

                return {
                    ok: true,
                };
            }
        }

        console.warn(
            "Proxy failed or returned empty blob"
        );
    } catch (err) {
        console.warn(
            "Proxy failed:",
            err
        );
    }

    // Direct fallback
    try {
        const res2 =
            await fetch(fileUrl);

        if (!res2.ok) {
            throw new Error(
                `Direct fetch failed: ${res2.status}`
            );
        }

        const blob2 =
            await res2.blob();

        if (!blob2.size) {
            throw new Error(
                "Empty blob"
            );
        }

        downloadBlob(
            blob2,
            safeName
        );

        return {
            ok: true,
        };
    } catch (err) {
        console.error(
            "Download failed:",
            err
        );

        return {
            ok: false,
            error: err,
        };
    }
}