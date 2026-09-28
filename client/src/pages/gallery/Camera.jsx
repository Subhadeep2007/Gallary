import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Camera as CameraIcon,
    CameraOff,
    RotateCcw,
    Video,
    Square,
    Save,
    X,
    RefreshCw,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

import {
    addFile,
    updateFileByLocalId
} from "../../services/storage/db.js";

import {
    createFile
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


const getVideoMimeType = () => {

    const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
    ];

    for (
        let i = 0;
        i < mimeTypes.length;
        i++
    ) {

        if (
            typeof MediaRecorder !== "undefined" &&
            MediaRecorder.isTypeSupported(
                mimeTypes[i]
            )
        ) {
            return mimeTypes[i];
        }
    }

    return "video/webm";
};


const formatTime = (seconds) => {

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
// CAMERA PAGE
// =========================================================

const Camera = () => {

    const {
        user
    } = useAuth();

    const userId =
        getUserId(user);

    const videoRef =
        useRef(null);

    const canvasRef =
        useRef(null);

    const streamRef =
        useRef(null);

    const mediaRecorderRef =
        useRef(null);

    const recordedChunksRef =
        useRef([]);

    const recordedBlobRef =
        useRef(null);

    const previewUrlRef =
        useRef(null);


    const [
        mode,
        setMode
    ] = useState("photo");


    const [
        facingMode,
        setFacingMode
    ] = useState("user");


    const [
        cameraReady,
        setCameraReady
    ] = useState(false);


    const [
        permissionError,
        setPermissionError
    ] = useState("");


    const [
        startingCamera,
        setStartingCamera
    ] = useState(false);


    const [
        capturedPhoto,
        setCapturedPhoto
    ] = useState(null);


    const [
        recordedVideo,
        setRecordedVideo
    ] = useState(null);


    const [
        recording,
        setRecording
    ] = useState(false);


    const [
        recordingTime,
        setRecordingTime
    ] = useState(0);


    const [
        saving,
        setSaving
    ] = useState(false);


    // =====================================================
    // STOP CAMERA STREAM
    // =====================================================

    const stopCamera = () => {

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

            streamRef.current = null;
        }

        if (
            videoRef.current
        ) {
            videoRef.current.srcObject =
                null;
        }

        setCameraReady(false);
    };


    // =====================================================
    // START CAMERA
    // =====================================================

    const startCamera = async(
        selectedMode = mode,
        selectedFacingMode = facingMode
    ) => {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            setPermissionError(
                "Your browser does not support camera access."
            );

            return;
        }


        try {

            setStartingCamera(true);

            setPermissionError("");


            stopCamera();


            const includeAudio =
                selectedMode === "video";


            const stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({
                        video: {
                            facingMode:
                                selectedFacingMode,
                            width: {
                                ideal: 1920
                            },
                            height: {
                                ideal: 1080
                            }
                        },
                        audio:
                            includeAudio
                    });


            streamRef.current =
                stream;


            if (
                videoRef.current
            ) {

                videoRef.current.srcObject =
                    stream;

                await videoRef.current.play();

            }


            setCameraReady(true);

        } catch (error) {

            console.error(
                "Camera access error:",
                error
            );

            let message =
                "Unable to access camera.";


            if (
                error &&
                error.name ===
                    "NotAllowedError"
            ) {
                message =
                    selectedMode === "video"
                        ? "Camera and microphone permission was denied. Please allow both permissions in your browser."
                        : "Camera permission was denied. Please allow camera permission in your browser.";
            }


            if (
                error &&
                error.name ===
                    "NotFoundError"
            ) {
                message =
                    selectedMode === "video"
                        ? "No camera or microphone was found."
                        : "No camera was found.";
            }


            if (
                error &&
                error.name ===
                    "NotReadableError"
            ) {
                message =
                    "Camera is already being used by another application.";
            }


            setPermissionError(
                message
            );

            setCameraReady(false);

        } finally {

            setStartingCamera(false);
        }
    };


    // =====================================================
    // INITIAL CAMERA
    // =====================================================

    useEffect(() => {

        startCamera(
            "photo",
            "user"
        );


        return () => {

            if (
                mediaRecorderRef.current &&
                mediaRecorderRef
                    .current
                    .state !== "inactive"
            ) {
                mediaRecorderRef
                    .current
                    .stop();
            }

            stopCamera();


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
    // MODE CHANGE
    // =====================================================

    const handleModeChange = async(
        newMode
    ) => {

        if (
            recording
        ) {
            return;
        }


        setMode(newMode);

        setCapturedPhoto(null);

        setRecordedVideo(null);

        recordedBlobRef.current =
            null;


        if (
            previewUrlRef.current
        ) {

            URL.revokeObjectURL(
                previewUrlRef.current
            );

            previewUrlRef.current =
                null;
        }


        await startCamera(
            newMode,
            facingMode
        );
    };


    // =====================================================
    // SWITCH CAMERA
    // =====================================================

    const handleSwitchCamera = async() => {

        if (
            recording
        ) {
            return;
        }


        const newFacingMode =
            facingMode === "user"
                ? "environment"
                : "user";


        setFacingMode(
            newFacingMode
        );


        await startCamera(
            mode,
            newFacingMode
        );
    };


    // =====================================================
    // RETRY PERMISSION
    // =====================================================

    const handleRetry = async() => {

        await startCamera(
            mode,
            facingMode
        );
    };


    // =====================================================
    // CAPTURE PHOTO
    // =====================================================

    const handleTakePhoto = () => {

        if (
            !cameraReady ||
            !videoRef.current ||
            !canvasRef.current
        ) {

            toast.error(
                "Camera is not ready yet."
            );

            return;
        }


        const video =
            videoRef.current;

        const canvas =
            canvasRef.current;


        if (
            video.videoWidth === 0 ||
            video.videoHeight === 0
        ) {

            toast.error(
                "Camera frame is not ready."
            );

            return;
        }


        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;


        const context =
            canvas.getContext("2d");


        if (!context) {

            toast.error(
                "Unable to capture photo."
            );

            return;
        }


        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob(
            (blob) => {

                if (!blob) {

                    toast.error(
                        "Unable to create photo."
                    );

                    return;
                }


                const file =
                    new File(
                        [blob],
                        `photo_${Date.now()}.jpg`,
                        {
                            type:
                                "image/jpeg"
                        }
                    );


                if (
                    previewUrlRef.current
                ) {

                    URL.revokeObjectURL(
                        previewUrlRef.current
                    );
                }


                const previewUrl =
                    URL.createObjectURL(
                        file
                    );


                previewUrlRef.current =
                    previewUrl;


                setCapturedPhoto({
                    file,
                    previewUrl
                });


                toast.success(
                    "Photo captured."
                );

            },
            "image/jpeg",
            0.95
        );
    };


    // =====================================================
    // START VIDEO RECORDING
    // =====================================================

    const handleStartRecording = () => {

        if (
            !cameraReady ||
            !streamRef.current
        ) {

            toast.error(
                "Camera is not ready yet."
            );

            return;
        }


        if (
            typeof MediaRecorder ===
            "undefined"
        ) {

            toast.error(
                "Video recording is not supported by your browser."
            );

            return;
        }


        try {

            const mimeType =
                getVideoMimeType();


            const recorder =
                new MediaRecorder(
                    streamRef.current,
                    {
                        mimeType
                    }
                );


            recordedChunksRef.current =
                [];


            recorder.ondataavailable =
                (event) => {

                    if (
                        event.data &&
                        event.data.size > 0
                    ) {

                        recordedChunksRef
                            .current
                            .push(
                                event.data
                            );
                    }
                };


            recorder.onstop = () => {

                const blob =
                    new Blob(
                        recordedChunksRef.current,
                        {
                            type:
                                mimeType
                        }
                    );


                const file =
                    new File(
                        [blob],
                        `video_${Date.now()}.webm`,
                        {
                            type:
                                mimeType
                        }
                    );


                recordedBlobRef.current =
                    file;


                if (
                    previewUrlRef.current
                ) {

                    URL.revokeObjectURL(
                        previewUrlRef.current
                    );
                }


                const previewUrl =
                    URL.createObjectURL(
                        file
                    );


                previewUrlRef.current =
                    previewUrl;


                setRecordedVideo({
                    file,
                    previewUrl
                });


                setRecordingTime(0);


                toast.success(
                    "Video recording completed."
                );
            };


            recorder.onerror =
                (event) => {

                    console.error(
                        "Video recorder error:",
                        event
                    );

                    toast.error(
                        "Video recording failed."
                    );

                    setRecording(false);

                    setRecordingTime(0);
                };


            recorder.start(200);

            mediaRecorderRef.current =
                recorder;

            setRecording(true);

            setRecordingTime(0);

        } catch (error) {

            console.error(
                "Start recording error:",
                error
            );

            toast.error(
                "Unable to start video recording."
            );
        }
    };


    // =====================================================
    // STOP VIDEO RECORDING
    // =====================================================

    const handleStopRecording = () => {

        const recorder =
            mediaRecorderRef.current;


        if (!recorder) {
            return;
        }


        if (
            recorder.state !==
            "inactive"
        ) {

            recorder.stop();
        }


        mediaRecorderRef.current =
            null;


        setRecording(false);
    };


    // =====================================================
    // RECORDING TIMER
    // =====================================================

    useEffect(() => {

        if (!recording) {
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

    }, [recording]);


    // =====================================================
    // SAVE FILE TO GALLERY
    // =====================================================

    const saveToGallery = async(
        file,
        fileType
    ) => {

        if (!file) {

            toast.error(
                "No file available to save."
            );

            return;
        }


        if (!userId) {

            toast.error(
                "Please login again."
            );

            return;
        }


        try {

            setSaving(true);


            const localFileId =
                createLocalFileId();


            await addFile({

                localFileId,

                userId,

                fileName:
                    file.name,

                fileType,

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

                        fileType,

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
            }


            toast.success(
                fileType === "image"
                    ? "Photo saved to Gallery."
                    : "Video saved to Gallery."
            );


            if (
                fileType === "image"
            ) {

                setCapturedPhoto(
                    null
                );

            } else {

                setRecordedVideo(
                    null
                );
            }


            if (
                previewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    previewUrlRef.current
                );

                previewUrlRef.current =
                    null;
            }


            recordedBlobRef.current =
                null;

        } catch (error) {

            console.error(
                "Save media error:",
                error
            );

            toast.error(
                error.message ||
                "Unable to save media."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // RETAKE / DISCARD PHOTO
    // =====================================================

    const handleRetakePhoto = () => {

        setCapturedPhoto(
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


        startCamera(
            "photo",
            facingMode
        );
    };


    // =====================================================
    // DISCARD VIDEO
    // =====================================================

    const handleDiscardVideo = () => {

        setRecordedVideo(
            null
        );


        recordedBlobRef.current =
            null;


        if (
            previewUrlRef.current
        ) {

            URL.revokeObjectURL(
                previewUrlRef.current
            );

            previewUrlRef.current =
                null;
        }


        startCamera(
            "video",
            facingMode
        );
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
                        Please login again to use the camera.
                    </p>

                </div>

            </div>
        );
    }


    return (
        <div className="mx-auto max-w-6xl space-y-6">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">

                        <CameraIcon size={14} />

                        Camera

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Capture Media
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Take photos or record videos directly from your device camera.
                    </p>

                </div>

            </div>


            {/* =====================================================
                MODE TABS
            ===================================================== */}

            <div className="flex w-fit rounded-2xl border border-white/10 bg-slate-900/70 p-1">

                <button
                    type="button"
                    onClick={() => handleModeChange("photo")}
                    disabled={recording || startingCamera}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        mode === "photo"
                            ? "bg-white text-slate-950"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                    <CameraIcon size={18} />
                    Photo
                </button>


                <button
                    type="button"
                    onClick={() => handleModeChange("video")}
                    disabled={recording || startingCamera}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                        mode === "video"
                            ? "bg-white text-slate-950"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                    <Video size={18} />
                    Video
                </button>

            </div>


            {/* =====================================================
                CAMERA AREA
            ===================================================== */}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">

                <div className="relative aspect-video w-full overflow-hidden">

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full object-cover scale-x-0[-1]"
                    />


                    {/* TOP STATUS */}

                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between">

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs font-medium text-white backdrop-blur">

                            <span
                                className={`h-2 w-2 rounded-full ${
                                    cameraReady
                                        ? "bg-emerald-400"
                                        : "bg-red-400"
                                }`}
                            />

                            {cameraReady
                                ? "Camera Ready"
                                : "Camera Offline"}

                        </div>


                        {recording && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 backdrop-blur">

                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

                                REC {formatTime(recordingTime)}

                            </div>
                        )}

                    </div>


                    {/* CAMERA SWITCH */}

                    <button
                        type="button"
                        onClick={handleSwitchCamera}
                        disabled={
                            !cameraReady ||
                            recording ||
                            startingCamera
                        }
                        className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Switch camera"
                    >
                        <RefreshCw size={19} />
                    </button>


                    {/* CAMERA ERROR */}

                    {permissionError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">

                            <div className="max-w-md rounded-2xl border border-white/10 bg-slate-950/95 p-6 text-center shadow-2xl">

                                <CameraOff
                                    className="mx-auto text-red-400"
                                    size={42}
                                />

                                <h2 className="mt-4 text-lg font-semibold text-white">
                                    Camera Access Required
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {permissionError}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleRetry}
                                    disabled={startingCamera}
                                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                                >
                                    <RefreshCw size={17} />
                                    {startingCamera
                                        ? "Requesting..."
                                        : "Try Again"}
                                </button>

                            </div>

                        </div>
                    )}


                    {/* STARTING */}

                    {!permissionError &&
                        startingCamera && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">

                                <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-6 py-5 text-center backdrop-blur">

                                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                                    <p className="mt-3 text-sm text-slate-300">
                                        Starting camera...
                                    </p>

                                </div>

                            </div>
                        )}

                </div>


                {/* HIDDEN CANVAS */}

                <canvas
                    ref={canvasRef}
                    className="hidden"
                />


                {/* =================================================
                    CONTROLS
                ================================================= */}

                <div className="flex flex-col gap-4 border-t border-white/10 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-center">

                    {mode === "photo" ? (

                        <button
                            type="button"
                            onClick={handleTakePhoto}
                            disabled={
                                !cameraReady ||
                                startingCamera
                            }
                            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            <CameraIcon size={21} />

                            Take Photo

                        </button>

                    ) : (

                        !recording ? (

                            <button
                                type="button"
                                onClick={handleStartRecording}
                                disabled={
                                    !cameraReady ||
                                    startingCamera
                                }
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-red-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >

                                <Video size={21} />

                                Start Recording

                            </button>

                        ) : (

                            <button
                                type="button"
                                onClick={handleStopRecording}
                                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
                            >

                                <Square
                                    size={19}
                                    fill="currentColor"
                                />

                                Stop Recording

                            </button>

                        )

                    )}

                </div>

            </div>


            {/* =====================================================
                CAPTURED PHOTO
            ===================================================== */}

            {capturedPhoto && (
                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-white">

                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-400"
                                />

                                Photo Captured

                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Review the photo before saving it to Gallery.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={handleRetakePhoto}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                <RotateCcw size={16} />
                                Retake
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    saveToGallery(
                                        capturedPhoto.file,
                                        "image"
                                    )
                                }
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving
                                    ? "Saving..."
                                    : "Save to Gallery"}
                            </button>

                        </div>

                    </div>


                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">

                        <img
                            src={capturedPhoto.previewUrl}
                            alt="Captured preview"
                            className="max-h-[70vh] w-full object-contain"
                        />

                    </div>

                </div>
            )}


            {/* =====================================================
                RECORDED VIDEO
            ===================================================== */}

            {recordedVideo && (
                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-white">

                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-400"
                                />

                                Video Recorded

                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Review the recording before saving it to Gallery.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={handleDiscardVideo}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                <X size={16} />
                                Discard
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    saveToGallery(
                                        recordedVideo.file,
                                        "video"
                                    )
                                }
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving
                                    ? "Saving..."
                                    : "Save to Gallery"}
                            </button>

                        </div>

                    </div>


                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">

                        <video
                            src={recordedVideo.previewUrl}
                            controls
                            playsInline
                            className="max-h-[70vh] w-full bg-black"
                        />

                    </div>

                </div>
            )}


            {/* =====================================================
                INFO
            ===================================================== */}

            <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <CameraIcon
                        className="text-slate-300"
                        size={21}
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Camera Access
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Uses your browser camera permission for live preview and photo capture.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Video
                        className="text-slate-300"
                        size={21}
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Video Recording
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Video mode requests camera and microphone access so recordings can include audio.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Save
                        className="text-slate-300"
                        size={21}
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Local Storage
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Captured media is saved to IndexedDB first and then its metadata is synced with MongoDB.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Camera;
