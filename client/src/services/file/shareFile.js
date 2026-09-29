const isAbort = (error) => error?.name === "AbortError";

export const shareStoredFile = async(file, title = "Shared file") => {
    if (!file) throw new Error("File not available.");

    if (file.fileData && typeof File !== "undefined") {
        const type = file.mimeType || file.fileData.type || "application/octet-stream";
        const shareFile = new File(
            [file.fileData],
            file.fileName || "file",
            { type }
        );

        if (typeof navigator.share === "function") {
            const canShareFile = typeof navigator.canShare !== "function" ||
                navigator.canShare({ files: [shareFile] });
            if (canShareFile) {
                try {
                    await navigator.share({ title, files: [shareFile] });
                    return "shared";
                } catch (error) {
                    if (isAbort(error)) throw error;
                    // Fall through to a durable Cloudinary link, when present.
                }
            }
        }
    }

    if (file.fileUrl) {
        if (typeof navigator.share === "function") {
            await navigator.share({
                title: file.fileName || title,
                url: file.fileUrl
            });
            return "shared";
        }

        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(file.fileUrl);
            return "copied";
        }
    }

    throw new Error("This file cannot be shared from this browser.");
};
