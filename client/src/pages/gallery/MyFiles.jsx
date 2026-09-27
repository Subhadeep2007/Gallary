import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    FileImage,
    FileVideo,
    FileAudio,
    FileText,
    Upload,
    Search,
    Grid2X2,
    List,
    MoreVertical,
    Download,
    Copy,
    Share2,
    Pencil,
    Trash2,
    Star,
    StarOff,
    ExternalLink,
    X,
    FolderOpen
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

import {
    addFile,
    getAllFiles,
    updateFileByLocalId,
    moveFileToTrash
} from "../../services/storage/db.js";

import {
    createFile,
    renameFile as renameMongoFile,
    toggleFavorite as toggleMongoFavorite,
    moveFileToTrash as moveMongoFileToTrash
} from "../../services/file/file.service.js";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_FILE_SIZE =
    1024 *
    1024 *
    1024;

const IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml"
];

const VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime"
];

const AUDIO_TYPES = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
    "audio/flac",
    "audio/mp4"
];

const PDF_TYPES = [
    "application/pdf"
];


// =========================================================
// HELPERS
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


const getFileType = (mimeType) => {

    if (!mimeType) {
        return null;
    }

    if (IMAGE_TYPES.includes(mimeType)) {
        return "image";
    }

    if (VIDEO_TYPES.includes(mimeType)) {
        return "video";
    }

    if (AUDIO_TYPES.includes(mimeType)) {
        return "audio";
    }

    if (PDF_TYPES.includes(mimeType)) {
        return "pdf";
    }

    return null;
};


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


const getCopyFileName = (fileName, files) => {

    const originalName =
        fileName ||
        "Untitled file";


    const lastDot =
        originalName.lastIndexOf(".");


    let baseName =
        originalName;

    let extension =
        "";


    if (
        lastDot > 0 &&
        lastDot < originalName.length - 1
    ) {

        baseName =
            originalName.slice(
                0,
                lastDot
            );

        extension =
            originalName.slice(
                lastDot
            );

    }


    let copyName =
        `${baseName} - Copy${extension}`;


    let copyNumber = 2;


    while (
        files.some((item) => {

            return (
                item.fileName ===
                copyName &&
                item.isDeleted !== true
            );

        })
    ) {

        copyName =
            `${baseName} - Copy (${copyNumber})${extension}`;

        copyNumber++;

    }


    return copyName;

};


const getPreviewUrl = (fileData) => {

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

const FileTypeIcon = ({
    fileType,
    size = 42
}) => {

    if (fileType === "image") {

        return (
            <FileImage
                size={size}
                strokeWidth={1.7}
            />
        );
    }

    if (fileType === "video") {

        return (
            <FileVideo
                size={size}
                strokeWidth={1.7}
            />
        );
    }

    if (fileType === "audio") {

        return (
            <FileAudio
                size={size}
                strokeWidth={1.7}
            />
        );
    }

    return (
        <FileText
            size={size}
            strokeWidth={1.7}
        />
    );
};


// =========================================================
// FILE PREVIEW
// =========================================================

const FilePreview = ({
    file
}) => {

    const [previewUrl, setPreviewUrl] =
        useState(null);

    useEffect(() => {

        let url = null;

        if (file && file.fileData) {

            url =
                getPreviewUrl(
                    file.fileData
                );

            setPreviewUrl(url);

        } else {

            setPreviewUrl(null);
        }

        return () => {

            if (url) {

                URL.revokeObjectURL(
                    url
                );
            }
        };

    }, [file]);


    if (!file) {

        return (
            <div className="flex h-full w-full items-center justify-center text-slate-500">
                <FileText size={42} />
            </div>
        );
    }


    if (
        file.fileType === "image" &&
        previewUrl
    ) {

        return (
            <img
                src={previewUrl}
                alt={file.fileName}
                className="h-full w-full object-cover"
            />
        );
    }


    if (
        file.fileType === "video" &&
        previewUrl
    ) {

        return (
            <video
                src={previewUrl}
                className="h-full w-full object-cover"
                muted
                playsInline
            />
        );
    }


    if (
        file.fileType === "audio" &&
        previewUrl
    ) {

        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-950 px-5">

                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-300">

                    <FileAudio
                        size={40}
                        strokeWidth={1.5}
                    />

                </div>

                <audio
                    src={previewUrl}
                    controls
                    className="w-full max-w-xs"
                />

            </div>
        );
    }


    if (file.fileType === "pdf") {

        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-900 text-red-400">
                <FileText
                    size={56}
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
            <FileText size={48} />
        </div>
    );
};


