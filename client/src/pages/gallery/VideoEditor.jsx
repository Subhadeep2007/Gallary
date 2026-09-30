import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Video,
    Upload,
    Scissors,
    Crop,
    RotateCw,
    Volume2,
    Gauge,
    Save,
    RotateCcw,
    Play,
    Pause,
    LoaderCircle,
    CheckCircle2,
    Film,
    Clock3,
    Trash2,
    X
} from "lucide-react";

import toast from "react-hot-toast";

import {
    FFmpeg
} from "@ffmpeg/ffmpeg";

import {
    fetchFile,
    toBlobURL
} from "@ffmpeg/util";

import useAuth from "../../hooks/useAuth.js";

import {
    addFile,
    getAllFiles,
    getFileByLocalId,
    updateFileByLocalId
} from "../../services/storage/db.js";

import {
    createFile,
    getFiles
} from "../../services/file/file.service.js";

import { syncPendingFiles } from "../../services/file/syncPendingFiles.js";


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


const createLocalFileId = () => {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString() +
        "-" +
        Math.random().toString(36).slice(2)
    );
};


const getPreviewUrl = (
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


const normalizeFilesResponse = (
    response
) => {

    if (
        Array.isArray(
            response
        )
    ) {

        return response;
    }


    if (
        response &&
        Array.isArray(
            response.files
        )
    ) {

        return response.files;
    }


    if (
        response &&
        Array.isArray(
            response.data
        )
    ) {

        return response.data;
    }


    if (
        response &&
        response.data &&
        Array.isArray(
            response.data.files
        )
    ) {

        return response.data.files;
    }


    return [];
};


const getEditableFileData = async(
    file
) => {

    if (
        file &&
        file.fileData instanceof Blob
    ) {

        return file.fileData;
    }


    if (
        file &&
        file.fileUrl
    ) {

        const response =
            await fetch(
                file.fileUrl
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Unable to download cloud video."
            );
        }


        const blob =
            await response.blob();


        return new File(
            [
                blob
            ],
            file.fileName ||
                "video",
            {
                type:
                    file.mimeType ||
                    blob.type ||
                    "video/mp4"
            }
        );
    }


    return null;
};


const getVideoInputExtension = (
    file
) => {

    const name =
        String(
            file &&
            (
                file.name ||
                file.fileName ||
                ""
            )
        ).toLowerCase();


    const mimeType =
        String(
            file &&
            file.type ||
            ""
        ).toLowerCase();


    if (
        mimeType.includes("quicktime") ||
        name.endsWith(".mov")
    ) {

        return "mov";
    }


    if (
        mimeType.includes("matroska") ||
        mimeType.includes("x-matroska") ||
        name.endsWith(".mkv")
    ) {

        return "mkv";
    }


    if (
        mimeType.includes("webm") ||
        name.endsWith(".webm")
    ) {

        return "webm";
    }


    if (
        mimeType.includes("3gpp") ||
        name.endsWith(".3gp")
    ) {

        return "3gp";
    }


    if (
        mimeType.includes("avi") ||
        name.endsWith(".avi")
    ) {

        return "avi";
    }


    return "mp4";
};


const getBaseName = (
    fileName
) => {

    const value =
        String(
            fileName || "video"
        );

    const dot =
        value.lastIndexOf(".");

    if (
        dot <= 0
    ) {
        return value;
    }

    return value.slice(
        0,
        dot
    );
};


const formatTime = (
    seconds
) => {

    const safe =
        Number.isFinite(seconds)
            ? Math.max(
                0,
                seconds
            )
            : 0;

    const hours =
        Math.floor(
            safe / 3600
        );

    const minutes =
        Math.floor(
            (safe % 3600) / 60
        );

    const secondsValue =
        Math.floor(
            safe % 60
        );

    if (
        hours > 0
    ) {
        return (
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(secondsValue).padStart(2, "0")
        );
    }

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secondsValue).padStart(2, "0")
    );
};


const clamp = (
    value,
    min,
    max
) => {

    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );
};


// =========================================================
// VIDEO EDITOR
// =========================================================

