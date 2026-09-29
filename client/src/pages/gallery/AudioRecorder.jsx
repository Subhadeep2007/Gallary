import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Mic,
    MicOff,
    Pause,
    Play,
    Square,
    Save,
    Trash2,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

import {
    addFile,
    getFileByLocalId,
    updateFileByLocalId
} from "../../services/storage/db.js";

import {
    createFile
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


const getAudioMimeType = () => {

    if (
        typeof MediaRecorder ===
        "undefined"
    ) {
        return "audio/webm";
    }

    const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4"
    ];

    for (
        let i = 0;
        i < mimeTypes.length;
        i++
    ) {

        if (
            MediaRecorder.isTypeSupported(
                mimeTypes[i]
            )
        ) {
            return mimeTypes[i];
        }
    }

    return "audio/webm";
};


const getExtensionFromMimeType = (
    mimeType
) => {

    if (
        mimeType.includes("ogg")
    ) {
        return "ogg";
    }

    if (
        mimeType.includes("mp4")
    ) {
        return "m4a";
    }

    return "webm";
};


const formatTime = (
    seconds
) => {

    const safeSeconds =
        Number.isFinite(seconds)
            ? Math.max(0, seconds)
            : 0;

    const minutes =
        Math.floor(
            safeSeconds / 60
        );

    const remainingSeconds =
        safeSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
};


// =========================================================
// AUDIO RECORDER
// =========================================================

