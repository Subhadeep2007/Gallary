import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FileImage,
    FileVideo,
    FileAudio,
    FileText,
    Search,
    Grid2X2,
    List,
    Download,
    Share2,
    ExternalLink,
    RotateCcw,
    Trash2,
    AlertTriangle,
    X,
    FolderX
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

import {
    getAllTrashFiles,
    restoreFile as restoreLocalFile,
    deleteFilePermanently,
    emptyLocalTrash
} from "../../services/storage/db.js";

import {
    getTrashFiles,
    restoreFile as restoreMongoFile,
    permanentlyDeleteFile,
    emptyTrash
} from "../../services/file/file.service.js";


// =========================================================
// USER ID
// =========================================================

const getUserId = (user) => {

    if (!user) {
        return null;
    }

    if (user.userId) {
        return user.userId;
    }

    if (user._id) {
        return user._id;
    }

    if (user.id) {
        return user.id;
    }

    return null;
};


// =========================================================
// FILE SIZE
// =========================================================

const formatFileSize = (size) => {

    if (!size || size <= 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    let value = size;
    let index = 0;

    while (
        value >= 1024 &&
        index < units.length - 1
    ) {

        value =
            value / 1024;

        index++;
    }

    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};


// =========================================================
// DATE
// =========================================================

const formatDeletedDate = (value) => {

    if (!value) {
        return "Recently";
    }

    try {

        return new Date(
            value
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return "Recently";
    }
};


// =========================================================
// OBJECT URL
// =========================================================

const createObjectUrl = (
    fileData
) => {

    if (!fileData) {
        return null;
    }

    try {

        if (
            fileData instanceof Blob
        ) {

            return URL.createObjectURL(
                fileData
            );
        }

        return null;

    } catch (error) {

        return null;
    }
};


// =========================================================
// FILE ICON
// =========================================================

const FileIcon = ({
    type,
    size = 24
}) => {

    if (type === "image") {

        return (
            <FileImage
                size={size}
            />
        );
    }

    if (type === "video") {

        return (
            <FileVideo
                size={size}
            />
        );
    }


    if (type === "audio") {

        return (
            <FileAudio
                size={size}
            />
        );
    }

    return (
        <FileText
            size={size}
        />
    );
};


// =========================================================
// TRASH PREVIEW
// =========================================================

const TrashPreview = ({
    file
}) => {

    const [url, setUrl] =
        useState(null);


    useEffect(() => {

        let previewUrl = null;


        if (
            file &&
            file.fileData
        ) {

            previewUrl =
                createObjectUrl(
                    file.fileData
                );

            setUrl(
                previewUrl
            );

        } else {

            setUrl(null);
        }


        return () => {

            if (previewUrl) {

                URL.revokeObjectURL(
                    previewUrl
                );
            }
        };

    }, [file]);


    if (
        file.fileType === "image" &&
        url
    ) {

        return (
            <img
                src={url}
                alt={
                    file.fileName ||
                    "Deleted file"
                }
                className="h-full w-full object-cover opacity-80"
            />
        );
    }


    if (
        file.fileType === "video" &&
        url
    ) {

        return (
            <video
                src={url}
                className="h-full w-full object-cover opacity-80"
                muted
                playsInline
            />
        );
    }


    if (
        file.fileType === "audio" &&
        url
    ) {

        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-950 px-5">

                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-300">

                    <FileAudio
                        size={40}
                        strokeWidth={1.5}
                    />

                </div>


                <div className="w-full max-w-xs">

                    <audio
                        src={url}
                        controls
                        className="w-full"
                    />

                </div>

            </div>
        );
    }


    if (
        file.fileType === "pdf"
    ) {

        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-900 text-red-400">

                <FileText
                    size={58}
                    strokeWidth={1.5}
                />

                <span className="text-xs font-medium text-slate-400">
                    PDF FILE
                </span>

            </div>
        );
    }


    return (
        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-600">

            <FileText
                size={50}
            />

        </div>
    );
};


// =========================================================
// TRASH CARD
// =========================================================

