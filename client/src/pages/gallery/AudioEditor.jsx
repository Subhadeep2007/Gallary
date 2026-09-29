import{
    useEffect,
    useRef,
    useState
} from "react";

import {
    AudioLines,
    Upload,
    Scissors,
    Volume2,
    Gauge,
    Waves,
    Play,
    Pause,
    Save,
    Trash2,
    RotateCcw,
    LoaderCircle,
    CheckCircle2,
    X,
    VolumeX,
    Sparkles,
    Clock3
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
    updateFileByLocalId
} from "../../services/storage/db.js";

import {
    createFile,
    getFiles
} from "../../services/file/file.service.js";


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
                "Unable to download cloud audio."
            );
        }


        const blob =
            await response.blob();


        return new File(
            [
                blob
            ],
            file.fileName ||
                "audio",
            {
                type:
                    file.mimeType ||
                    blob.type ||
                    "audio/webm"
            }
        );
    }


    return null;
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


const getBaseName = (
    fileName
) => {

    const value =
        String(
            fileName || "audio"
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


const getInputExtension = (
    file
) => {

    const fileName =
        String(
            file &&
            file.name
                ? file.name
                : ""
        )
            .toLowerCase();

    const match =
        fileName.match(
            /\.([a-z0-9]+)$/
        );

    const extension =
        match &&
        match[1]
            ? match[1]
            : "";

    const supported =
        [
            "mp3",
            "wav",
            "wave",
            "ogg",
            "oga",
            "m4a",
            "mp4",
            "aac",
            "webm",
            "flac"
        ];

    if (
        supported.includes(
            extension
        )
    ) {

        return extension === "wave"
            ? "wav"
            : extension;
    }

    const mimeType =
        String(
            file &&
            file.type
                ? file.type
                : ""
        ).toLowerCase();

    if (
        mimeType.includes("mpeg")
    ) {
        return "mp3";
    }

    if (
        mimeType.includes("ogg")
    ) {
        return "ogg";
    }

    if (
        mimeType.includes("mp4") ||
        mimeType.includes("m4a")
    ) {
        return "m4a";
    }

    if (
        mimeType.includes("wav")
    ) {
        return "wav";
    }

    if (
        mimeType.includes("aac")
    ) {
        return "aac";
    }

    if (
        mimeType.includes("flac")
    ) {
        return "flac";
    }

    return "webm";
};


/*
 * App recordings use MediaRecorder, normally WebM/Opus.
 * FFmpeg performs the source normalization before editing.
 */
/*
 * App recordings use MediaRecorder, normally WebM/Opus.
 * FFmpeg performs the source normalization before editing.
 */


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

    const minutes =
        Math.floor(
            safe / 60
        );

    const secondsValue =
        Math.floor(
            safe % 60
        );

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


const getTempoFilter = (
    value
) => {

    const supported = [
        0.5,
        0.75,
        1,
        1.25,
        1.5,
        2
    ];

    let closest =
        supported[0];

    let difference =
        Math.abs(
            value -
            closest
        );

    for (
        let i = 1;
        i < supported.length;
        i++
    ) {

        const currentDifference =
            Math.abs(
                value -
                supported[i]
            );

        if (
            currentDifference <
            difference
        ) {

            closest =
                supported[i];

            difference =
                currentDifference;
        }
    }

    return closest;
};


// =========================================================
// AUDIO EDITOR
// =========================================================

const AudioEditor = () => {

    const {
        user
    } = useAuth();


    const userId =
        getUserId(user);


    const fileInputRef =
        useRef(null);


    const audioRef =
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
        audioFiles,
        setAudioFiles
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
        processing,
        setProcessing
    ] = useState(false);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        progress,
        setProgress
    ] = useState(0);


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
        volume,
        setVolume
    ] = useState(100);


    const [
        speed,
        setSpeed
    ] = useState(1);


    const [
        fadeIn,
        setFadeIn
    ] = useState(0);


    const [
        fadeOut,
        setFadeOut
    ] = useState(0);


    const [
        mutedPreview,
        setMutedPreview
    ] = useState(false);


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
    // LOAD AUDIO FILES
    // =====================================================

    const loadAudioFiles = async() => {

        if (!userId) {

            setAudioFiles([]);

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


            const localAudios =
                Array.isArray(
                    localFiles
                )
                    ? localFiles.filter(
                        (file) => {

                            return (
                                file.fileType ===
                                    "audio" &&
                                file.isDeleted !== true
                            );

                        }
                    )
                    : [];


            let cloudAudios = [];


            try {

                const cloudResponse =
                    await getFiles({
                        fileType:
                            "audio"
                    });


                const cloudFiles =
                    normalizeFilesResponse(
                        cloudResponse
                    );


                cloudAudios =
                    Array.isArray(
                        cloudFiles
                    )
                        ? cloudFiles.filter(
                            (file) => {

                                return (
                                    (
                                        file.fileType ===
                                            "audio" ||
                                        file.type ===
                                            "audio"
                                    ) &&
                                    file.isDeleted !== true
                                );

                            }
                        )
                        : [];

            } catch (cloudError) {

                console.error(
                    "Load cloud audio error:",
                    cloudError
                );
            }


            const mergedAudios =
                [...localAudios];


            cloudAudios.forEach(
                (cloudFile) => {

                    const cloudId =
                        cloudFile._id ||
                        cloudFile.id ||
                        cloudFile.mongoFileId ||
                        null;


                    const existingIndex =
                        mergedAudios.findIndex(
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

                        fileName:
                            cloudFile.fileName ||
                            cloudFile.name,

                        fileType:
                            cloudFile.fileType ||
                            cloudFile.type ||
                            "audio",

                        mimeType:
                            cloudFile.mimeType ||
                            "audio/webm",

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
                            mergedAudios[
                                existingIndex
                            ];


                        mergedAudios[
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

                        mergedAudios.push(
                            normalizedCloudFile
                        );
                    }

                }
            );


            setAudioFiles(
                mergedAudios
            );


            if (
                mergedAudios.length > 0
            ) {

                setSelectedIndex(
                    0
                );

                setSelectedFile(
                    mergedAudios[0]
                );

            } else {

                setSelectedIndex(
                    0
                );

                setSelectedFile(
                    null
                );
            }

        } catch (error) {

            console.error(
                "Load audio files error:",
                error
            );

            setAudioFiles([]);

            setSelectedFile(null);

            toast.error(
                "Unable to load your audio files."
            );

        } finally {

            setLoadingFiles(false);
        }
    };


    useEffect(() => {

        loadAudioFiles();

    }, [userId]);


    // =====================================================
    // RESET CONTROLS
    // =====================================================

    const resetControls = () => {

        setDuration(0);

        setCurrentTime(0);

        setTrimStart(0);

        setTrimEnd(0);

        setCutEnabled(false);

        setCutStart(0);

        setCutEnd(0);

        setVolume(100);

        setSpeed(1);

        setFadeIn(0);

        setFadeOut(0);

        setMutedPreview(false);

        setProgress(0);

        setPreviewPlaying(false);

        setEditedFile(null);

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
    // SELECT AUDIO
    // =====================================================

    const selectAudio = (
        index
    ) => {

        if (
            index < 0 ||
            index >= audioFiles.length
        ) {
            return;
        }

        setSelectedIndex(
            index
        );

        setSelectedFile(
            audioFiles[index]
        );

        resetControls();
    };


    // =====================================================
    // LOAD SELECTED AUDIO
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


        const loadSelectedAudio =
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
                            "Selected audio is not available."
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
                            "Unable to create audio preview."
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
                        audioRef.current
                    ) {

                        audioRef.current.src =
                            previewUrl;

                        audioRef.current.load();
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


                        setAudioFiles(
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


                    resetControls();

                } catch (error) {

                    console.error(
                        "Load selected audio error:",
                        error
                    );

                    if (
                        !cancelled
                    ) {

                        toast.error(
                            error.message ||
                            "Unable to open selected audio."
                        );
                    }

                }

            };


        loadSelectedAudio();


        return () => {

            cancelled = true;


            if (
                audioRef.current
            ) {

                audioRef.current.pause();
            }

        };

    }, [selectedFile]);


    // =====================================================
    // AUDIO METADATA
    // =====================================================

    const handleLoadedMetadata = () => {

        if (
            !audioRef.current
        ) {
            return;
        }

        const audioDuration =
            Number(
                audioRef.current.duration
            );

        if (
            !Number.isFinite(
                audioDuration
            ) ||
            audioDuration <= 0
        ) {
            return;
        }

        setDuration(
            audioDuration
        );

        setTrimStart(
            0
        );

        setTrimEnd(
            audioDuration
        );

        setCutStart(
            0
        );

        setCutEnd(
            audioDuration
        );
    };


    const handleTimeUpdate = () => {

        if (
            !audioRef.current
        ) {
            return;
        }

        setCurrentTime(
            audioRef.current.currentTime
        );
    };


    const handleEnded = () => {

        setPreviewPlaying(
            false
        );
    };


    // =====================================================
    // PLAY / PAUSE
    // =====================================================

    const togglePreview = async() => {

        if (
            !audioRef.current
        ) {
            return;
        }

        try {

            if (
                audioRef.current.paused
            ) {

                await audioRef.current.play();

                setPreviewPlaying(
                    true
                );

            } else {

                audioRef.current.pause();

                setPreviewPlaying(
                    false
                );
            }

        } catch (error) {

            console.error(
                "Audio preview error:",
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
            clamp(
                Number(value),
                0,
                duration
            );

        if (
            audioRef.current
        ) {

            audioRef.current.currentTime =
                nextTime;
        }

        setCurrentTime(
            nextTime
        );
    };


    // =====================================================
    // LOCAL AUDIO
    // =====================================================

    const handleLocalAudio = (
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
                "audio/"
            )
        ) {

            toast.error(
                "Please select an audio file."
            );

            event.target.value =
                "";

            return;
        }

        const localAudio = {

            localFileId:
                "temporary-" +
                Date.now(),

            mongoFileId:
                null,

            userId,

            fileName:
                file.name,

            fileType:
                "audio",

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

        setAudioFiles(
            (currentFiles) => [
                localAudio,
                ...currentFiles
            ]
        );

        setSelectedIndex(
            0
        );

        setSelectedFile(
            localAudio
        );

        toast.success(
            "Audio loaded into editor."
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

                            setProgress(
                                Math.round(
                                    progress * 100
                                )
                            );
                        }
                    }
                );

                ffmpeg.on(
                    "log",
                    ({
                        message
                    }) => {

                        if (
                            message &&
                            (
                                message.toLowerCase().includes("error") ||
                                message.toLowerCase().includes("invalid") ||
                                message.toLowerCase().includes("failed")
                            )
                        ) {

                            console.error(
                                "FFmpeg:",
                                message
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
                "Audio editor engine loaded."
            );

            return true;

        } catch (error) {

            console.error(
                "FFmpeg load error:",
                error
            );

            toast.error(
                "Unable to load audio editor engine."
            );

            return false;

        } finally {

            setLoadingFFmpeg(
                false
            );
        }
    };


    // =====================================================
    // AUDIO FILTERS
    // =====================================================

    const getAudioFilters = (
        includeFade
    ) => {

        const filters = [];

        const tempo =
            getTempoFilter(
                speed
            );

        if (
            tempo !== 1
        ) {

            filters.push(
                `atempo=${tempo}`
            );
        }

        if (
            volume !== 100
        ) {

            filters.push(
                `volume=${volume / 100}`
            );
        }

        if (
            includeFade &&
            fadeIn > 0
        ) {

            filters.push(
                `afade=t=in:st=0:d=${fadeIn}`
            );
        }

        if (
            includeFade &&
            fadeOut > 0
        ) {

            const availableDuration =
                cutEnabled
                    ? duration -
                        (
                            cutEnd -
                            cutStart
                        )
                    : trimEnd -
                        trimStart;

            const safeDuration =
                Math.max(
                    0.1,
                    availableDuration
                );

            const safeFadeOut =
                Math.min(
                    fadeOut,
                    safeDuration
                );

            const fadeStart =
                Math.max(
                    0,
                    safeDuration -
                    safeFadeOut
                );

            filters.push(
                `afade=t=out:st=${fadeStart}:d=${safeFadeOut}`
            );
        }

        return filters.join(
            ","
        );
    };


    // =====================================================
    // PROCESS AUDIO
    // =====================================================

    const processAudio = async(
        action
    ) => {

        if (
            !selectedFile
        ) {

            toast.error(
                "Select an audio file first."
            );

            return null;
        }


        if (
            duration <= 0
        ) {

            toast.error(
                "Audio duration is not ready."
            );

            return null;
        }


        let sourceFile = null;

        try {

            sourceFile =
                await getEditableFileData(
                    selectedFile
                );

        } catch (sourceError) {

            console.error(
                "Audio source load error:",
                sourceError
            );

            toast.error(
                sourceError &&
                sourceError.message
                    ? sourceError.message
                    : "Unable to load selected audio."
            );

            return null;
        }


        if (
            !sourceFile ||
            !(sourceFile instanceof Blob)
        ) {

            toast.error(
                "Selected audio is not available."
            );

            return null;
        }


        const loaded =
            await loadFFmpeg();


        if (
            !loaded
        ) {

            return null;
        }


        const ffmpeg =
            ffmpegRef.current;


        const sourceExtension =
            getInputExtension(
                sourceFile
            );


        const inputName =
            `input_${Date.now()}_${Math.random().toString(36).slice(2)}.${sourceExtension}`;


        const normalizedName =
            `normalized_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`;


        const outputName =
            `output_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`;


        let inputWasWritten =
            false;


        try {

            setProcessing(
                true
            );

            setProgress(
                0
            );


            // =============================================
            // WRITE ORIGINAL SOURCE
            // =============================================

            await ffmpeg.writeFile(
                inputName,
                await fetchFile(
                    sourceFile
                )
            );

            inputWasWritten =
                true;


            // =============================================
            // NORMALIZE TO PCM WAV
            // =============================================
            // Critical for app-recorded WebM/Opus audio.
            // FFmpeg handles the decode instead of relying
            // on browser AudioContext support.
            // =============================================

            let activeInputName =
                inputName;


            if (
                sourceExtension !==
                    "wav"
            ) {

                await ffmpeg.exec(
                    [
                        "-i",
                        inputName,
                        "-map",
                        "0:a:0",
                        "-vn",
                        "-c:a",
                        "pcm_s16le",
                        "-ar",
                        "48000",
                        normalizedName
                    ]
                );

                activeInputName =
                    normalizedName;
            }


            let command = [];


            // =============================================
            // TRIM
            // =============================================

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


                const audioFilters =
                    getAudioFilters(
                        true
                    );


                command = [

                    "-i",
                    activeInputName,

                    "-ss",
                    String(
                        trimStart
                    ),

                    "-t",
                    String(
                        trimDuration
                    ),

                    ...(audioFilters
                        ? [
                            "-af",
                            audioFilters
                        ]
                        : []),

                    "-map",
                    "0:a:0",

                    "-vn",

                    "-c:a",
                    "pcm_s16le",

                    "-ar",
                    "48000",

                    outputName
                ];
            }


            // =============================================
            // CUT
            // =============================================

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


                const filterParts = [];


                filterParts.push(
                    `[0:a]atrim=start=0:end=${firstDuration},asetpts=PTS-STARTPTS[a1]`
                );


                filterParts.push(
                    `[0:a]atrim=start=${secondStart},asetpts=PTS-STARTPTS[a2]`
                );


                filterParts.push(
                    `[a1][a2]concat=n=2:v=0:a=1[joined]`
                );


                const postFilters = [];


                const tempo =
                    getTempoFilter(
                        speed
                    );


                if (
                    tempo !== 1
                ) {

                    postFilters.push(
                        `atempo=${tempo}`
                    );
                }


                if (
                    volume !== 100
                ) {

                    postFilters.push(
                        `volume=${volume / 100}`
                    );
                }


                if (
                    fadeIn > 0
                ) {

                    postFilters.push(
                        `afade=t=in:st=0:d=${fadeIn}`
                    );
                }


                if (
                    fadeOut > 0
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


                    const safeFade =
                        Math.min(
                            fadeOut,
                            keptDuration
                        );


                    const fadeStart =
                        Math.max(
                            0,
                            keptDuration -
                            safeFade
                        );


                    postFilters.push(
                        `afade=t=out:st=${fadeStart}:d=${safeFade}`
                    );
                }


                if (
                    postFilters.length >
                    0
                ) {

                    filterParts.push(
                        `[joined]${postFilters.join(",")}[outa]`
                    );

                } else {

                    filterParts.push(
                        `[joined]anull[outa]`
                    );
                }


                command = [

                    "-i",
                    activeInputName,

                    "-filter_complex",
                    filterParts.join(
                        ";"
                    ),

                    "-map",
                    "[outa]",

                    "-vn",

                    "-c:a",
                    "pcm_s16le",

                    "-ar",
                    "48000",

                    outputName
                ];
            }


            // =============================================
            // ADJUSTMENTS
            // =============================================

            if (
                action === "adjust"
            ) {

                const audioFilters =
                    getAudioFilters(
                        true
                    );


                command = [

                    "-i",
                    activeInputName,

                    ...(audioFilters
                        ? [
                            "-af",
                            audioFilters
                        ]
                        : []),

                    "-map",
                    "0:a:0",

                    "-vn",

                    "-c:a",
                    "pcm_s16le",

                    "-ar",
                    "48000",

                    outputName
                ];
            }


            if (
                command.length === 0
            ) {

                throw new Error(
                    "Invalid audio processing action."
                );
            }


            await ffmpeg.exec(
                command
            );


            const data =
                await ffmpeg.readFile(
                    outputName
                );


            const outputFile =
                new File(
                    [
                        data
                    ],
                    `${getBaseName(selectedFile.fileName)}_edited_${Date.now()}.wav`,
                    {
                        type:
                            "audio/wav"
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
                    ? "Trimmed audio generated."
                    : action === "cut"
                        ? "Selected audio section removed."
                        : "Audio adjustments generated."
            );


            return outputFile;

        } catch (error) {

            console.error(
                "Audio processing error:",
                error
            );

            toast.error(
                error &&
                error.message
                    ? error.message
                    : "Audio processing failed."
            );

            return null;

        } finally {

            if (
                inputWasWritten
            ) {

                try {

                    await ffmpeg.deleteFile(
                        inputName
                    );

                } catch (deleteError) {

                    console.error(
                        "Delete audio input error:",
                        deleteError
                    );
                }
            }


            try {

                await ffmpeg.deleteFile(
                    normalizedName
                );

            } catch (deleteError) {

                console.error(
                    "Delete normalized audio error:",
                    deleteError
                );
            }


            try {

                await ffmpeg.deleteFile(
                    outputName
                );

            } catch (deleteError) {

                console.error(
                    "Delete audio output error:",
                    deleteError
                );
            }


            setProcessing(
                false
            );

            setProgress(
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

        await processAudio(
            "trim"
        );
    };


    // =====================================================
    // CUT
    // =====================================================

    const handleCut = async() => {

        if (
            !cutEnabled
        ) {

            toast.error(
                "Enable Cut Out first."
            );

            return;
        }

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
                "You cannot cut the entire audio."
            );

            return;
        }

        await processAudio(
            "cut"
        );
    };


    // =====================================================
    // APPLY
    // =====================================================

    const handleApplyAdjustments =
        async() => {

            await processAudio(
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
                "Create an edited audio result first."
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

        try {

            setSaving(
                true
            );

            const file =
                editedFile.file;

            const localFileId =
                createLocalFileId();

            await addFile({

                localFileId,

                userId,

                fileName:
                    file.name,

                fileType:
                    "audio",

                mimeType:
                    file.type,

                size:
                    file.size,

                fileData:
                    file,

                categoryId:
                    selectedFile.categoryId ||
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
                    selectedFile.mongoFileId ||
                    null,

                isCopy:
                    false,

                isEdited:
                    true,

                createdAt:
                    new Date(),

                updatedAt:
                    new Date()
            });


            try {

                const response =
                    await createFile({

                        localFileId,

                        fileName:
                            file.name,

                        fileType:
                            "audio",

                        mimeType:
                            file.type,

                        size:
                            file.size,

                        categoryId:
                            selectedFile.categoryId ||
                            null,

                        parentFileId:
                            selectedFile.mongoFileId ||
                            null,

                        isCopy:
                            false,

                        isEdited:
                            true,

                        // ========================================
                        // ACTUAL EDITED AUDIO FILE
                        // ========================================

                        file:
                            file
                    });


                // createFile() normally returns response.data.
                // Keep a fallback for direct data-object returns.
                const mongoFile =
                    response &&
                    response.data
                        ? response.data
                        : response;


                if (
                    mongoFile &&
                    mongoFile._id
                ) {

                    cloudSynced = Boolean(mongoFile.fileUrl);

                    await updateFileByLocalId(
                        localFileId,
                        {
                            mongoFileId:
                                mongoFile._id,

                            // ========================================
                            // CLOUDINARY METADATA
                            // ========================================

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

            } catch (apiError) {

                console.error(
                    "Edited audio sync error:",
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
            }


            if (cloudSynced) {
                toast.success("Edited audio saved as a new copy.");
            } else {
                toast("Saved on this browser only; cloud upload is pending. Keep site data until sync completes.");
            }


            await loadAudioFiles();


            setEditedFile(
                null
            );

        } catch (error) {

            console.error(
                "Save edited audio error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to save edited audio."
            );

        } finally {

            setSaving(
                false
            );
        }
    };


    // =====================================================
    // CLEAR EDITED
    // =====================================================

    const clearEditedResult = () => {

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
    // MUTE PREVIEW
    // =====================================================

    const toggleMutePreview = () => {

        const nextValue =
            !mutedPreview;

        setMutedPreview(
            nextValue
        );

        if (
            audioRef.current
        ) {

            audioRef.current.muted =
                nextValue;
        }
    };


    useEffect(() => {

        if (
            audioRef.current
        ) {

            audioRef.current.muted =
                mutedPreview;
        }

    }, [mutedPreview]);


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
    // NO USER
    // =====================================================

    if (!userId) {

        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">

                <div className="rounded-3xl border border-red-400/20 bg-red-500/5 p-8 text-center">

                    <AudioLines
                        size={44}
                        className="mx-auto text-red-400"
                    />

                    <h1 className="mt-4 text-xl font-semibold text-white">
                        Session not available
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Please login again to use the audio editor.
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="mx-auto max-w-7xl space-y-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">

                        <AudioLines size={14} />

                        Audio Editor

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Edit Your Audio
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Trim, cut, change volume and speed, add fades and save the result as a new audio file.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        loadFFmpeg
                    }
                    disabled={
                        loadingFFmpeg ||
                        processing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
                >

                    {loadingFFmpeg ? (
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                        />
                    ) : (
                        <Waves size={17} />
                    )}

                    {ffmpegLoadedRef.current
                        ? "Editor Ready"
                        : "Load Editor"}

                </button>

            </div>


            {/* SELECT AUDIO */}

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

                        Choose Audio

                    </button>


                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={
                            handleLocalAudio
                        }
                    />


                    <div className="flex min-w-0 flex-1 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                selectAudio(
                                    selectedIndex - 1
                                )
                            }
                            disabled={
                                selectedIndex <= 0 ||
                                audioFiles.length === 0 ||
                                processing
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                        >
                            ‹
                        </button>


                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-white">

                                {selectedFile
                                    ? selectedFile.fileName
                                    : "No audio selected"}

                            </p>

                            <p className="mt-1 text-xs text-slate-500">

                                {audioFiles.length > 0
                                    ? `${selectedIndex + 1} of ${audioFiles.length} audio files`
                                    : "Upload or record audio to start editing"}

                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                selectAudio(
                                    selectedIndex + 1
                                )
                            }
                            disabled={
                                selectedIndex >=
                                    audioFiles.length - 1 ||
                                audioFiles.length === 0 ||
                                processing
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                        >
                            ›
                        </button>

                    </div>

                </div>

            </div>


            {/* LOADING */}

            {loadingFiles ? (

                <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70">

                    <div className="text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                        <p className="mt-4 text-sm text-slate-400">
                            Loading audio files...
                        </p>

                    </div>

                </div>

            ) : !selectedFile ? (

                <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 px-6 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-slate-500">

                        <AudioLines size={38} />

                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-white">
                        No audio files available
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Upload or record an audio file first.
                    </p>

                    <button
                        type="button"
                        onClick={
                            openPicker
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                    >

                        <Upload size={17} />

                        Upload Audio

                    </button>

                </div>

            ) : (

                <div className="space-y-6">

                    {/* MAIN EDITOR */}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">

                        {/* PREVIEW */}

                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

                            <div className="relative flex min-h-[470px] flex-col items-center justify-center bg-slate-950 px-6 py-12">

                                <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-300 shadow-2xl">

                                    <AudioLines
                                        size={58}
                                        strokeWidth={1.4}
                                    />

                                </div>


                                <div className="mt-8 text-center">

                                    <p className="max-w-xl truncate px-4 text-lg font-semibold text-white">
                                        {selectedFile.fileName}
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        {formatTime(
                                            currentTime
                                        )}
                                        {" / "}
                                        {formatTime(
                                            duration
                                        )}
                                    </p>

                                </div>


                                <audio
                                    ref={
                                        audioRef
                                    }
                                    controls
                                    onLoadedMetadata={
                                        handleLoadedMetadata
                                    }
                                    onTimeUpdate={
                                        handleTimeUpdate
                                    }
                                    onEnded={
                                        handleEnded
                                    }
                                    className="mt-8 w-full max-w-2xl"
                                />


                                <div className="mt-5 flex w-full max-w-2xl items-center gap-3">

                                    <button
                                        type="button"
                                        onClick={
                                            togglePreview
                                        }
                                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-slate-950"
                                    >

                                        {previewPlaying ? (
                                            <Pause size={16} />
                                        ) : (
                                            <Play size={16} />
                                        )}

                                        {previewPlaying
                                            ? "Pause"
                                            : "Play"}

                                    </button>


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
                                        className="min-w-0 flex-1"
                                    />


                                    <button
                                        type="button"
                                        onClick={
                                            toggleMutePreview
                                        }
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300"
                                    >

                                        {mutedPreview ? (
                                            <VolumeX size={17} />
                                        ) : (
                                            <Volume2 size={17} />
                                        )}

                                    </button>

                                </div>


                                {processing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">

                                        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-6 text-center">

                                            <LoaderCircle
                                                size={42}
                                                className="mx-auto animate-spin text-white"
                                            />

                                            <h3 className="mt-4 text-base font-semibold text-white">
                                                Processing audio...
                                            </h3>

                                            <p className="mt-2 text-xs text-slate-500">
                                                Processing happens inside your browser.
                                            </p>

                                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

                                                <div
                                                    className="h-full rounded-full bg-white transition-all"
                                                    style={{
                                                        width:
                                                            `${progress}%`
                                                    }}
                                                />

                                            </div>

                                            <p className="mt-2 text-xs font-semibold text-slate-400">
                                                {progress}%
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* TOOLS */}

                        <div className="space-y-4">

                            {/* TRIM */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center gap-2">

                                    <Scissors
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Trim Audio
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
                                                setTrimStart(
                                                    clamp(
                                                        Number(
                                                            event.target.value
                                                        ),
                                                        0,
                                                        Math.max(
                                                            0,
                                                            trimEnd - 0.1
                                                        )
                                                    )
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
                                                setTrimEnd(
                                                    clamp(
                                                        Number(
                                                            event.target.value
                                                        ),
                                                        Math.min(
                                                            duration,
                                                            trimStart + 0.1
                                                        ),
                                                        duration
                                                    )
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

                                        Trim

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
                                                    setCutStart(
                                                        clamp(
                                                            Number(
                                                                event.target.value
                                                            ),
                                                            0,
                                                            Math.max(
                                                                0,
                                                                cutEnd - 0.1
                                                            )
                                                        )
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
                                                    setCutEnd(
                                                        clamp(
                                                            Number(
                                                                event.target.value
                                                            ),
                                                            Math.min(
                                                                duration,
                                                                cutStart + 0.1
                                                            ),
                                                            duration
                                                        )
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

                                            Remove Section

                                        </button>

                                    </div>
                                )}

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


                                <div className="grid grid-cols-3 gap-2">

                                    {[
                                        0.5,
                                        0.75,
                                        1,
                                        1.25,
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


                            {/* FADE */}

                            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                                <div className="mb-4 flex items-center gap-2">

                                    <Sparkles
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Fade In / Out
                                    </h2>

                                </div>


                                <div className="grid grid-cols-2 gap-3">

                                    <label className="text-xs text-slate-500">

                                        Fade In

                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            step="0.5"
                                            value={
                                                fadeIn
                                            }
                                            onChange={(event) =>
                                                setFadeIn(
                                                    clamp(
                                                        Number(
                                                            event.target.value
                                                        ),
                                                        0,
                                                        30
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none"
                                        />

                                    </label>


                                    <label className="text-xs text-slate-500">

                                        Fade Out

                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            step="0.5"
                                            value={
                                                fadeOut
                                            }
                                            onChange={(event) =>
                                                setFadeOut(
                                                    clamp(
                                                        Number(
                                                            event.target.value
                                                        ),
                                                        0,
                                                        30
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none"
                                        />

                                    </label>

                                </div>


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

                                    <Waves size={15} />

                                    Apply Audio Effects

                                </button>

                            </div>


                            {/* RESET */}

                            <button
                                type="button"
                                onClick={
                                    resetControls
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


                    {/* EDITED RESULT */}

                    {editedFile && (

                        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-5 shadow-xl">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-white">

                                        <CheckCircle2
                                            size={18}
                                            className="text-emerald-400"
                                        />

                                        Edited Audio Ready

                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Listen to the edited result before saving it.
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={
                                            clearEditedResult
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
                                    >

                                        <X size={16} />

                                        Discard

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


                            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-5">

                                <audio
                                    src={
                                        editedFile.previewUrl
                                    }
                                    controls
                                    className="w-full"
                                />

                            </div>

                        </div>
                    )}


                    {/* INFO */}

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
                                Keep the part you need or remove a middle section.
                            </p>

                        </div>


                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                            <Volume2
                                size={21}
                                className="text-slate-300"
                            />

                            <h3 className="mt-3 text-sm font-semibold text-white">
                                Audio Control
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Change volume and playback speed with simple controls.
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
                                The original recording remains unchanged and the result becomes a new Gallery file.
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AudioEditor;