const VideoEditor = () => {

    const {
        user
    } = useAuth();


    const userId =
        getUserId(user);


    const fileInputRef =
        useRef(null);


    const videoRef =
        useRef(null);


    const previewUrlRef =
        useRef(null);


    const editedPreviewUrlRef =
        useRef(null);


    const ffmpegRef =
        useRef(
            new FFmpeg()
        );


    const ffmpegLoadedRef =
        useRef(false);


    const ffmpegEventsAttachedRef =
        useRef(false);


    const [
        videoFiles,
        setVideoFiles
    ] = useState([]);


    const [
        selectedFile,
        setSelectedFile
    ] = useState(null);


    const [
        selectedIndex,
        setSelectedIndex
    ] = useState(0);


    const [
        loadingFiles,
        setLoadingFiles
    ] = useState(true);


    const [
        loadingFFmpeg,
        setLoadingFFmpeg
    ] = useState(false);


    const [
        ffmpegProgress,
        setFFmpegProgress
    ] = useState(0);


    const [
        processing,
        setProcessing
    ] = useState(false);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        duration,
        setDuration
    ] = useState(0);


    const [
        currentTime,
        setCurrentTime
    ] = useState(0);


    const [
        trimStart,
        setTrimStart
    ] = useState(0);


    const [
        trimEnd,
        setTrimEnd
    ] = useState(0);


    const [
        cutEnabled,
        setCutEnabled
    ] = useState(false);


    const [
        cutStart,
        setCutStart
    ] = useState(0);


    const [
        cutEnd,
        setCutEnd
    ] = useState(0);


    const [
        cropPercent,
        setCropPercent
    ] = useState(100);


    const [
        rotation,
        setRotation
    ] = useState(0);


    const [
        speed,
        setSpeed
    ] = useState(1);


    const [
        volume,
        setVolume
    ] = useState(100);


    const [
        editedFile,
        setEditedFile
    ] = useState(null);


    const [
        previewPlaying,
        setPreviewPlaying
    ] = useState(false);


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
    // LOAD VIDEO FILES
    // =====================================================

    const loadVideoFiles = async() => {

        if (!userId) {

            setVideoFiles([]);

            setSelectedFile(null);

            setLoadingFiles(false);

            return;
        }


        try {

            setLoadingFiles(true);


            const localFiles =
                await getAllFiles(
                    userId
                );


            const localVideos =
                Array.isArray(
                    localFiles
                )
                    ? localFiles.filter(
                        (file) => {

                            return (
                                file.fileType ===
                                    "video" &&
                                file.isDeleted !== true
                            );

                        }
                    )
                    : [];


            let cloudVideos = [];


            try {

                const cloudResponse =
                    await getFiles({
                        fileType:
                            "video"
                    });


                const cloudFiles =
                    normalizeFilesResponse(
                        cloudResponse
                    );


                cloudVideos =
                    Array.isArray(
                        cloudFiles
                    )
                        ? cloudFiles.filter(
                            (file) => {

                                return (
                                    (
                                        file.fileType ===
                                            "video" ||
                                        file.type ===
                                            "video"
                                    ) &&
                                    file.isDeleted !== true
                                );

                            }
                        )
                        : [];

            } catch (cloudError) {

                console.error(
                    "Load cloud videos error:",
                    cloudError
                );
            }


            const mergedVideos =
                [...localVideos];


            cloudVideos.forEach(
                (cloudFile) => {

                    const cloudId =
                        cloudFile._id ||
                        cloudFile.id ||
                        cloudFile.mongoFileId ||
                        null;


                    const existingIndex =
                        mergedVideos.findIndex(
                            (localFile) => {

                                return (
                                    (
                                        cloudId &&
                                        (
                                            localFile.mongoFileId ===
                                                cloudId ||
                                            localFile._id ===
                                                cloudId
                                        )
                                    ) ||
                                    (
                                        cloudFile.localFileId &&
                                        localFile.localFileId ===
                                            cloudFile.localFileId
                                    )
                                );

                            }
                        );


                    const normalizedCloudFile = {

                        ...cloudFile,

                        mongoFileId:
                            cloudFile.mongoFileId ||
                            cloudFile._id ||
                            cloudFile.id ||
                            null,

                        categoryId:
                            cloudFile.categoryId ||
                            cloudFile.category?._id ||
                            cloudFile.category ||
                            null,

                        fileName:
                            cloudFile.fileName ||
                            cloudFile.name,

                        fileType:
                            cloudFile.fileType ||
                            cloudFile.type ||
                            "video",

                        mimeType:
                            cloudFile.mimeType ||
                            "video/mp4",

                        fileUrl:
                            cloudFile.fileUrl ||
                            null,

                        fileData:
                            cloudFile.fileData ||
                            null

                    };


                    if (
                        existingIndex >= 0
                    ) {

                        const localFile =
                            mergedVideos[
                                existingIndex
                            ];


                        mergedVideos[
                            existingIndex
                        ] = {

                            ...localFile,

                            ...normalizedCloudFile,

                            fileData:
                                localFile.fileData ||
                                normalizedCloudFile.fileData ||
                                null

                        };

                    } else {

                        mergedVideos.push(
                            normalizedCloudFile
                        );
                    }

                }
            );


            setVideoFiles(
                mergedVideos
            );


            if (
                mergedVideos.length > 0
            ) {

                setSelectedIndex(0);

                setSelectedFile(
                    mergedVideos[0]
                );

            } else {

                setSelectedIndex(0);

                setSelectedFile(
                    null
                );
            }

        } catch (error) {

            console.error(
                "Load video files error:",
                error
            );

            setVideoFiles([]);

            setSelectedFile(null);

            toast.error(
                "Unable to load your videos."
            );

        } finally {

            setLoadingFiles(false);
        }
    };


    useEffect(() => {

        loadVideoFiles();

    }, [userId]);


    // =====================================================
    // SET DEFAULT EDIT VALUES
    // =====================================================

    const resetVideoControls = () => {

        setDuration(0);

        setCurrentTime(0);

        setTrimStart(0);

        setTrimEnd(0);

        setCutEnabled(false);

        setCutStart(0);

        setCutEnd(0);

        setCropPercent(100);

        setRotation(0);

        setSpeed(1);

        setVolume(100);

        setEditedFile(null);

        setFFmpegProgress(0);

        setPreviewPlaying(false);


        if (
            editedPreviewUrlRef.current
        ) {

            URL.revokeObjectURL(
                editedPreviewUrlRef.current
            );

            editedPreviewUrlRef.current =
                null;
        }
    };


    // =====================================================
    // SELECT VIDEO
    // =====================================================

    const selectVideo = (
        index
    ) => {

        if (
            index < 0 ||
            index >= videoFiles.length
        ) {
            return;
        }


        setSelectedIndex(
            index
        );

        setSelectedFile(
            videoFiles[index]
        );


        resetVideoControls();
    };


    // =====================================================
    // LOAD SELECTED VIDEO PREVIEW
    // =====================================================

    useEffect(() => {

        if (
            !selectedFile
        ) {

            return;
        }


        let cancelled = false;

        let previewUrl =
            null;


        const loadSelectedVideo =
            async() => {

                try {

                    const fileData =
                        await getEditableFileData(
                            selectedFile
                        );


                    if (
                        !fileData
                    ) {

                        toast.error(
                            "Selected video is not available."
                        );

                        return;
                    }


                    previewUrl =
                        getPreviewUrl(
                            fileData
                        );


                    if (
                        !previewUrl
                    ) {

                        toast.error(
                            "Unable to create video preview."
                        );

                        return;
                    }


                    if (
                        cancelled
                    ) {

                        return;
                    }


                    if (
                        previewUrlRef.current
                    ) {

                        URL.revokeObjectURL(
                            previewUrlRef.current
                        );
                    }


                    previewUrlRef.current =
                        previewUrl;


                    if (
                        videoRef.current
                    ) {

                        videoRef.current.src =
                            previewUrl;

                        videoRef.current.load();
                    }


                    if (
                        !selectedFile.fileData
                    ) {

                        const updatedFile = {

                            ...selectedFile,

                            fileData

                        };


                        setSelectedFile(
                            updatedFile
                        );


                        setVideoFiles(
                            (currentFiles) => {

                                return currentFiles.map(
                                    (file) => {

                                        const sameFile =
                                            (
                                                selectedFile.localFileId &&
                                                file.localFileId ===
                                                    selectedFile.localFileId
                                            ) ||
                                            (
                                                selectedFile.mongoFileId &&
                                                file.mongoFileId ===
                                                    selectedFile.mongoFileId
                                            );


                                        return sameFile
                                            ? {
                                                ...file,
                                                fileData
                                            }
                                            : file;
                                    }
                                );
                            }
                        );
                    }


                    resetVideoControls();

                } catch (error) {

                    console.error(
                        "Load selected video error:",
                        error
                    );

                    if (
                        !cancelled
                    ) {

                        toast.error(
                            error.message ||
                            "Unable to open selected video."
                        );
                    }

                }

            };


        loadSelectedVideo();


        return () => {

            cancelled = true;


            if (
                videoRef.current
            ) {

                videoRef.current.pause();
            }

        };

    }, [selectedFile]);


    // =====================================================
    // VIDEO METADATA
    // =====================================================

    const handleLoadedMetadata = () => {

        if (
            !videoRef.current
        ) {
            return;
        }


        const videoDuration =
            Number(
                videoRef.current.duration
            );


        if (
            !Number.isFinite(
                videoDuration
            ) ||
            videoDuration <= 0
        ) {
            return;
        }


        setDuration(
            videoDuration
        );

        setTrimStart(0);

        setTrimEnd(
            videoDuration
        );

        setCutStart(
            0
        );

        setCutEnd(
            videoDuration
        );
    };


    const handleTimeUpdate = () => {

        if (
            !videoRef.current
        ) {
            return;
        }


        setCurrentTime(
            videoRef.current.currentTime
        );
    };


    const handleVideoEnded = () => {

        setPreviewPlaying(
            false
        );
    };


    // =====================================================
    // PLAY / PAUSE PREVIEW
    // =====================================================

    const togglePreview = async() => {

        if (
            !videoRef.current
        ) {
            return;
        }


        try {

            if (
                videoRef.current.paused
            ) {

                await videoRef.current.play();

                setPreviewPlaying(
                    true
                );

            } else {

                videoRef.current.pause();

                setPreviewPlaying(
                    false
                );
            }

        } catch (error) {

            console.error(
                "Video preview error:",
                error
            );
        }
    };


    // =====================================================
    // SEEK
    // =====================================================

    const handleSeek = (
        value
    ) => {

        const nextTime =
            Number(value);


        if (
            videoRef.current
        ) {

            videoRef.current.currentTime =
                nextTime;
        }


        setCurrentTime(
            nextTime
        );
    };


    // =====================================================
    // TRIM START
    // =====================================================

    const handleTrimStart = (
        value
    ) => {

        const next =
            clamp(
                Number(value),
                0,
                Math.max(
                    0,
                    trimEnd - 0.1
                )
            );


        setTrimStart(
            next
        );


        if (
            currentTime < next
        ) {

            handleSeek(
                next
            );
        }
    };


    // =====================================================
    // TRIM END
    // =====================================================

    const handleTrimEnd = (
        value
    ) => {

        const next =
            clamp(
                Number(value),
                Math.min(
                    duration,
                    trimStart + 0.1
                ),
                duration
            );


        setTrimEnd(
            next
        );


        if (
            currentTime > next
        ) {

            handleSeek(
                next
            );
        }
    };


    // =====================================================
    // CUT RANGE
    // =====================================================

    const handleCutStart = (
        value
    ) => {

        const next =
            clamp(
                Number(value),
                0,
                Math.max(
                    0,
                    cutEnd - 0.1
                )
            );


        setCutStart(
            next
        );
    };


    const handleCutEnd = (
        value
    ) => {

        const next =
            clamp(
                Number(value),
                Math.min(
                    duration,
                    cutStart + 0.1
                ),
                duration
            );


        setCutEnd(
            next
        );
    };


    // =====================================================
    // LOCAL VIDEO INPUT
    // =====================================================

    const handleLocalVideo = (
        event
    ) => {

        const files =
            event.target.files;


        if (
            !files ||
            files.length === 0
        ) {
            return;
        }


        const file =
            files[0];


        if (
            !file.type.startsWith(
                "video/"
            )
        ) {

            toast.error(
                "Please select a video file."
            );

            event.target.value =
                "";

            return;
        }


        const localVideo = {

            localFileId:
                "temporary-" +
                Date.now(),

            mongoFileId:
                null,

            userId,

            fileName:
                file.name,

            fileType:
                "video",

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

            parentFileId:
                null,

            isCopy:
                false,

            isEdited:
                false,

            syncStatus:
                "pending",

            createdAt:
                new Date(),

            updatedAt:
                new Date()
        };


        setVideoFiles(
            (currentFiles) => [
                localVideo,
                ...currentFiles
            ]
        );


        setSelectedIndex(0);

        setSelectedFile(
            localVideo
        );


        toast.success(
            "Video loaded into editor."
        );


        event.target.value =
            "";
    };


    // =====================================================
    // LOAD FFMPEG
    // =====================================================

    const loadFFmpeg = async() => {

        if (
            ffmpegLoadedRef.current
        ) {
            return true;
        }


        try {

            setLoadingFFmpeg(
                true
            );


            const ffmpeg =
                ffmpegRef.current;


            if (
                !ffmpegEventsAttachedRef.current
            ) {

                ffmpeg.on(
                    "progress",
                    ({
                        progress
                    }) => {

                        if (
                            Number.isFinite(
                                progress
                            )
                        ) {

                            setFFmpegProgress(
                                Math.round(
                                    progress * 100
                                )
                            );
                        }
                    }
                );


                ffmpegEventsAttachedRef.current =
                    true;
            }


            const baseURL =
                "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";


            await ffmpeg.load({

                coreURL:
                    await toBlobURL(
                        `${baseURL}/ffmpeg-core.js`,
                        "text/javascript"
                    ),

                wasmURL:
                    await toBlobURL(
                        `${baseURL}/ffmpeg-core.wasm`,
                        "application/wasm"
                    )

            });


            ffmpegLoadedRef.current =
                true;


            toast.success(
                "Video editor engine loaded."
            );


            return true;

        } catch (error) {

            console.error(
                "FFmpeg load error:",
                error
            );


            toast.error(
                "Unable to load video editor engine."
            );


            return false;

        } finally {

            setLoadingFFmpeg(
                false
            );
        }
    };


    // =====================================================
    // BUILD COMMON FILTERS
    // =====================================================

    const getCropFilter = () => {

        if (
            cropPercent >= 100
        ) {
            return "";
        }


        const percent =
            clamp(
                cropPercent,
                50,
                100
            );


        const widthExpression =
            `${percent / 100}*iw`;


        const heightExpression =
            `${percent / 100}*ih`;


        const xExpression =
            `(iw-${widthExpression})/2`;


        const yExpression =
            `(ih-${heightExpression})/2`;


        return (
            `crop=${widthExpression}:${heightExpression}:${xExpression}:${yExpression}`
        );
    };


    const getRotateFilter = () => {

        if (
            rotation === 90
        ) {
            return "transpose=1";
        }

        if (
            rotation === 180
        ) {
            return "hflip,vflip";
        }

        if (
            rotation === 270
        ) {
            return "transpose=2";
        }

        return "";
    };


    const getVideoFilter = (
        includeTrim
    ) => {

        const filters = [];


        if (
            includeTrim
        ) {

            filters.push(
                "setpts=PTS-STARTPTS"
            );
        }


        const cropFilter =
            getCropFilter();


        if (
            cropFilter
        ) {
            filters.push(
                cropFilter
            );
        }


        const rotateFilter =
            getRotateFilter();


        if (
            rotateFilter
        ) {
            filters.push(
                rotateFilter
            );
        }


        if (
            speed !== 1
        ) {

            filters.push(
                `setpts=${1 / speed}*PTS`
            );
        }


        return filters.join(
            ","
        );
    };


    // =====================================================
    // EXECUTE EDIT
    // =====================================================

    const processVideo = async(
        action
    ) => {

        if (
            !selectedFile
        ) {

            toast.error(
                "Select a video first."
            );

            return null;
        }


        const sourceFile =
            await getEditableFileData(
                selectedFile
            );


        if (
            !sourceFile
        ) {

            toast.error(
                "Selected video is not available."
            );

            return null;
        }


        const loaded =
            await loadFFmpeg();


        if (!loaded) {

            return null;
        }


        const ffmpeg =
            ffmpegRef.current;


        const extension =
            getVideoInputExtension(
                sourceFile
            );


        const inputName =
            `input_${Date.now()}.${extension}`;


        const outputName =
            `output_${Date.now()}.mp4`;


        try {

            setProcessing(
                true
            );

            setFFmpegProgress(
                0
            );


            await ffmpeg.writeFile(
                inputName,
                await fetchFile(
                    sourceFile
                )
            );


            let command = [];


            // =================================================
            // COMMON VIDEO FILTER
            // =================================================

            const videoFilter =
                getVideoFilter(
                    false
                );


            const safeVideoFilter =
                videoFilter ||
                "setpts=PTS-STARTPTS";


            const videoAudioFilters = [];


            if (
                speed !== 1
            ) {

                const safeSpeed =
                    speed === 2
                        ? "2.0"
                        : speed === 1.5
                            ? "1.5"
                            : speed === 0.75
                                ? "0.75"
                                : speed === 0.5
                                    ? "0.5"
                                    : String(speed);


                videoAudioFilters.push(
                    `atempo=${safeSpeed}`
                );
            }


            if (
                volume !== 100
            ) {

                videoAudioFilters.push(
                    `volume=${volume / 100}`
                );
            }


            const audioFilter =
                videoAudioFilters.join(
                    ","
                );


            // =================================================
            // TRIM
            // =================================================

            if (
                action === "trim"
            ) {

                const trimDuration =
                    Math.max(
                        0.1,
                        Number(
                            trimEnd -
                            trimStart
                        )
                    );


                command = [
                    "-i",
                    inputName,

                    "-ss",
                    String(
                        trimStart
                    ),

                    "-t",
                    String(
                        trimDuration
                    ),

                    "-vf",
                    safeVideoFilter,

                    "-map",
                    "0:v:0",

                    "-map",
                    "0:a:0?",

                    ...(audioFilter
                        ? [
                            "-af",
                            audioFilter
                        ]
                        : []),

                    "-c:v",
                    "libx264",

                    "-preset",
                    "ultrafast",

                    "-pix_fmt",
                    "yuv420p",

                    "-c:a",
                    "aac",

                    "-b:a",
                    "128k",

                    "-movflags",
                    "+faststart",

                    outputName
                ];
            }


            // =================================================
            // CUT MIDDLE RANGE
            // =================================================

            if (
                action === "cut"
            ) {

                const firstDuration =
                    Math.max(
                        0,
                        Number(
                            cutStart
                        )
                    );


                const secondStart =
                    Math.max(
                        0,
                        Number(
                            cutEnd
                        )
                    );


                const videoParts = [];


                const cropFilter =
                    getCropFilter();


                const rotateFilter =
                    getRotateFilter();


                if (
                    cropFilter
                ) {

                    videoParts.push(
                        cropFilter
                    );
                }


                if (
                    rotateFilter
                ) {

                    videoParts.push(
                        rotateFilter
                    );
                }


                if (
                    speed !== 1
                ) {

                    videoParts.push(
                        `setpts=${1 / speed}*PTS`
                    );
                }


                const postVideoFilter =
                    videoParts.length > 0
                        ? "," +
                            videoParts.join(
                                ","
                            )
                        : "";


                const audioPostFilters = [];


                if (
                    speed !== 1
                ) {

                    const safeSpeed =
                        speed === 2
                            ? "2.0"
                            : speed === 1.5
                                ? "1.5"
                                : speed === 0.75
                                    ? "0.75"
                                    : speed === 0.5
                                        ? "0.5"
                                        : String(speed);


                    audioPostFilters.push(
                        `atempo=${safeSpeed}`
                    );
                }


                if (
                    volume !== 100
                ) {

                    audioPostFilters.push(
                        `volume=${volume / 100}`
                    );
                }


                if (
                    fadeIn >
                    0
                ) {

                    audioPostFilters.push(
                        `afade=t=in:st=0:d=${fadeIn}`
                    );
                }


                if (
                    fadeOut >
                    0
                ) {

                    const keptDuration =
                        Math.max(
                            0.1,
                            duration -
                            (
                                cutEnd -
                                cutStart
                            )
                        );


                    const safeFadeOut =
                        Math.min(
                            fadeOut,
                            keptDuration
                        );


                    const fadeStart =
                        Math.max(
                            0,
                            keptDuration -
                            safeFadeOut
                        );


                    audioPostFilters.push(
                        `afade=t=out:st=${fadeStart}:d=${safeFadeOut}`
                    );
                }


                const audioFilterGraph =
                    audioPostFilters.length > 0
                        ? `,${audioPostFilters.join(",")}`
                        : "";


                const filterParts = [

                    `[0:v]trim=start=0:end=${firstDuration},setpts=PTS-STARTPTS${postVideoFilter}[v1]`,

                    `[0:v]trim=start=${secondStart},setpts=PTS-STARTPTS${postVideoFilter}[v2]`,

                    `[v1][v2]concat=n=2:v=1:a=0[vout]`,

                    `[0:a]atrim=start=0:end=${firstDuration},asetpts=PTS-STARTPTS[basea1]`,

                    `[0:a]atrim=start=${secondStart},asetpts=PTS-STARTPTS[basea2]`,

                    `[basea1][basea2]concat=n=2:v=0:a=1${audioFilterGraph}[aout]`
                ];


                command = [

                    "-i",
                    inputName,

                    "-filter_complex",
                    filterParts.join(
                        ";"
                    ),

                    "-map",
                    "[vout]",

                    "-map",
                    "[aout]",

                    "-c:v",
                    "libx264",

                    "-preset",
                    "ultrafast",

                    "-pix_fmt",
                    "yuv420p",

                    "-c:a",
                    "aac",

                    "-b:a",
                    "128k",

                    "-movflags",
                    "+faststart",

                    outputName
                ];
            }


            // =================================================
            // ADJUST / EFFECT
            // =================================================

            if (
                action === "adjust"
            ) {

                command = [
                    "-i",
                    inputName,

                    "-vf",
                    safeVideoFilter,

                    "-map",
                    "0:v:0",

                    "-map",
                    "0:a:0?",

                    ...(audioFilter
                        ? [
                            "-af",
                            audioFilter
                        ]
                        : []),

                    "-c:v",
                    "libx264",

                    "-preset",
                    "ultrafast",

                    "-pix_fmt",
                    "yuv420p",

                    "-c:a",
                    "aac",

                    "-b:a",
                    "128k",

                    "-movflags",
                    "+faststart",

                    outputName
                ];
            }


            if (
                command.length === 0
            ) {

                throw new Error(
                    "Invalid video processing action."
                );
            }


            try {

                await ffmpeg.exec(
                    command
                );

            } catch (audioCommandError) {

                // -------------------------------------------------
                // Some device videos contain no audio stream.
                // Retry cut/trim/adjust without audio if the
                // audio graph/map is the part that failed.
                // -------------------------------------------------

                console.error(
                    "Video command with audio failed:",
                    audioCommandError
                );


                if (
                    action !== "cut"
                ) {

                    throw audioCommandError;
                }


                try {

                    await ffmpeg.deleteFile(
                        outputName
                    );

                } catch (deleteError) {
                    // Output may not exist. Ignore.
                }


                const videoOnlyFilterParts = [];

                const cropFilter =
                    getCropFilter();

                const rotateFilter =
                    getRotateFilter();


                if (
                    cropFilter
                ) {

                    videoOnlyFilterParts.push(
                        cropFilter
                    );
                }


                if (
                    rotateFilter
                ) {

                    videoOnlyFilterParts.push(
                        rotateFilter
                    );
                }


                if (
                    speed !== 1
                ) {

                    videoOnlyFilterParts.push(
                        `setpts=${1 / speed}*PTS`
                    );
                }


                const videoOnlyPost =
                    videoOnlyFilterParts.length > 0
                        ? "," +
                            videoOnlyFilterParts.join(
                                ","
                            )
                        : "";


                const videoOnlyGraph = [

                    `[0:v]trim=start=0:end=${Math.max(
                        0,
                        Number(
                            cutStart
                        )
                    )},setpts=PTS-STARTPTS${videoOnlyPost}[v1]`,

                    `[0:v]trim=start=${Math.max(
                        0,
                        Number(
                            cutEnd
                        )
                    )},setpts=PTS-STARTPTS${videoOnlyPost}[v2]`,

                    `[v1][v2]concat=n=2:v=1:a=0[vout]`
                ];


                const videoOnlyCommand = [

                    "-i",
                    inputName,

                    "-filter_complex",
                    videoOnlyGraph.join(
                        ";"
                    ),

                    "-map",
                    "[vout]",

                    "-c:v",
                    "libx264",

                    "-preset",
                    "ultrafast",

                    "-pix_fmt",
                    "yuv420p",

                    "-movflags",
                    "+faststart",

                    outputName
                ];


                await ffmpeg.exec(
                    videoOnlyCommand
                );
            }


            const data =
                await ffmpeg.readFile(
                    outputName
                );


            const outputFile =
                new File(
                    [
                        data
                    ],
                    `${getBaseName(selectedFile.fileName)}_edited_${Date.now()}.mp4`,
                    {
                        type:
                            "video/mp4"
                    }
                );


            const previewUrl =
                URL.createObjectURL(
                    outputFile
                );


            if (
                editedPreviewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    editedPreviewUrlRef.current
                );
            }


            editedPreviewUrlRef.current =
                previewUrl;


            setEditedFile({

                file:
                    outputFile,

                previewUrl

            });


            toast.success(
                action === "trim"
                    ? "Trimmed video generated."
                    : action === "cut"
                        ? "Selected section removed."
                        : "Edited video generated."
            );


            return outputFile;

        } catch (error) {

            console.error(
                "Video processing error:",
                error
            );


            toast.error(
                error && error.message
                    ? error.message
                    : "Video processing failed."
            );


            return null;

        } finally {

            try {

                await ffmpeg.deleteFile(
                    inputName
                );

            } catch (deleteError) {

                console.error(
                    "Delete input error:",
                    deleteError
                );
            }


            try {

                await ffmpeg.deleteFile(
                    outputName
                );

            } catch (deleteError) {

                console.error(
                    "Delete output error:",
                    deleteError
                );
            }


            setProcessing(
                false
            );

            setFFmpegProgress(
                0
            );
        }
    };


    // =====================================================
    // TRIM
    // =====================================================

    const handleTrim = async() => {

        if (
            trimEnd <= trimStart
        ) {

            toast.error(
                "Trim end must be greater than trim start."
            );

            return;
        }


        await processVideo(
            "trim"
        );
    };


    // =====================================================
    // CUT
    // =====================================================

    const handleCut = async() => {

        if (
            cutEnd <= cutStart
        ) {

            toast.error(
                "Cut end must be greater than cut start."
            );

            return;
        }


        if (
            cutStart <= 0 &&
            cutEnd >= duration
        ) {

            toast.error(
                "You cannot cut the entire video."
            );

            return;
        }


        await processVideo(
            "cut"
        );
    };


    // =====================================================
    // ADJUST
    // =====================================================

    const handleApplyAdjustments =
        async() => {

            await processVideo(
                "adjust"
            );
        };


    // =====================================================
    // SAVE EDITED COPY
    // =====================================================

    const saveEditedCopy = async() => {

        if (
            !editedFile ||
            !editedFile.file
        ) {

            toast.error(
                "Create an edited video first."
            );

            return;
        }


        if (!userId) {

            toast.error(
                "Please login again."
            );

            return;
        }


        let cloudSynced = false;
        let localSaved = false;
        let cloudUploadError = "";


        try {

            setSaving(
                true
            );


            const file =
                editedFile.file;


            const localFileId =
                createLocalFileId();

            const selectedCategoryId =
                selectedFile.categoryId ||
                selectedFile.category?._id ||
                selectedFile.category ||
                null;


            try {
                await addFile({
                    localFileId,
                    userId,
                    fileName: file.name,
                    fileType: "video",
                    mimeType: file.type,
                    size: file.size,
                    fileData: file,
                    categoryId: selectedCategoryId,
                    isFavorite: false,
                    isDeleted: false,
                    deletedAt: null,
                    syncStatus: "pending",
                    parentFileId: selectedFile.mongoFileId || null,
                    isCopy: false,
                    isEdited: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                localSaved = true;
            } catch (localSaveError) {
                // IndexedDB quota/storage errors must not prevent the actual
                // Cloudinary upload from being attempted.
                console.warn(
                    "Could not cache edited video locally; continuing with cloud upload:",
                    localSaveError
                );
            }


            try {

                const response =
                    await createFile({

                        localFileId,

                        fileName:
                            file.name,

                        fileType:
                            "video",

                        mimeType:
                            file.type,

                        size:
                            file.size,

                        categoryId:
                            selectedCategoryId,

                        parentFileId:
                            selectedFile.mongoFileId ||
                            null,

                        isCopy:
                            false,

                        isEdited:
                            true,

                        file
                    });


                const mongoFile =
                    response?.data?.data ||
                    response?.data ||
                    response;


                if (
                    mongoFile &&
                    mongoFile._id
                ) {

                    cloudSynced = Boolean(
                        mongoFile._id &&
                        mongoFile.fileUrl
                    );

                    if (localSaved) {
                        await updateFileByLocalId(
                            localFileId,
                            {
                                mongoFileId:
                                    mongoFile._id,

                                fileUrl:
                                    mongoFile.fileUrl ||
                                    null,

                                cloudinaryPublicId:
                                    mongoFile.cloudinaryPublicId ||
                                    null,

                                cloudinaryResourceType:
                                    mongoFile.cloudinaryResourceType ||
                                    null,

                                cloudinaryFormat:
                                    mongoFile.cloudinaryFormat ||
                                    null,

                                syncStatus:
                                    cloudSynced
                                        ? "synced"
                                        : "pending",

                                updatedAt:
                                    new Date()
                            }
                        );
                    }

                } else {

                    if (localSaved) {
                        await updateFileByLocalId(
                            localFileId,
                            {
                                syncStatus: "pending",
                                updatedAt: new Date()
                            }
                        );
                    }
                }

            } catch (apiError) {

                cloudUploadError =
                    apiError?.response?.data?.message ||
                    apiError?.message ||
                    "Cloudinary upload failed.";

                console.error(
                    "Edited video sync error:",
                    apiError
                );


                if (localSaved) {
                    await updateFileByLocalId(
                        localFileId,
                        {
                            syncStatus: "pending",
                            updatedAt: new Date()
                        }
                    );
                }
            }


            if (!cloudSynced && localSaved) {
                // Retry the persisted edited file so a transient upload failure
                // does not leave the only copy in this browser's IndexedDB.
                try {
                    await syncPendingFiles(userId);
                    const savedFile = await getFileByLocalId(localFileId);
                    cloudSynced = Boolean(
                        savedFile?.mongoFileId &&
                        savedFile?.fileUrl
                    );
                } catch (syncError) {
                    console.error(
                        "Immediate edited video sync retry failed:",
                        syncError
                    );
                }
            }


            if (cloudSynced) {
                toast.success("Edited video saved as a new copy.");
            } else {
                const localCopyMessage = localSaved
                    ? " The edited video remains on this browser; do not clear its storage yet."
                    : " The edited result remains open in the editor; do not leave or refresh this page. The browser could not cache it locally.";
                toast.error(
                    `Cloud upload failed: ${cloudUploadError || "No Cloudinary URL was returned."}${localCopyMessage}`
                );
            }


            await loadVideoFiles();


            if (cloudSynced) {
                setEditedFile(
                    null
                );
            }

        } catch (error) {

            console.error(
                "Save edited video error:",
                error
            );


            toast.error(
                error.message ||
                "Unable to save edited video."
            );

        } finally {

            setSaving(
                false
            );
        }
    };


    // =====================================================
    // CLEAR EDITED PREVIEW
    // =====================================================

    const clearEditedPreview = () => {

        setEditedFile(
            null
        );


        if (
            editedPreviewUrlRef.current
        ) {

            URL.revokeObjectURL(
                editedPreviewUrlRef.current
            );

            editedPreviewUrlRef.current =
                null;
        }
    };


    // =====================================================
    // CLEANUP
    // =====================================================

    useEffect(() => {

        return () => {

            if (
                previewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    previewUrlRef.current
                );

                previewUrlRef.current =
                    null;
            }


            if (
                editedPreviewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    editedPreviewUrlRef.current
                );

                editedPreviewUrlRef.current =
                    null;
            }

        };

    }, []);


    // =====================================================
    // EMPTY SESSION
    // =====================================================

    if (!userId) {

        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">

                <div className="rounded-3xl border border-red-400/20 bg-red-500/5 p-8 text-center">

                    <Video
                        size={44}
                        className="mx-auto text-red-400"
                    />

                    <h1 className="mt-4 text-xl font-semibold text-white">
                        Session not available
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Please login again to use the video editor.
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="mx-auto max-w-7xl space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">

                        <Video size={14} />

                        Video Editor

                    </div>


                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Edit Your Videos
                    </h1>


                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Trim, cut, crop, rotate, change speed and adjust volume directly in your browser.
                    </p>

                </div>


                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={
                            loadFFmpeg
                        }
                        disabled={
                            loadingFFmpeg ||
                            processing
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                    >

                        {loadingFFmpeg ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Film size={17} />
                        )}

                        {ffmpegLoadedRef.current
                            ? "Editor Ready"
                            : "Load Editor"}

                    </button>

                </div>

            </div>


            {/* =================================================
                SELECT VIDEO
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                    <button
                        type="button"
                        onClick={
                            openPicker
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    >

                        <Upload size={18} />

                        Choose Video

                    </button>


                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={
                            handleLocalVideo
                        }
                    />


                    <div className="flex min-w-0 flex-1 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                selectVideo(
                                    selectedIndex - 1
                                )
                            }
                            disabled={
                                selectedIndex <= 0 ||
                                videoFiles.length === 0 ||
                                processing
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                        >
                            ‹
                        </button>


                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-white">

                                {selectedFile
                                    ? selectedFile.fileName
                                    : "No video selected"}

                            </p>


                            <p className="mt-1 text-xs text-slate-500">

                                {videoFiles.length > 0
                                    ? `${selectedIndex + 1} of ${videoFiles.length} videos`
                                    : "Upload a video to start editing"}

                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                selectVideo(
                                    selectedIndex + 1
                                )
                            }
                            disabled={
                                selectedIndex >=
                                    videoFiles.length - 1 ||
                                videoFiles.length === 0 ||
                                processing
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                        >
                            ›
                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {loadingFiles ? (

                <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70">

                    <div className="text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                        <p className="mt-4 text-sm text-slate-400">
                            Loading videos...
                        </p>

                    </div>

                </div>

            ) : !selectedFile ? (

                <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 px-6 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-slate-500">

                        <Video size={38} />

                    </div>


                    <h2 className="mt-5 text-lg font-semibold text-white">
                        No videos available
                    </h2>


                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Upload a video or record one with Camera first.
                    </p>


                    <button
                        type="button"
                        onClick={
                            openPicker
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                    >
                        <Upload size={17} />
                        Upload Video
                    </button>

                </div>

            ) : (

                <div className="space-y-6">

                    {/* =================================================
                        MAIN EDITOR
                    ================================================= */}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">

                        {/* VIDEO PREVIEW */}

                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

                            <div className="relative flex min-h-[600px] items-center justify-center bg-black p-4 sm:p-6">

                                <video
                                    ref={
                                        videoRef
                                    }
                                    controls
                                    playsInline
                                    onLoadedMetadata={
                                        handleLoadedMetadata
                                    }
                                    onTimeUpdate={
                                        handleTimeUpdate
                                    }
                                    onEnded={
                                        handleVideoEnded
                                    }
                                    className="max-h-[72vh] w-full rounded-2xl object-contain"
                                />


                                {processing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">

                                        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-6 text-center">

                                            <LoaderCircle
                                                size={42}
                                                className="mx-auto animate-spin text-white"
                                            />

                                            <h3 className="mt-4 text-base font-semibold text-white">
                                                Processing video...
                                            </h3>


                                            <p className="mt-2 text-xs text-slate-500">
                                                This happens inside your browser.
                                            </p>


                                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

                                                <div
                                                    className="h-full rounded-full bg-white transition-all"
                                                    style={{
                                                        width:
                                                            `${ffmpegProgress}%`
                                                    }}
                                                />

                                            </div>


                                            <p className="mt-2 text-xs font-semibold text-slate-400">
                                                {ffmpegProgress}%
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>


                            <div className="border-t border-white/10 bg-slate-900/80 p-4">

                                <div className="flex flex-wrap items-center gap-3">

                                    <button
                                        type="button"
                                        onClick={
                                            togglePreview
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
                                    >

                                        {previewPlaying ? (
                                            <Pause size={17} />
                                        ) : (
                                            <Play size={17} />
                                        )}

                                        {previewPlaying
                                            ? "Pause Preview"
                                            : "Play Preview"}

                                    </button>


                                    <div className="flex min-w-[180px] flex-1 items-center gap-3">

                                        <Clock3
                                            size={16}
                                            className="shrink-0 text-slate-500"
                                        />


                                        <input
                                            type="range"
                                            min="0"
                                            max={
                                                duration
                                            }
                                            step="0.01"
                                            value={
                                                currentTime
                                            }
                                            onChange={(event) =>
                                                handleSeek(
                                                    event.target.value
                                                )
                                            }
                                            className="w-full"
                                        />


                                        <span className="min-w-20 text-right text-xs text-slate-500">
                                            {formatTime(
                                                currentTime
                                            )}
                                            {" / "}
                                            {formatTime(
                                                duration
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            TOOLS
                        ================================================= */}

                        <div className="space-y-4">

                            {/* TRIM */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center gap-2">

                                    <Scissors
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Trim
                                    </h2>

                                </div>


                                <div className="space-y-4">

                                    <label className="block">

                                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                            <span>
                                                Start
                                            </span>

                                            <span>
                                                {formatTime(
                                                    trimStart
                                                )}
                                            </span>

                                        </div>


                                        <input
                                            type="range"
                                            min="0"
                                            max={
                                                Math.max(
                                                    0,
                                                    trimEnd - 0.1
                                                )
                                            }
                                            step="0.01"
                                            value={
                                                trimStart
                                            }
                                            onChange={(event) =>
                                                handleTrimStart(
                                                    event.target.value
                                                )
                                            }
                                            className="w-full"
                                        />

                                    </label>


                                    <label className="block">

                                        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                            <span>
                                                End
                                            </span>

                                            <span>
                                                {formatTime(
                                                    trimEnd
                                                )}
                                            </span>

                                        </div>


                                        <input
                                            type="range"
                                            min={
                                                Math.min(
                                                    duration,
                                                    trimStart + 0.1
                                                )
                                            }
                                            max={
                                                Math.max(
                                                    0.1,
                                                    duration
                                                )
                                            }
                                            step="0.01"
                                            value={
                                                trimEnd
                                            }
                                            onChange={(event) =>
                                                handleTrimEnd(
                                                    event.target.value
                                                )
                                            }
                                            className="w-full"
                                        />

                                    </label>


                                    <button
                                        type="button"
                                        onClick={
                                            handleTrim
                                        }
                                        disabled={
                                            processing ||
                                            duration <= 0 ||
                                            trimEnd <= trimStart
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40"
                                    >

                                        <Scissors size={15} />

                                        Trim Video

                                    </button>

                                </div>

                            </div>


                            {/* CUT */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <Trash2
                                            size={17}
                                            className="text-slate-300"
                                        />

                                        <h2 className="text-sm font-semibold text-white">
                                            Cut Out
                                        </h2>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCutEnabled(
                                                (currentValue) =>
                                                    !currentValue
                                            )
                                        }
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                            cutEnabled
                                                ? "border-white/20 bg-white text-slate-950"
                                                : "border-white/10 bg-white/5 text-slate-400"
                                        }`}
                                    >
                                        {cutEnabled
                                            ? "Enabled"
                                            : "Enable"}
                                    </button>

                                </div>


                                {cutEnabled && (

                                    <div className="space-y-4">

                                        <label className="block">

                                            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                                <span>
                                                    Cut Start
                                                </span>

                                                <span>
                                                    {formatTime(
                                                        cutStart
                                                    )}
                                                </span>

                                            </div>


                                            <input
                                                type="range"
                                                min="0"
                                                max={
                                                    Math.max(
                                                        0,
                                                        cutEnd - 0.1
                                                    )
                                                }
                                                step="0.01"
                                                value={
                                                    cutStart
                                                }
                                                onChange={(event) =>
                                                    handleCutStart(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full"
                                            />

                                        </label>


                                        <label className="block">

                                            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                                <span>
                                                    Cut End
                                                </span>

                                                <span>
                                                    {formatTime(
                                                        cutEnd
                                                    )}
                                                </span>

                                            </div>


                                            <input
                                                type="range"
                                                min={
                                                    Math.min(
                                                        duration,
                                                        cutStart + 0.1
                                                    )
                                                }
                                                max={
                                                    Math.max(
                                                        0.1,
                                                        duration
                                                    )
                                                }
                                                step="0.01"
                                                value={
                                                    cutEnd
                                                }
                                                onChange={(event) =>
                                                    handleCutEnd(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full"
                                            />

                                        </label>


                                        <button
                                            type="button"
                                            onClick={
                                                handleCut
                                            }
                                            disabled={
                                                processing ||
                                                duration <= 0 ||
                                                cutEnd <= cutStart
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40"
                                        >

                                            <Trash2 size={15} />

                                            Remove Selected Section

                                        </button>

                                    </div>

                                )}

                            </div>


                            {/* CROP */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center gap-2">

                                    <Crop
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Crop
                                    </h2>

                                </div>


                                <div className="grid grid-cols-4 gap-2">

                                    {[
                                        100,
                                        90,
                                        80,
                                        70
                                    ].map(
                                        (value) => (
                                            <button
                                                key={
                                                    value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setCropPercent(
                                                        value
                                                    )
                                                }
                                                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold ${
                                                    cropPercent ===
                                                    value
                                                        ? "border-white/20 bg-white text-slate-950"
                                                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                                                }`}
                                            >
                                                {value === 100
                                                    ? "Original"
                                                    : `${value}%`}
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* ROTATE */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center gap-2">

                                    <RotateCw
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Rotate
                                    </h2>

                                </div>


                                <div className="grid grid-cols-4 gap-2">

                                    {[
                                        0,
                                        90,
                                        180,
                                        270
                                    ].map(
                                        (value) => (
                                            <button
                                                key={
                                                    value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setRotation(
                                                        value
                                                    )
                                                }
                                                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold ${
                                                    rotation ===
                                                    value
                                                        ? "border-white/20 bg-white text-slate-950"
                                                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                                                }`}
                                            >
                                                {value}°
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* SPEED */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center gap-2">

                                    <Gauge
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Speed
                                    </h2>

                                </div>


                                <div className="grid grid-cols-5 gap-2">

                                    {[
                                        0.5,
                                        0.75,
                                        1,
                                        1.5,
                                        2
                                    ].map(
                                        (value) => (
                                            <button
                                                key={
                                                    value
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setSpeed(
                                                        value
                                                    )
                                                }
                                                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold ${
                                                    speed ===
                                                    value
                                                        ? "border-white/20 bg-white text-slate-950"
                                                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                                                }`}
                                            >
                                                {value}x
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>


                            {/* VOLUME */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-3 flex items-center justify-between">

                                    <div className="flex items-center gap-2">

                                        <Volume2
                                            size={17}
                                            className="text-slate-300"
                                        />

                                        <h2 className="text-sm font-semibold text-white">
                                            Volume
                                        </h2>

                                    </div>


                                    <span className="text-xs font-semibold text-slate-500">
                                        {volume}%
                                    </span>

                                </div>


                                <input
                                    type="range"
                                    min="0"
                                    max="150"
                                    step="5"
                                    value={
                                        volume
                                    }
                                    onChange={(event) =>
                                        setVolume(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                    className="w-full"
                                />


                                <button
                                    type="button"
                                    onClick={
                                        handleApplyAdjustments
                                    }
                                    disabled={
                                        processing
                                    }
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40"
                                >

                                    <Volume2 size={15} />

                                    Apply Edits

                                </button>

                            </div>


                            {/* RESET */}

                            <button
                                type="button"
                                onClick={
                                    resetVideoControls
                                }
                                disabled={
                                    processing
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-40"
                            >

                                <RotateCcw size={16} />

                                Reset Controls

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        EDITED RESULT
                    ================================================= */}

                    {editedFile && (
                        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-5 shadow-xl">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-white">

                                        <CheckCircle2
                                            size={18}
                                            className="text-emerald-400"
                                        />

                                        Edited Video Ready

                                    </div>


                                    <p className="mt-1 text-xs text-slate-500">
                                        Review the edited result before saving it to Gallery.
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            clearEditedPreview
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
                                    >

                                        <X size={16} />

                                        Discard Result

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            saveEditedCopy
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
                                    >

                                        <Save size={16} />

                                        {saving
                                            ? "Saving..."
                                            : "Save as Edited Copy"}

                                    </button>

                                </div>

                            </div>


                            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">

                                <video
                                    src={
                                        editedFile.previewUrl
                                    }
                                    controls
                                    playsInline
                                    className="max-h-[70vh] w-full bg-black"
                                />

                            </div>

                        </div>
                    )}


                    {/* =================================================
                        INFO
                    ================================================= */}

                    <div className="grid gap-4 md:grid-cols-3">

                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                            <Scissors
                                size={21}
                                className="text-slate-300"
                            />

                            <h3 className="mt-3 text-sm font-semibold text-white">
                                Trim & Cut
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Keep a selected range or remove a middle section from the video.
                            </p>

                        </div>


                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                            <Crop
                                size={21}
                                className="text-slate-300"
                            />

                            <h3 className="mt-3 text-sm font-semibold text-white">
                                Transform
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Crop, rotate and change playback speed before exporting.
                            </p>

                        </div>


                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                            <Save
                                size={21}
                                className="text-slate-300"
                            />

                            <h3 className="mt-3 text-sm font-semibold text-white">
                                Edited Copy
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                The original video remains unchanged. Each export becomes a new Gallery file.
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default VideoEditor;