const TrashCard = ({
    file,
    onOpen,
    onDownload,
    onShare,
    onRestore,
    onPermanentDelete
}) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-red-500/10 bg-slate-900/70 shadow-xl">

            {/* PREVIEW */}

            {file.fileType === "audio" ? (

                <div className="block h-52 w-full bg-slate-950">

                    <TrashPreview
                        file={file}
                    />

                </div>

            ) : (

                <button
                    type="button"
                    onClick={() =>
                        onOpen(file)
                    }
                    className="block h-52 w-full bg-slate-950"
                >

                    <TrashPreview
                        file={file}
                    />

                </button>

            )}


            {/* DETAILS */}

            <div className="p-4">

                <div className="flex items-start gap-3">

                    <div className="mt-0.5 shrink-0 text-slate-500">

                        <FileIcon
                            type={
                                file.fileType
                            }
                            size={20}
                        />

                    </div>


                    <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-white">
                            {
                                file.fileName ||
                                "Untitled file"
                            }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {
                                formatFileSize(
                                    file.size
                                )
                            }
                        </p>

                    </div>

                </div>


                <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">

                    <Trash2
                        size={14}
                    />

                    Deleted:

                    <span className="text-slate-500">
                        {
                            formatDeletedDate(
                                file.deletedAt
                            )
                        }
                    </span>

                </div>


                {/* ACTIONS */}

                <div className="mt-4 grid grid-cols-5 gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            onOpen(file)
                        }
                        className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        title="Open"
                    >
                        <ExternalLink
                            size={17}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onDownload(file)
                        }
                        className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        title="Download"
                    >
                        <Download
                            size={17}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onShare(file)
                        }
                        className="flex items-center justify-center rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        title="Share"
                    >
                        <Share2
                            size={17}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onRestore(file)
                        }
                        className="flex items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2 text-emerald-400 hover:bg-emerald-400/10"
                        title="Restore"
                    >
                        <RotateCcw
                            size={17}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onPermanentDelete(
                                file
                            )
                        }
                        className="flex items-center justify-center rounded-lg border border-red-400/20 bg-red-400/5 p-2 text-red-400 hover:bg-red-400/10"
                        title="Delete permanently"
                    >
                        <Trash2
                            size={17}
                        />
                    </button>

                </div>

            </div>

        </div>
    );
};


// =========================================================
// TRASH
// =========================================================