const AudioRecorder = () => {

    const {
        user
    } = useAuth();


    const userId =
        getUserId(user);


    const streamRef =
        useRef(null);


    const mediaRecorderRef =
        useRef(null);


    const chunksRef =
        useRef([]);


    const previewUrlRef =
        useRef(null);


    const recordedFileRef =
        useRef(null);


    const [
        microphoneReady,
        setMicrophoneReady
    ] = useState(false);


    const [
        permissionError,
        setPermissionError
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        recording,
        setRecording
    ] = useState(false);


    const [
        paused,
        setPaused
    ] = useState(false);


    const [
        recordingTime,
        setRecordingTime
    ] = useState(0);


    const [
        recordedAudio,
        setRecordedAudio
    ] = useState(null);


    const [
        saving,
        setSaving
    ] = useState(false);


    // =====================================================
    // STOP MICROPHONE
    // =====================================================

    const stopMicrophone = () => {

        if (
            streamRef.current
        ) {

            const tracks =
                streamRef
                    .current
                    .getTracks();

            tracks.forEach(
                (track) => {
                    track.stop();
                }
            );

            streamRef.current =
                null;
        }


        setMicrophoneReady(
            false
        );
    };


    // =====================================================
    // START MICROPHONE
    // =====================================================

    const startMicrophone = async() => {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            setPermissionError(
                "Your browser does not support microphone access."
            );

            return;
        }


        try {

            setLoading(true);

            setPermissionError("");


            stopMicrophone();


            const stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });


            streamRef.current =
                stream;


            setMicrophoneReady(
                true
            );

        } catch (error) {

            console.error(
                "Microphone access error:",
                error
            );


            let message =
                "Unable to access microphone.";


            if (
                error &&
                error.name ===
                    "NotAllowedError"
            ) {

                message =
                    "Microphone permission was denied. Please allow microphone access in your browser.";
            }


            if (
                error &&
                error.name ===
                    "NotFoundError"
            ) {

                message =
                    "No microphone was found on this device.";
            }


            if (
                error &&
                error.name ===
                    "NotReadableError"
            ) {

                message =
                    "Microphone is already being used by another application.";
            }


            setPermissionError(
                message
            );


            setMicrophoneReady(
                false
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL MICROPHONE
    // =====================================================

    useEffect(() => {

        startMicrophone();


        return () => {

            const recorder =
                mediaRecorderRef.current;


            if (
                recorder &&
                recorder.state !==
                    "inactive"
            ) {

                recorder.ondataavailable =
                    null;

                recorder.onstop =
                    null;

                recorder.stop();
            }


            stopMicrophone();


            if (
                previewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    previewUrlRef.current
                );

                previewUrlRef.current =
                    null;
            }

        };

    }, []);


    // =====================================================
    // START RECORDING
    // =====================================================

    const handleStartRecording = () => {

        if (
            !microphoneReady ||
            !streamRef.current
        ) {

            toast.error(
                "Microphone is not ready yet."
            );

            return;
        }


        if (
            typeof MediaRecorder ===
            "undefined"
        ) {

            toast.error(
                "Audio recording is not supported by your browser."
            );

            return;
        }


        try {

            const mimeType =
                getAudioMimeType();


            const recorder =
                new MediaRecorder(
                    streamRef.current,
                    {
                        mimeType
                    }
                );


            chunksRef.current =
                [];


            recordedFileRef.current =
                null;


            setRecordedAudio(
                null
            );


            if (
                previewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    previewUrlRef.current
                );

                previewUrlRef.current =
                    null;
            }


            recorder.ondataavailable =
                (event) => {

                    if (
                        event.data &&
                        event.data.size > 0
                    ) {

                        chunksRef.current.push(
                            event.data
                        );
                    }
                };


            recorder.onstop = () => {

                const blob =
                    new Blob(
                        chunksRef.current,
                        {
                            type:
                                mimeType
                        }
                    );


                const extension =
                    getExtensionFromMimeType(
                        mimeType
                    );


                const cleanMimeType =
                    String(
                        mimeType || "audio/webm"
                    )
                        .toLowerCase()
                        .split(";")[0];

                const file =
                    new File(
                        [blob],
                        `audio_${Date.now()}.${extension}`,
                        {
                            type:
                                cleanMimeType
                        }
                    );


                recordedFileRef.current =
                    file;


                const previewUrl =
                    URL.createObjectURL(
                        file
                    );


                previewUrlRef.current =
                    previewUrl;


                setRecordedAudio({
                    file,
                    previewUrl
                });


                setRecording(
                    false
                );


                setPaused(
                    false
                );


                setRecordingTime(
                    0
                );


                toast.success(
                    "Audio recording completed."
                );
            };


            recorder.onerror =
                (event) => {

                    console.error(
                        "Audio recorder error:",
                        event
                    );


                    toast.error(
                        "Audio recording failed."
                    );


                    setRecording(
                        false
                    );


                    setPaused(
                        false
                    );


                    setRecordingTime(
                        0
                    );
                };


            recorder.start(200);


            mediaRecorderRef.current =
                recorder;


            setRecording(
                true
            );


            setPaused(
                false
            );


            setRecordingTime(
                0
            );

        } catch (error) {

            console.error(
                "Start audio recording error:",
                error
            );


            toast.error(
                "Unable to start audio recording."
            );
        }
    };


    // =====================================================
    // PAUSE
    // =====================================================

    const handlePause = () => {

        const recorder =
            mediaRecorderRef.current;


        if (
            !recorder ||
            recorder.state !==
                "recording"
        ) {

            return;
        }


        try {

            recorder.pause();


            setPaused(
                true
            );

        } catch (error) {

            console.error(
                "Pause error:",
                error
            );


            toast.error(
                "Unable to pause recording."
            );
        }
    };


    // =====================================================
    // RESUME
    // =====================================================

    const handleResume = () => {

        const recorder =
            mediaRecorderRef.current;


        if (
            !recorder ||
            recorder.state !==
                "paused"
        ) {

            return;
        }


        try {

            recorder.resume();


            setPaused(
                false
            );

        } catch (error) {

            console.error(
                "Resume error:",
                error
            );


            toast.error(
                "Unable to resume recording."
            );
        }
    };


    // =====================================================
    // STOP
    // =====================================================

    const handleStop = () => {

        const recorder =
            mediaRecorderRef.current;


        if (!recorder) {
            return;
        }


        try {

            if (
                recorder.state !==
                    "inactive"
            ) {

                recorder.stop();
            }


            mediaRecorderRef.current =
                null;


            setRecording(
                false
            );


            setPaused(
                false
            );

        } catch (error) {

            console.error(
                "Stop recording error:",
                error
            );


            toast.error(
                "Unable to stop recording."
            );
        }
    };


    // =====================================================
    // TIMER
    // =====================================================

    useEffect(() => {

        if (
            !recording ||
            paused
        ) {

            return;
        }


        const timer =
            window.setInterval(() => {

                setRecordingTime(
                    (currentTime) =>
                        currentTime + 1
                );

            }, 1000);


        return () => {

            window.clearInterval(
                timer
            );
        };

    }, [
        recording,
        paused
    ]);


    // =====================================================
    // SAVE TO GALLERY
    // =====================================================

    const saveToGallery = async() => {

        const file =
            recordedFileRef.current;


        if (!file) {

            toast.error(
                "No audio recording available."
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

            setSaving(true);


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
                            null,

                        parentFileId:
                            null,

                        isCopy:
                            false,

                        isEdited:
                            false,

                        // ========================================
                        // CLOUDINARY FILE
                        // ========================================
                        // Existing metadata remains unchanged.
                        // The actual recorded File is additionally
                        // sent to the frontend file service.
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
                    "Audio metadata sync error:",
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


            if (!cloudSynced) {
                // Retry once before clearing the recorder UI; otherwise a
                // transient request failure leaves this recording local-only.
                try {
                    await syncPendingFiles(userId);
                    const savedFile = await getFileByLocalId(localFileId);
                    cloudSynced = Boolean(savedFile?.mongoFileId && savedFile?.fileUrl);
                } catch (syncError) {
                    console.error("Immediate audio sync retry failed:", syncError);
                }
            }


            if (cloudSynced) {
                toast.success("Audio saved to Gallery.");
            } else {
                toast("Saved on this browser only; cloud upload is pending. Keep site data until sync completes.");
            }


            clearRecording();


        } catch (error) {

            console.error(
                "Save audio error:",
                error
            );


            toast.error(
                error.message ||
                "Unable to save audio."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // CLEAR RECORDING
    // =====================================================

    const clearRecording = () => {

        setRecordedAudio(
            null
        );


        recordedFileRef.current =
            null;


        chunksRef.current =
            [];


        setRecordingTime(
            0
        );


        if (
            previewUrlRef.current
        ) {

            URL.revokeObjectURL(
                previewUrlRef.current
            );


            previewUrlRef.current =
                null;
        }
    };


    // =====================================================
    // DISCARD
    // =====================================================

    const handleDiscard = () => {

        if (
            recording
        ) {

            return;
        }


        clearRecording();


        toast.success(
            "Recording discarded."
        );


        startMicrophone();
    };


    // =====================================================
    // RETRY
    // =====================================================

    const handleRetry = async() => {

        await startMicrophone();
    };


    // =====================================================
    // NO USER
    // =====================================================

    if (!userId) {

        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">

                <div className="max-w-md rounded-3xl border border-red-400/20 bg-red-500/5 p-8 text-center">

                    <AlertCircle
                        className="mx-auto text-red-400"
                        size={42}
                    />

                    <h1 className="mt-4 text-xl font-semibold text-white">
                        Session not available
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Please login again to use the audio recorder.
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="mx-auto max-w-5xl space-y-6">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div>

                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">

                    <Mic size={14} />

                    Audio Recorder

                </div>


                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Record Audio
                </h1>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    Record voice directly from your device microphone and save the recording to your Gallery.
                </p>

            </div>


            {/* =====================================================
                RECORDER PANEL
            ===================================================== */}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl">

                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">

                    <div className={`flex h-28 w-28 items-center justify-center rounded-full border ${
                        recording
                            ? "border-red-400/40 bg-red-500/10"
                            : "border-white/10 bg-slate-950"
                    }`}>

                        {microphoneReady ? (

                            <Mic
                                size={48}
                                className={
                                    recording
                                        ? "animate-pulse text-red-400"
                                        : "text-slate-300"
                                }
                                strokeWidth={1.5}
                            />

                        ) : (

                            <MicOff
                                size={48}
                                className="text-slate-600"
                                strokeWidth={1.5}
                            />

                        )}

                    </div>


                    <div className="mt-7">

                        <div className="text-5xl font-bold tracking-wider text-white">
                            {formatTime(
                                recordingTime
                            )}
                        </div>


                        <div className="mt-3 text-sm text-slate-500">

                            {recording
                                ? paused
                                    ? "Recording paused"
                                    : "Recording in progress"
                                : microphoneReady
                                    ? "Microphone ready"
                                    : "Microphone unavailable"}

                        </div>

                    </div>


                    {/* STATUS */}

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-xs font-medium">

                        <span
                            className={`h-2 w-2 rounded-full ${
                                microphoneReady
                                    ? "bg-emerald-400"
                                    : "bg-red-400"
                            }`}
                        />

                        <span className="text-slate-300">

                            {microphoneReady
                                ? "Microphone Ready"
                                : "Microphone Offline"}

                        </span>

                    </div>


                    {/* CONTROLS */}

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">

                        {!recording && (

                            <button
                                type="button"
                                onClick={handleStartRecording}
                                disabled={
                                    !microphoneReady ||
                                    loading
                                }
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Mic size={19} />

                                Start Recording

                            </button>
                        )}


                        {recording && (

                            <>

                                <button
                                    type="button"
                                    onClick={
                                        paused
                                            ? handleResume
                                            : handlePause
                                    }
                                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                                >

                                    {paused ? (

                                        <Play
                                            size={18}
                                        />

                                    ) : (

                                        <Pause
                                            size={18}
                                        />

                                    )}

                                    {paused
                                        ? "Resume"
                                        : "Pause"}

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleStop
                                    }
                                    className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-400"
                                >

                                    <Square
                                        size={18}
                                        fill="currentColor"
                                    />

                                    Stop

                                </button>

                            </>
                        )}

                    </div>

                </div>


                {/* =================================================
                    PERMISSION ERROR
                ================================================= */}

                {permissionError && (

                    <div className="border-t border-white/10 bg-red-500/5 px-5 py-5">

                        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center sm:flex-row sm:text-left">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10">

                                <MicOff
                                    size={23}
                                    className="text-red-400"
                                />

                            </div>


                            <div className="flex-1">

                                <p className="text-sm font-semibold text-white">
                                    Microphone Access Required
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    {permissionError}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleRetry
                                }
                                disabled={
                                    loading ||
                                    recording
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                            >

                                <RefreshCw
                                    size={16}
                                />

                                Retry

                            </button>

                        </div>

                    </div>
                )}

            </div>


            {/* =====================================================
                RECORDED AUDIO
            ===================================================== */}

            {recordedAudio && (

                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-white">

                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-400"
                                />

                                Recording Ready

                            </div>


                            <p className="mt-1 text-xs text-slate-500">
                                Listen to your recording before saving it.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={
                                    handleDiscard
                                }
                                disabled={
                                    saving
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >

                                <Trash2
                                    size={16}
                                />

                                Discard

                            </button>


                            <button
                                type="button"
                                onClick={
                                    saveToGallery
                                }
                                disabled={
                                    saving
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                            >

                                <Save
                                    size={16}
                                />

                                {saving
                                    ? "Saving..."
                                    : "Save to Gallery"}

                            </button>

                        </div>

                    </div>


                    <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-5">

                        <audio
                            src={
                                recordedAudio.previewUrl
                            }
                            controls
                            className="w-full"
                        />

                    </div>

                </div>
            )}


            {/* =====================================================
                FEATURES
            ===================================================== */}

            <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Mic
                        size={21}
                        className="text-slate-300"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Microphone Access
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Uses your browser microphone permission for recording.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Pause
                        size={21}
                        className="text-slate-300"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Pause & Resume
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Pause your recording and continue it without creating another file.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Save
                        size={21}
                        className="text-slate-300"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Gallery Storage
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Audio is stored in IndexedDB, uploaded to shared cloud storage, and its metadata is kept in MongoDB.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default AudioRecorder;