// =========================================================
// FILE CARD
// =========================================================

const FileCard = ({
    file,
    onOpen,
    onDownload,
    onShare,
    onRename,
    onCopy,
    onFavorite,
    onTrash
}) => {

    const [menuOpen, setMenuOpen] =
        useState(false);


    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">

            {/* PREVIEW */}

            {file.fileType === "audio" ? (

                <div className="block h-52 w-full bg-slate-950">
                    <FilePreview file={file} />
                </div>

            ) : (

                <button
                    type="button"
                    onClick={() => onOpen(file)}
                    className="block h-52 w-full bg-slate-950"
                >
                    <FilePreview file={file} />
                </button>

            )}


            {/* MENU */}

            <div className="absolute right-3 top-3">

                <button
                    type="button"
                    onClick={() =>
                        setMenuOpen(
                            !menuOpen
                        )
                    }
                    className="rounded-lg bg-black/60 p-2 text-white backdrop-blur hover:bg-black/80"
                >
                    <MoreVertical size={18} />
                </button>


                {menuOpen && (

                    <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">

                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onOpen(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                            <ExternalLink size={16} />
                            Open
                        </button>


                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onDownload(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                            <Download size={16} />
                            Download
                        </button>


                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onShare(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                            <Share2 size={16} />
                            Share
                        </button>


                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onRename(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                            <Pencil size={16} />
                            Rename
                        </button>


                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onCopy(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                            <Copy size={16} />
                            Create Copy
                        </button>


                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onFavorite(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5"
                        >
                            {file.isFavorite ? (
                                <StarOff size={16} />
                            ) : (
                                <Star size={16} />
                            )}

                            {file.isFavorite
                                ? "Remove Favorite"
                                : "Favorite"}
                        </button>


                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                onTrash(file);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 size={16} />
                            Move to Trash
                        </button>

                    </div>
                )}

            </div>


            {/* DETAILS */}

            <div className="p-4">

                <div className="flex items-start gap-3">

                    <div className="mt-0.5 shrink-0 text-slate-400">
                        <FileTypeIcon
                            fileType={file.fileType}
                            size={20}
                        />
                    </div>


                    <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-white">
                            {file.fileName || "Untitled file"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {formatFileSize(file.size)}
                        </p>

                    </div>


                    {file.isFavorite && (

                        <Star
                            size={16}
                            className="shrink-0 fill-yellow-400 text-yellow-400"
                        />
                    )}

                </div>


                {/* ACTIONS */}

                <div className="mt-4 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() =>
                            onFavorite(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-yellow-400"
                    >
                        <Star
                            size={18}
                            className={
                                file.isFavorite
                                    ? "fill-yellow-400 text-yellow-400"
                                    : ""
                            }
                        />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onDownload(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <Download size={18} />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onShare(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                        <Share2 size={18} />
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onTrash(file)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                        <Trash2 size={18} />
                    </button>

                </div>

            </div>

        </div>
    );
};


// =========================================================
// MY FILES
// =========================================================

const MyFiles = () => {

    const {
        user
    } = useAuth();


    const fileInputRef =
        useRef(null);


    const [files, setFiles] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState("all");

    const [viewMode, setViewMode] =
        useState("grid");

    const [renameFileId, setRenameFileId] =
        useState(null);

    const [renameValue, setRenameValue] =
        useState("");

    const [dragActive, setDragActive] =
        useState(false);


    const userId =
        getUserId(user);


    // =====================================================
    // LOAD FILES
    // =====================================================

    const loadFiles = async () => {

        if (!userId) {

            setFiles([]);
            setLoading(false);

            return;
        }


        try {

            setLoading(true);

            const localFiles =
                await getAllFiles(
                    userId
                );

            if (
                Array.isArray(localFiles)
            ) {

                setFiles(
                    localFiles
                );

            } else {

                setFiles([]);
            }

        } catch (error) {

            console.error(
                "Load files error:",
                error
            );

            setFiles([]);

            toast.error(
                "Failed to load your files."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadFiles();

    }, [userId]);


    // =====================================================
    // FILTERED FILES
    // =====================================================

    const filteredFiles =
        useMemo(() => {

            let result =
                Array.isArray(files)
                    ? files
                    : [];


            if (search.trim()) {

                const searchValue =
                    search
                        .trim()
                        .toLowerCase();

                result =
                    result.filter(
                        (file) =>
                            String(
                                file.fileName || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )
                    );
            }


            if (filter !== "all") {

                result =
                    result.filter(
                        (file) =>
                            file.fileType ===
                            filter
                    );
            }


            return result;

        }, [
            files,
            search,
            filter
        ]);


    // =====================================================
    // OPEN PICKER
    // =====================================================

    const openPicker = () => {

        if (
            fileInputRef.current
        ) {

            fileInputRef.current.click();
        }
    };


    // =====================================================
    // VALIDATE FILE
    // =====================================================

    const validateFile = (
        file
    ) => {

        if (!file) {

            return {
                valid: false,
                message: "No file selected."
            };
        }


        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            return {
                valid: false,
                message:
                    "File size cannot be more than 1GB."
            };
        }


        const fileType =
            getFileType(
                file.type
            );


        if (!fileType) {

            return {
                valid: false,
                message:
                    "Only image, video, audio and PDF files are allowed."
            };
        }


        return {
            valid: true,
            fileType
        };
    };


    // =====================================================
    // UPLOAD SINGLE FILE
    // =====================================================

    const uploadSingleFile = async (
        file
    ) => {

        const validation =
            validateFile(
                file
            );


        if (!validation.valid) {

            toast.error(
                validation.message
            );

            return false;
        }


        const duplicate =
            files.find(
                (item) =>
                    item.fileName ===
                        file.name &&
                    item.size ===
                        file.size &&
                    !item.isDeleted
            );


        if (duplicate) {

            toast.error(
                "A file with the same name and size already exists."
            );

            return false;
        }


        let localFileId =
            crypto.randomUUID();


        try {

            const localRecord =
                await addFile({

                    localFileId,

                    userId,

                    fileName:
                        file.name,

                    fileType:
                        validation.fileType,

                    mimeType:
                        file.type,

                    size:
                        file.size,

                    fileData:
                        file,

                    categoryId:
                        null,

                    isFavorite:
                        false,

                    isDeleted:
                        false,

                    deletedAt:
                        null,

                    syncStatus:
                        "pending",

                    parentFileId:
                        null,

                    isCopy:
                        false,

                    isEdited:
                        false,

                    createdAt:
                        new Date(),

                    updatedAt:
                        new Date()
                });


            if (!localRecord) {

                throw new Error(
                    "Could not save file locally."
                );
            }


            try {

                const response =
                    await createFile({

                        localFileId,

                        fileName:
                            file.name,

                        fileType:
                            validation.fileType,

                        mimeType:
                            file.type,

                        size:
                            file.size,

                        categoryId:
                            null,

                        parentFileId:
                            null,

                        isCopy:
                            false,

                        isEdited:
                            false
                    });


                const mongoFile =
                    response &&
                    response.data;


                if (
                    mongoFile &&
                    mongoFile._id
                ) {

                    await updateFileByLocalId(
                        localFileId,
                        {
                            mongoFileId:
                                mongoFile._id,

                            syncStatus:
                                "synced",

                            updatedAt:
                                new Date()
                        }
                    );

                } else {

                    await updateFileByLocalId(
                        localFileId,
                        {
                            syncStatus:
                                "pending",

                            updatedAt:
                                new Date()
                        }
                    );
                }


                toast.success(
                    "File uploaded successfully."
                );

            } catch (apiError) {

                console.error(
                    "Metadata sync error:",
                    apiError
                );

                await updateFileByLocalId(
                    localFileId,
                    {
                        syncStatus:
                            "pending",

                        updatedAt:
                            new Date()
                    }
                );

                toast.success(
                    "File saved locally. It will sync when connection is available."
                );
            }


            return true;

        } catch (error) {

            console.error(
                "File upload error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to save file."
            );

            return false;
        }
    };


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleFileChange =
        async (event) => {

            const selectedFiles =
                event.target.files;


            if (
                !selectedFiles ||
                selectedFiles.length === 0
            ) {

                return;
            }


            try {

                setUploading(true);


                for (
                    let i = 0;
                    i < selectedFiles.length;
                    i++
                ) {

                    await uploadSingleFile(
                        selectedFiles[i]
                    );
                }


                await loadFiles();

            } finally {

                setUploading(false);

                event.target.value =
                    "";
            }
        };


    // =====================================================
    // DRAG START
    // =====================================================

    const handleDragEnter = (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };


    const handleDragLeave = (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);
    };


    const handleDragOver = (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(true);
    };


    const handleDrop = async (
        event
    ) => {

        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);


        const droppedFiles =
            event.dataTransfer.files;


        if (
            !droppedFiles ||
            droppedFiles.length === 0
        ) {

            return;
        }


        try {

            setUploading(true);


            for (
                let i = 0;
                i < droppedFiles.length;
                i++
            ) {

                await uploadSingleFile(
                    droppedFiles[i]
                );
            }


            await loadFiles();

        } finally {

            setUploading(false);
        }
    };


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
            getPreviewUrl(
                file.fileData
            );


        if (!url) {

            toast.error(
                "Unable to open this file."
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
            getPreviewUrl(
                file.fileData
            );


        if (!url) {

            toast.error(
                "Unable to download this file."
            );

            return;
        }


        const link =
            document.createElement(
                "a"
            );

        link.href = url;

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


        try {

            const shareFile =
                new File(
                    [
                        file.fileData
                    ],
                    file.fileName,
                    {
                        type:
                            file.mimeType
                    }
                );


            if (
                navigator.share
            ) {

                await navigator.share({

                    title:
                        file.fileName,

                    files:
                        [
                            shareFile
                        ]
                });

                return;
            }


            toast.error(
                "File sharing is not supported by this browser."
            );

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
                "Unable to share this file."
            );
        }
    };


    // =====================================================
    // FAVORITE
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
                !file.mongoFileId
            ) {

                const nextValue =
                    !file.isFavorite;

                await updateFileByLocalId(
                    file.localFileId,
                    {
                        isFavorite:
                            nextValue,

                        syncStatus:
                            "pending",

                        updatedAt:
                            new Date()
                    }
                );

                await loadFiles();

                toast.success(
                    nextValue
                        ? "Added to favorites."
                        : "Removed from favorites."
                );

                return;
            }


            const response =
                await toggleMongoFavorite(
                    file.mongoFileId
                );


            const responseData =
                response &&
                response.data;


            let nextFavorite =
                !file.isFavorite;


            if (
                responseData &&
                typeof responseData.isFavorite ===
                    "boolean"
            ) {

                nextFavorite =
                    responseData.isFavorite;
            }


            await updateFileByLocalId(
                file.localFileId,
                {
                    isFavorite:
                        nextFavorite,

                    syncStatus:
                        "synced",

                    updatedAt:
                        new Date()
                }
            );


            await loadFiles();

            toast.success(
                nextFavorite
                    ? "Added to favorites."
                    : "Removed from favorites."
            );

        } catch (error) {

            console.error(
                "Favorite error:",
                error
            );

            toast.error(
                "Unable to update favorite."
            );
        }
    };


    // =====================================================
    // RENAME
    // =====================================================

    const openRename = (
        file
    ) => {

        setRenameFileId(
            file.localFileId
        );

        setRenameValue(
            file.fileName ||
            ""
        );
    };


    const closeRename = () => {

        setRenameFileId(
            null
        );

        setRenameValue(
            ""
        );
    };


    const saveRename = async () => {

        const newName =
            renameValue.trim();


        if (!newName) {

            toast.error(
                "File name cannot be empty."
            );

            return;
        }


        const file =
            files.find(
                (item) =>
                    item.localFileId ===
                    renameFileId
            );


        if (!file) {

            closeRename();

            return;
        }


        try {

            if (
                file.mongoFileId
            ) {

                await renameMongoFile(
                    file.mongoFileId,
                    newName
                );
            }


            await updateFileByLocalId(
                file.localFileId,
                {
                    fileName:
                        newName,

                    syncStatus:
                        file.mongoFileId
                            ? "synced"
                            : "pending",

                    updatedAt:
                        new Date()
                }
            );


            await loadFiles();

            closeRename();

            toast.success(
                "File renamed successfully."
            );

        } catch (error) {

            console.error(
                "Rename error:",
                error
            );

            toast.error(
                "Unable to rename file."
            );
        }
    };


    // =====================================================
    // CREATE COPY
    // =====================================================

    const handleCopy = async (
        file
    ) => {

        if (
            !file ||
            !file.localFileId
        ) {

            return;

        }


        if (!file.fileData) {

            toast.error(
                "This file is not available locally."
            );

            return;

        }


        try {

            const copyName =
                getCopyFileName(
                    file.fileName,
                    files
                );


            const newLocalFileId =
                crypto.randomUUID();


            const copiedFileData =
                new Blob(
                    [file.fileData],
                    {
                        type:
                            file.mimeType ||
                            file.fileData.type ||
                            "application/octet-stream"
                    }
                );


            const localCopy =
                await addFile({

                    localFileId:
                        newLocalFileId,

                    userId,

                    fileName:
                        copyName,

                    fileType:
                        file.fileType,

                    mimeType:
                        file.mimeType ||
                        copiedFileData.type,

                    size:
                        copiedFileData.size,

                    fileData:
                        copiedFileData,

                    categoryId:
                        file.categoryId ||
                        null,

                    isFavorite:
                        false,

                    isDeleted:
                        false,

                    deletedAt:
                        null,

                    syncStatus:
                        "pending",

                    parentFileId:
                        file.mongoFileId ||
                        null,

                    parentLocalFileId:
                        file.localFileId,

                    isCopy:
                        true,

                    isEdited:
                        false,

                    createdAt:
                        new Date(),

                    updatedAt:
                        new Date()

                });


            if (!localCopy) {

                throw new Error(
                    "Could not create local copy."
                );

            }


            if (file.mongoFileId) {

                try {

                    const response =
                        await createFile({

                            localFileId:
                                newLocalFileId,

                            fileName:
                                copyName,

                            fileType:
                                file.fileType,

                            mimeType:
                                file.mimeType ||
                                copiedFileData.type,

                            size:
                                copiedFileData.size,

                            categoryId:
                                file.categoryId ||
                                null,

                            parentFileId:
                                file.mongoFileId,

                            isCopy:
                                true,

                            isEdited:
                                false

                        });


                    const mongoCopy =
                        response &&
                        response.data;


                    if (
                        mongoCopy &&
                        mongoCopy._id
                    ) {

                        await updateFileByLocalId(
                            newLocalFileId,
                            {
                                mongoFileId:
                                    mongoCopy._id,

                                syncStatus:
                                    "synced",

                                updatedAt:
                                    new Date()
                            }
                        );

                    }

                } catch (apiError) {

                    console.error(
                        "Copy metadata sync error:",
                        apiError
                    );

                }

            }


            await loadFiles();


            toast.success(
                "File copy created successfully."
            );


        } catch (error) {

            console.error(
                "Copy error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to create file copy."
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


            await loadFiles();

            toast.success(
                "File moved to Recently Deleted."
            );

        } catch (error) {

            console.error(
                "Trash error:",
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
            <div className="flex min-h-[60vh] items-center justify-center px-4">

                <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading your files...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // USER ID MISSING
    // =====================================================

    if (!userId) {

        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">

                <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">

                    <p className="text-lg font-semibold text-white">
                        Session not available
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        Please login again to access your gallery.
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

                    <h1 className="text-2xl font-bold text-white">
                        My Files
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage your images, videos, audio files and PDFs.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={openPicker}
                    disabled={uploading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >

                    <Upload size={18} />

                    {uploading
                        ? "Uploading..."
                        : "Upload Files"}

                </button>

            </div>


            {/* HIDDEN INPUT */}

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={`${IMAGE_TYPES.join(",")},${VIDEO_TYPES.join(",")},${AUDIO_TYPES.join(",")},${PDF_TYPES.join(",")}`}
                onChange={handleFileChange}
                className="hidden"
            />


            {/* DROP ZONE */}

            <div
                onDragEnter={
                    handleDragEnter
                }
                onDragOver={
                    handleDragOver
                }
                onDragLeave={
                    handleDragLeave
                }
                onDrop={
                    handleDrop
                }
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    dragActive
                        ? "border-white bg-white/5"
                        : "border-white/10 bg-slate-950/40"
                }`}
            >

                <FolderOpen
                    size={34}
                    className="mx-auto text-slate-500"
                />

                <p className="mt-3 text-sm font-medium text-slate-300">
                    Drag and drop files here
                </p>

                <p className="mt-1 text-xs text-slate-500">
                    Images, videos, audio and PDFs • Maximum 1GB per file
                </p>

            </div>


            {/* TOOLBAR */}

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                {/* SEARCH */}

                <div className="relative w-full xl:max-w-md">

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
                        placeholder="Search files..."
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-10 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/20"
                    />

                </div>


                <div className="flex flex-wrap items-center gap-2">

                    {/* FILTER */}

                    {[
                        ["all", "All"],
                        ["image", "Images"],
                        ["video", "Videos"],
                        ["audio", "Audio"],
                        ["pdf", "PDFs"]
                    ].map(
                        (item) => (

                            <button
                                key={item[0]}
                                type="button"
                                onClick={() =>
                                    setFilter(
                                        item[0]
                                    )
                                }
                                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                                    filter ===
                                    item[0]
                                        ? "bg-white text-slate-950"
                                        : "border border-white/10 bg-slate-900 text-slate-400 hover:text-white"
                                }`}
                            >
                                {item[1]}
                            </button>
                        )
                    )}


                    {/* VIEW */}

                    <div className="ml-0 flex items-center rounded-lg border border-white/10 bg-slate-900 p-1">

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
                            <Grid2X2 size={17} />
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
                            <List size={17} />
                        </button>

                    </div>

                </div>

            </div>


            {/* FILE COUNT */}

            <div className="text-sm text-slate-500">
                {filteredFiles.length} file
                {filteredFiles.length === 1
                    ? ""
                    : "s"}
            </div>


            {/* EMPTY */}

            {filteredFiles.length === 0 && (

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-6 py-20 text-center">

                    <FolderOpen
                        size={48}
                        className="mx-auto text-slate-700"
                    />

                    <h2 className="mt-5 text-lg font-semibold text-white">
                        No files found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Upload your first image, video, audio file or PDF.
                    </p>

                    <button
                        type="button"
                        onClick={openPicker}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                    >
                        <Upload size={17} />
                        Upload File
                    </button>

                </div>
            )}


            {/* GRID */}

            {filteredFiles.length > 0 &&
                viewMode === "grid" && (

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                        {filteredFiles.map(
                            (file) => (

                                <FileCard
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
                                    onRename={
                                        openRename
                                    }
                                    onCopy={
                                        handleCopy
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
                                                <FileTypeIcon
                                                    fileType={
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
                                            >
                                                <ExternalLink size={18} />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDownload(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                            >
                                                <Download size={18} />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleShare(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                            >
                                                <Share2 size={18} />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openRename(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                            >
                                                <Pencil size={18} />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                                            >
                                                <Copy size={18} />
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFavorite(
                                                        file
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-yellow-400"
                                            >
                                                <Star
                                                    size={18}
                                                    className={
                                                        file.isFavorite
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : ""
                                                    }
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
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>
                )}


            {/* RENAME MODAL */}

            {renameFileId && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

                        <div className="flex items-center justify-between">

                            <h2 className="text-lg font-semibold text-white">
                                Rename File
                            </h2>

                            <button
                                type="button"
                                onClick={
                                    closeRename
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <input
                            type="text"
                            value={
                                renameValue
                            }
                            onChange={(
                                event
                            ) =>
                                setRenameValue(
                                    event
                                        .target
                                        .value
                                )
                            }
                            autoFocus
                            className="mt-5 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                            onKeyDown={(
                                event
                            ) => {

                                if (
                                    event.key ===
                                    "Enter"
                                ) {

                                    saveRename();
                                }

                                if (
                                    event.key ===
                                    "Escape"
                                ) {

                                    closeRename();
                                }
                            }}
                        />


                        <div className="mt-5 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={
                                    closeRename
                                }
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={
                                    saveRename
                                }
                                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                            >
                                Save
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default MyFiles;