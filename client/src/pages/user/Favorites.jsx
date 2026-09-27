import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FileImage,
    FileVideo,
    FileText,
    Search,
    Grid2X2,
    List,
    Download,
    Share2,
    ExternalLink,
    Star,
    FolderHeart,
    Trash2
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

import {
    getFavoriteFiles,
    updateFileByLocalId,
    moveFileToTrash
} from "../../services/storage/db.js";

import {
    toggleFavorite as toggleMongoFavorite,
    moveFileToTrash as moveMongoFileToTrash
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
// PREVIEW URL
// =========================================================

const createObjectUrl = (fileData) => {

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
    size = 22
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

    return (
        <FileText
            size={size}
        />
    );
};


// =========================================================
// PREVIEW
// =========================================================

const FavoritePreview = ({
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
                    "Favorite file"
                }
                className="h-full w-full object-cover"
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
                className="h-full w-full object-cover"
                muted
                playsInline
            />
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
        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">
            <FileText
                size={50}
            />
        </div>
    );
};


// =========================================================
// FAVORITE CARD
// =========================================================

const FavoriteCard = ({
    file,
    onOpen,
    onDownload,
    onShare,
    onFavorite,
    onTrash
}) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">

            {/* PREVIEW */}

            <button
                type="button"
                onClick={() =>
                    onOpen(file)
                }
                className="block h-52 w-full bg-slate-950"
            >
                <FavoritePreview
                    file={file}
                />
            </button>


            {/* DETAILS */}

            <div className="p-4">

                <div className="flex items-start gap-3">

                    <div className="mt-0.5 shrink-0 text-slate-400">
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


                    <Star
                        size={17}
                        className="shrink-0 fill-yellow-400 text-yellow-400"
                    />

                </div>


                {/* ACTIONS */}

                <div className="mt-4 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() =>
                            onFavorite(file)
                        }
                        className="rounded-lg p-2 text-yellow-400 hover:bg-yellow-400/10"
                        title="Remove from favorites"
                    >
                        <Star
                            size={18}
                            className="fill-yellow-400"
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onDownload(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        title="Download"
                    >
                        <Download
                            size={18}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onShare(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        title="Share"
                    >
                        <Share2
                            size={18}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onOpen(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        title="Open"
                    >
                        <ExternalLink
                            size={18}
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onTrash(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                        title="Move to trash"
                    >
                        <Trash2
                            size={18}
                        />
                    </button>

                </div>

            </div>

        </div>
    );
};


// =========================================================
// FAVORITES
// =========================================================

const Favorites = () => {

    const {
        user
    } = useAuth();


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


    const userId =
        getUserId(user);


    // =====================================================
    // LOAD FAVORITES
    // =====================================================

    const loadFavorites =
        async () => {

            if (!userId) {

                setFiles([]);
                setLoading(false);

                return;
            }


            try {

                setLoading(true);


                const favoriteFiles =
                    await getFavoriteFiles(
                        userId
                    );


                if (
                    Array.isArray(
                        favoriteFiles
                    )
                ) {

                    setFiles(
                        favoriteFiles
                    );

                } else {

                    setFiles([]);
                }

            } catch (error) {

                console.error(
                    "Load favorites error:",
                    error
                );

                setFiles([]);

                toast.error(
                    "Failed to load favorites."
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        loadFavorites();

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
                    "Favorite file",

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
                "Share error:",
                error
            );

            toast.error(
                "Unable to share file."
            );
        }
    };


    // =====================================================
    // REMOVE FAVORITE
    // =====================================================

    const handleFavorite = async (
        file
    ) => {

        if (
            !file ||
            !file.localFileId
        ) {

            return;
        }


        try {

            if (
                file.mongoFileId
            ) {

                await toggleMongoFavorite(
                    file.mongoFileId
                );
            }


            await updateFileByLocalId(
                file.localFileId,
                {
                    isFavorite:
                        false,

                    syncStatus:
                        file.mongoFileId
                            ? "synced"
                            : "pending",

                    updatedAt:
                        new Date()
                }
            );


            await loadFavorites();


            toast.success(
                "Removed from favorites."
            );

        } catch (error) {

            console.error(
                "Remove favorite error:",
                error
            );

            toast.error(
                "Unable to remove favorite."
            );
        }
    };


    // =====================================================
    // MOVE TO TRASH
    // =====================================================

    const handleTrash = async (
        file
    ) => {

        if (!file) {
            return;
        }


        try {

            if (
                file.mongoFileId
            ) {

                await moveMongoFileToTrash(
                    file.mongoFileId
                );
            }


            await moveFileToTrash(
                file.localFileId
            );


            await loadFavorites();


            toast.success(
                "File moved to Recently Deleted."
            );

        } catch (error) {

            console.error(
                "Favorite trash error:",
                error
            );

            toast.error(
                "Unable to move file to trash."
            );
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
                        Loading favorites...
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

            <div>

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">

                        <FolderHeart
                            size={23}
                        />

                    </div>


                    <div>

                        <h1 className="text-2xl font-bold text-white">
                            Favorites
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            Your favorite files in one place.
                        </p>

                    </div>

                </div>

            </div>


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
                        placeholder="Search favorites..."
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-10 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/20"
                    />

                </div>


                <div className="flex items-center justify-between gap-3">

                    <p className="text-sm text-slate-500">
                        {filteredFiles.length} favorite
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

                    <Star
                        size={48}
                        className="mx-auto text-slate-700"
                    />

                    <h2 className="mt-5 text-lg font-semibold text-white">
                        No favorite files
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Files you mark as favorite will appear here.
                    </p>

                </div>
            )}


            {/* GRID */}

            {filteredFiles.length > 0 &&
                viewMode === "grid" && (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                        {filteredFiles.map(
                            (file) => (

                                <FavoriteCard
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
                                    onFavorite={
                                        handleFavorite
                                    }
                                    onTrash={
                                        handleTrash
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
                                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                                    >

                                        <div className="flex min-w-0 flex-1 items-center gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-slate-400">
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
                                                    }{" "}
                                                    •{" "}
                                                    {
                                                        formatFileSize(
                                                            file.size
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
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                title="Open"
                                            >
                                                <ExternalLink
                                                    size={18}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDownload(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                title="Download"
                                            >
                                                <Download
                                                    size={18}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleShare(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                                title="Share"
                                            >
                                                <Share2
                                                    size={18}
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFavorite(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-yellow-400 hover:bg-yellow-400/10"
                                                title="Remove favorite"
                                            >
                                                <Star
                                                    size={18}
                                                    className="fill-yellow-400"
                                                />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleTrash(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                                title="Move to trash"
                                            >
                                                <Trash2
                                                    size={18}
                                                />
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>
                )}

        </div>
    );
};

export default Favorites;