const Trash = () => {

    const {
        user
    } = useAuth();


    const userId =
        getUserId(user);


    const [
        files,
        setFiles
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        viewMode,
        setViewMode
    ] = useState("grid");


    const [
        showEmptyModal,
        setShowEmptyModal
    ] = useState(false);


    const [
        deletingAll,
        setDeletingAll
    ] = useState(false);


    const [
        deletingFileId,
        setDeletingFileId
    ] = useState(null);


    // =====================================================
    // LOAD TRASH
    // =====================================================

    const loadTrash =
        async () => {

            if (!userId) {

                setFiles([]);
                setLoading(false);

                return;
            }


            try {

                setLoading(true);


                const localTrash =
                    await getAllTrashFiles(
                        userId
                    );


                if (
                    Array.isArray(
                        localTrash
                    )
                ) {

                    setFiles(
                        localTrash
                    );

                } else {

                    setFiles([]);
                }

            } catch (error) {

                console.error(
                    "Load trash error:",
                    error
                );

                setFiles([]);

                toast.error(
                    "Failed to load Recently Deleted."
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        loadTrash();

    }, [userId]);


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredFiles =
        useMemo(() => {

            if (
                !search.trim()
            ) {

                return files;
            }


            const value =
                search
                    .trim()
                    .toLowerCase();


            return files.filter(
                (file) =>
                    String(
                        file.fileName || ""
                    )
                        .toLowerCase()
                        .includes(
                            value
                        )
            );

        }, [
            files,
            search
        ]);


    // =====================================================
    // OPEN
    // =====================================================

    const handleOpen = (
        file
    ) => {

        if (
            !file ||
            !file.fileData
        ) {

            toast.error(
                "This file is not available locally."
            );

            return;
        }


        const url =
            createObjectUrl(
                file.fileData
            );


        if (!url) {

            toast.error(
                "Unable to open file."
            );

            return;
        }


        window.open(
            url,
            "_blank"
        );


        setTimeout(() => {

            URL.revokeObjectURL(
                url
            );

        }, 60000);
    };


    // =====================================================
    // DOWNLOAD
    // =====================================================

    const handleDownload = (
        file
    ) => {

        if (
            !file ||
            !file.fileData
        ) {

            toast.error(
                "This file is not available locally."
            );

            return;
        }


        const url =
            createObjectUrl(
                file.fileData
            );


        if (!url) {

            toast.error(
                "Unable to download file."
            );

            return;
        }


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            file.fileName ||
            "download";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        setTimeout(() => {

            URL.revokeObjectURL(
                url
            );

        }, 5000);
    };


    // =====================================================
    // SHARE
    // =====================================================

    const handleShare = async (
        file
    ) => {

        if (
            !file ||
            !file.fileData
        ) {

            toast.error(
                "This file is not available locally."
            );

            return;
        }


        if (
            !navigator.share
        ) {

            toast.error(
                "File sharing is not supported by this browser."
            );

            return;
        }


        try {

            const shareFile =
                new File(
                    [
                        file.fileData
                    ],
                    file.fileName ||
                    "file",
                    {
                        type:
                            file.mimeType ||
                            "application/octet-stream"
                    }
                );


            await navigator.share({

                title:
                    file.fileName ||
                    "Deleted file",

                files: [
                    shareFile
                ]

            });

        } catch (error) {

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                return;
            }


            console.error(
                "Share trash file error:",
                error
            );

            toast.error(
                "Unable to share file."
            );
        }
    };


    // =====================================================
    // RESTORE
    // =====================================================

    const handleRestore = async (
        file
    ) => {

        if (!file) {
            return;
        }


        try {

            if (
                file.mongoFileId
            ) {

                await restoreMongoFile(
                    file.mongoFileId
                );
            }


            await restoreLocalFile(
                file.localFileId
            );


            await loadTrash();


            toast.success(
                "File restored successfully."
            );

        } catch (error) {

            console.error(
                "Restore error:",
                error
            );

            toast.error(
                "Unable to restore file."
            );
        }
    };


    // =====================================================
    // PERMANENT DELETE
    // =====================================================

    const handlePermanentDelete =
        async (
            file
        ) => {

            if (!file) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Permanently delete "${file.fileName}"? This cannot be undone.`
                );


            if (!confirmed) {
                return;
            }


            try {

                setDeletingFileId(
                    file.localFileId
                );


                if (
                    file.mongoFileId
                ) {

                    await permanentlyDeleteFile(
                        file.mongoFileId
                    );
                }


                await deleteFilePermanently(
                    file.localFileId
                );


                await loadTrash();


                toast.success(
                    "File permanently deleted."
                );

            } catch (error) {

                console.error(
                    "Permanent delete error:",
                    error
                );

                toast.error(
                    "Unable to permanently delete file."
                );

            } finally {

                setDeletingFileId(
                    null
                );
            }
        };


    // =====================================================
    // EMPTY TRASH
    // =====================================================

    const handleEmptyTrash =
        async () => {

            try {

                setDeletingAll(true);


                await emptyTrash();


                await emptyLocalTrash(
                    userId
                );


                await loadTrash();


                setShowEmptyModal(
                    false
                );


                toast.success(
                    "Recently Deleted is now empty."
                );

            } catch (error) {

                console.error(
                    "Empty trash error:",
                    error
                );

                toast.error(
                    "Unable to empty trash."
                );

            } finally {

                setDeletingAll(false);
            }
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="flex min-h-[60vh] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading Recently Deleted...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // NO USER
    // =====================================================

    if (!userId) {

        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">

                    <p className="text-lg font-semibold text-white">
                        Session not available
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Please login again.
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-400">

                            <Trash2
                                size={23}
                            />

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold text-white">
                                Recently Deleted
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Restore files or permanently delete them.
                            </p>

                        </div>

                    </div>

                </div>


                {files.length > 0 && (

                    <button
                        type="button"
                        onClick={() =>
                            setShowEmptyModal(
                                true
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10"
                    >
                        <Trash2
                            size={17}
                        />
                        Empty Trash
                    </button>
                )}

            </div>


            {/* WARNING */}

            {files.length > 0 && (

                <div className="flex items-start gap-3 rounded-2xl border border-yellow-400/10 bg-yellow-400/5 p-4">

                    <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-yellow-400"
                    />

                    <p className="text-sm leading-6 text-slate-400">
                        Permanently deleted files cannot be restored.
                        Make sure you no longer need them before deleting.
                    </p>

                </div>
            )}


            {/* TOOLBAR */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="relative w-full sm:max-w-md">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search deleted files..."
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-10 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/20"
                    />

                </div>


                <div className="flex items-center justify-between gap-3">

                    <p className="text-sm text-slate-500">
                        {filteredFiles.length} file
                        {filteredFiles.length === 1
                            ? ""
                            : "s"}
                    </p>


                    <div className="flex items-center rounded-lg border border-white/10 bg-slate-900 p-1">

                        <button
                            type="button"
                            onClick={() =>
                                setViewMode(
                                    "grid"
                                )
                            }
                            className={`rounded-md p-2 ${
                                viewMode ===
                                "grid"
                                    ? "bg-white text-slate-950"
                                    : "text-slate-400"
                            }`}
                        >
                            <Grid2X2
                                size={17}
                            />
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setViewMode(
                                    "list"
                                )
                            }
                            className={`rounded-md p-2 ${
                                viewMode ===
                                "list"
                                    ? "bg-white text-slate-950"
                                    : "text-slate-400"
                            }`}
                        >
                            <List
                                size={17}
                            />
                        </button>

                    </div>

                </div>

            </div>


            {/* EMPTY */}

            {filteredFiles.length === 0 && (

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-6 py-20 text-center">

                    <FolderX
                        size={52}
                        className="mx-auto text-slate-700"
                    />

                    <h2 className="mt-5 text-lg font-semibold text-white">
                        Recently Deleted is empty
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Deleted files will appear here.
                    </p>

                </div>
            )}


            {/* GRID */}

            {filteredFiles.length > 0 &&
                viewMode === "grid" && (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                        {filteredFiles.map(
                            (file) => (

                                <TrashCard
                                    key={
                                        file.localFileId ||
                                        file.mongoFileId ||
                                        file.localId
                                    }
                                    file={file}
                                    onOpen={
                                        handleOpen
                                    }
                                    onDownload={
                                        handleDownload
                                    }
                                    onShare={
                                        handleShare
                                    }
                                    onRestore={
                                        handleRestore
                                    }
                                    onPermanentDelete={
                                        handlePermanentDelete
                                    }
                                />
                            )
                        )}

                    </div>
                )}


            {/* LIST */}

            {filteredFiles.length > 0 &&
                viewMode === "list" && (

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">

                        <div className="divide-y divide-white/5">

                            {filteredFiles.map(
                                (file) => (

                                    <div
                                        key={
                                            file.localFileId ||
                                            file.mongoFileId ||
                                            file.localId
                                        }
                                        className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center"
                                    >

                                        <div className="flex min-w-0 flex-1 items-center gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-slate-500">

                                                <FileIcon
                                                    type={
                                                        file.fileType
                                                    }
                                                    size={23}
                                                />

                                            </div>


                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-medium text-white">
                                                    {
                                                        file.fileName
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {
                                                        file.fileType
                                                    }
                                                    {" • "}
                                                    {
                                                        formatFileSize(
                                                            file.size
                                                        )
                                                    }
                                                    {" • Deleted "}
                                                    {
                                                        formatDeletedDate(
                                                            file.deletedAt
                                                        )
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <div className="flex items-center gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpen(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                title="Open"
                                            >
                                                <ExternalLink
                                                    size={17}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDownload(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                title="Download"
                                            >
                                                <Download
                                                    size={17}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleShare(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                title="Share"
                                            >
                                                <Share2
                                                    size={17}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRestore(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2 text-emerald-400 hover:bg-emerald-400/10"
                                                title="Restore"
                                            >
                                                <RotateCcw
                                                    size={17}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                disabled={
                                                    deletingFileId ===
                                                    file.localFileId
                                                }
                                                onClick={() =>
                                                    handlePermanentDelete(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg border border-red-400/20 bg-red-400/5 p-2 text-red-400 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                title="Delete permanently"
                                            >
                                                <Trash2
                                                    size={17}
                                                />
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>
                )}


            {/* EMPTY TRASH MODAL */}

            {showEmptyModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-2xl border border-red-400/10 bg-slate-900 p-6 shadow-2xl">

                        <div className="flex items-start justify-between">

                            <div className="flex items-start gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-400">

                                    <AlertTriangle
                                        size={22}
                                    />

                                </div>


                                <div>

                                    <h2 className="text-lg font-semibold text-white">
                                        Empty Recently Deleted?
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        All deleted files will be permanently
                                        removed from this device and their
                                        MongoDB metadata will also be deleted.
                                        This action cannot be undone.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowEmptyModal(
                                        false
                                    )
                                }
                                disabled={
                                    deletingAll
                                }
                                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                                <X
                                    size={18}
                                />
                            </button>

                        </div>


                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowEmptyModal(
                                        false
                                    )
                                }
                                disabled={
                                    deletingAll
                                }
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleEmptyTrash
                                }
                                disabled={
                                    deletingAll
                                }
                                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deletingAll
                                    ? "Deleting..."
                                    : "Delete Everything"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Trash;