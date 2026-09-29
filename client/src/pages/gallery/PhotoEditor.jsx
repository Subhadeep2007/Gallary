import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Image as ImageIcon,
    Upload,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    Sun,
    Contrast,
    Droplets,
    Scan,
    Sparkles,
    Type,
    Crop,
    Save,
    RotateCcw,
    X,
    Check,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut
} from "lucide-react";

import toast from "react-hot-toast";

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
                "Unable to download cloud image."
            );
        }


        const blob =
            await response.blob();


        return new File(
            [
                blob
            ],
            file.fileName ||
                "image",
            {
                type:
                    file.mimeType ||
                    blob.type ||
                    "image/jpeg"
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
            fileName || "photo"
        );

    const lastDot =
        value.lastIndexOf(".");

    if (
        lastDot <= 0
    ) {
        return value;
    }

    return value.slice(
        0,
        lastDot
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
// PHOTO EDITOR
// =========================================================

const PhotoEditor = () => {

    const {
        user
    } = useAuth();


    const userId =
        getUserId(user);


    const canvasRef =
        useRef(null);


    const imageRef =
        useRef(null);


    const fileInputRef =
        useRef(null);


    const previewUrlRef =
        useRef(null);


    const originalImageRef =
        useRef(null);


    const [
        imageFiles,
        setImageFiles
    ] = useState([]);


    const [
        selectedFile,
        setSelectedFile
    ] = useState(null);


    const [
        loadingFiles,
        setLoadingFiles
    ] = useState(true);


    const [
        selectedIndex,
        setSelectedIndex
    ] = useState(0);


    const [
        uploading,
        setUploading
    ] = useState(false);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        brightness,
        setBrightness
    ] = useState(100);


    const [
        contrast,
        setContrast
    ] = useState(100);


    const [
        saturation,
        setSaturation
    ] = useState(100);


    const [
        blur,
        setBlur
    ] = useState(0);


    const [
        grayscale,
        setGrayscale
    ] = useState(0);


    const [
        rotation,
        setRotation
    ] = useState(0);


    const [
        flipX,
        setFlipX
    ] = useState(false);


    const [
        flipY,
        setFlipY
    ] = useState(false);


    const [
        zoom,
        setZoom
    ] = useState(1);


    const [
        filter,
        setFilter
    ] = useState("none");


    const [
        cropX,
        setCropX
    ] = useState(0);


    const [
        cropY,
        setCropY
    ] = useState(0);


    const [
        cropWidth,
        setCropWidth
    ] = useState(100);


    const [
        cropHeight,
        setCropHeight
    ] = useState(100);


    const [
        cropEnabled,
        setCropEnabled
    ] = useState(false);


    const [
        text,
        setText
    ] = useState("");


    const [
        textX,
        setTextX
    ] = useState(50);


    const [
        textY,
        setTextY
    ] = useState(50);


    const [
        textSize,
        setTextSize
    ] = useState(40);


    const [
        textColor,
        setTextColor
    ] = useState("#ffffff");


    const [
        history,
        setHistory
    ] = useState([]);


    const [
        historyIndex,
        setHistoryIndex
    ] = useState(-1);


    // =====================================================
    // OPEN FILE PICKER
    // =====================================================

    const openPicker = () => {

        if (
            fileInputRef.current
        ) {

            fileInputRef.current.click();
        }
    };


    // =====================================================
    // RESET EDITS
    // =====================================================

    const getInitialState = () => {

        return {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
            rotation: 0,
            flipX: false,
            flipY: false,
            zoom: 1,
            filter: "none",
            cropX: 0,
            cropY: 0,
            cropWidth: 100,
            cropHeight: 100,
            cropEnabled: false,
            text: "",
            textX: 50,
            textY: 50,
            textSize: 40,
            textColor: "#ffffff"
        };
    };


    const saveHistory = () => {

        const state = {
            brightness,
            contrast,
            saturation,
            blur,
            grayscale,
            rotation,
            flipX,
            flipY,
            zoom,
            filter,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            cropEnabled,
            text,
            textX,
            textY,
            textSize,
            textColor
        };


        const nextHistory =
            history.slice(
                0,
                historyIndex + 1
            );


        nextHistory.push(
            state
        );


        if (
            nextHistory.length > 20
        ) {

            nextHistory.shift();
        }


        setHistory(
            nextHistory
        );


        setHistoryIndex(
            nextHistory.length - 1
        );
    };


    // =====================================================
    // LOAD IMAGE FILES
    // =====================================================

    const loadImageFiles = async() => {

        if (!userId) {

            setImageFiles([]);

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


            const localImages =
                Array.isArray(
                    localFiles
                )
                    ? localFiles.filter(
                        (file) => {
                            return (
                                file.fileType ===
                                    "image" &&
                                file.isDeleted !== true
                            );
                        }
                    )
                    : [];


            let cloudImages = [];


            try {

                const cloudResponse =
                    await getFiles({
                        fileType:
                            "image"
                    });


                const cloudFiles =
                    normalizeFilesResponse(
                        cloudResponse
                    );


                cloudImages =
                    Array.isArray(
                        cloudFiles
                    )
                        ? cloudFiles.filter(
                            (file) => {
                                return (
                                    (
                                        file.fileType ===
                                            "image" ||
                                        file.type ===
                                            "image"
                                    ) &&
                                    file.isDeleted !== true
                                );
                            }
                        )
                        : [];

            } catch (cloudError) {

                console.error(
                    "Load cloud images error:",
                    cloudError
                );
            }


            const mergedImages =
                [...localImages];


            cloudImages.forEach(
                (cloudFile) => {

                    const cloudId =
                        cloudFile._id ||
                        cloudFile.id ||
                        cloudFile.mongoFileId ||
                        null;


                    const existingIndex =
                        mergedImages.findIndex(
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
                            "image",

                        mimeType:
                            cloudFile.mimeType ||
                            "image/jpeg",

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
                            mergedImages[
                                existingIndex
                            ];


                        mergedImages[
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

                        mergedImages.push(
                            normalizedCloudFile
                        );
                    }
                }
            );


            setImageFiles(
                mergedImages
            );


            if (
                mergedImages.length > 0
            ) {

                setSelectedIndex(
                    0
                );

                setSelectedFile(
                    mergedImages[0]
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
                "Load editor files error:",
                error
            );

            setImageFiles([]);

            setSelectedFile(null);

            toast.error(
                "Unable to load your photos."
            );

        } finally {

            setLoadingFiles(false);
        }
    };


    useEffect(() => {

        loadImageFiles();

    }, [userId]);


    // =====================================================
    // LOAD SELECTED IMAGE
    // =====================================================

    useEffect(() => {

        if (!selectedFile) {

            imageRef.current =
                null;

            return;
        }


        let cancelled = false;

        let previewUrl =
            null;


        const loadSelectedImage =
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
                            "Selected image is not available."
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
                            "Unable to create image preview."
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


                    const loadedImage =
                        new Image();


                    loadedImage.onload =
                        () => {

                            if (
                                cancelled
                            ) {

                                return;
                            }


                            imageRef.current =
                                loadedImage;


                            resetEditor(
                                false
                            );

                            drawCanvas();
                        };


                    loadedImage.onerror =
                        () => {

                            if (
                                !cancelled
                            ) {

                                toast.error(
                                    "Unable to open selected image."
                                );
                            }
                        };


                    loadedImage.src =
                        previewUrl;


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


                        setImageFiles(
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

                } catch (error) {

                    console.error(
                        "Load selected image error:",
                        error
                    );

                    if (
                        !cancelled
                    ) {

                        toast.error(
                            error.message ||
                            "Unable to open selected image."
                        );
                    }

                }

            };


        loadSelectedImage();


        return () => {

            cancelled = true;

        };

    }, [selectedFile]);


    // =====================================================
    // DRAW EDITED IMAGE
    // =====================================================

    const drawCanvas = () => {

        const canvas =
            canvasRef.current;

        const image =
            imageRef.current;


        if (
            !canvas ||
            !image
        ) {
            return;
        }


        const sourceWidth =
            image.naturalWidth ||
            image.width;


        const sourceHeight =
            image.naturalHeight ||
            image.height;


        if (
            sourceWidth <= 0 ||
            sourceHeight <= 0
        ) {
            return;
        }


        const cropLeft =
            cropEnabled
                ? sourceWidth *
                    (cropX / 100)
                : 0;


        const cropTop =
            cropEnabled
                ? sourceHeight *
                    (cropY / 100)
                : 0;


        const cropSourceWidth =
            cropEnabled
                ? sourceWidth *
                    (cropWidth / 100)
                : sourceWidth;


        const cropSourceHeight =
            cropEnabled
                ? sourceHeight *
                    (cropHeight / 100)
                : sourceHeight;


        const safeCropWidth =
            clamp(
                cropSourceWidth,
                1,
                sourceWidth - cropLeft
            );


        const safeCropHeight =
            clamp(
                cropSourceHeight,
                1,
                sourceHeight - cropTop
            );


        const quarterTurns =
            (
                Math.round(
                    rotation / 90
                ) % 4 + 4
            ) % 4;


        const rotatedWidth =
            quarterTurns % 2 === 0
                ? safeCropWidth
                : safeCropHeight;


        const rotatedHeight =
            quarterTurns % 2 === 0
                ? safeCropHeight
                : safeCropWidth;


        const outputWidth =
            Math.max(
                1,
                Math.round(
                    rotatedWidth *
                    zoom
                )
            );


        const outputHeight =
            Math.max(
                1,
                Math.round(
                    rotatedHeight *
                    zoom
                )
            );


        canvas.width =
            outputWidth;

        canvas.height =
            outputHeight;


        const context =
            canvas.getContext(
                "2d"
            );


        if (!context) {
            return;
        }


        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        let filterValue =
            `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%)`;


        if (
            filter === "vintage"
        ) {
            filterValue +=
                " sepia(25%)";
        }


        if (
            filter === "warm"
        ) {
            filterValue +=
                " saturate(125%)";
        }


        if (
            filter === "cool"
        ) {
            filterValue +=
                " hue-rotate(180deg)";
        }


        if (
            filter === "dramatic"
        ) {
            filterValue +=
                " contrast(135%) saturate(120%)";
        }


        if (
            filter === "fade"
        ) {
            filterValue +=
                " brightness(110%) contrast(85%) saturate(75%)";
        }


        context.filter =
            filterValue;


        context.save();


        context.translate(
            outputWidth / 2,
            outputHeight / 2
        );


        context.rotate(
            rotation *
            Math.PI /
            180
        );


        context.scale(
            flipX
                ? -1
                : 1,
            flipY
                ? -1
                : 1
        );


        const drawWidth =
            rotatedWidth *
            zoom;


        const drawHeight =
            rotatedHeight *
            zoom;


        context.drawImage(
            image,
            cropLeft,
            cropTop,
            safeCropWidth,
            safeCropHeight,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );


        context.restore();


        context.filter =
            "none";


        if (
            text.trim()
        ) {

            context.save();


            const fontSize =
                clamp(
                    textSize,
                    12,
                    160
                );


            context.font =
                `600 ${fontSize}px Arial`;


            context.textAlign =
                "center";


            context.textBaseline =
                "middle";


            context.fillStyle =
                textColor;


            context.shadowColor =
                "rgba(0, 0, 0, 0.55)";


            context.shadowBlur =
                8;


            context.fillText(
                text,
                outputWidth *
                    (textX / 100),
                outputHeight *
                    (textY / 100)
            );


            context.restore();
        }
    };


    // =====================================================
    // REDRAW WHEN EDITS CHANGE
    // =====================================================

    useEffect(() => {

        drawCanvas();

    }, [
        selectedFile,
        brightness,
        contrast,
        saturation,
        blur,
        grayscale,
        rotation,
        flipX,
        flipY,
        zoom,
        filter,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        cropEnabled,
        text,
        textX,
        textY,
        textSize,
        textColor
    ]);


    // =====================================================
    // RESET EDITOR
    // =====================================================

    const resetEditor = (
        remember = true
    ) => {

        const state =
            getInitialState();


        setBrightness(
            state.brightness
        );

        setContrast(
            state.contrast
        );

        setSaturation(
            state.saturation
        );

        setBlur(
            state.blur
        );

        setGrayscale(
            state.grayscale
        );

        setRotation(
            state.rotation
        );

        setFlipX(
            state.flipX
        );

        setFlipY(
            state.flipY
        );

        setZoom(
            state.zoom
        );

        setFilter(
            state.filter
        );

        setCropX(
            state.cropX
        );

        setCropY(
            state.cropY
        );

        setCropWidth(
            state.cropWidth
        );

        setCropHeight(
            state.cropHeight
        );

        setCropEnabled(
            state.cropEnabled
        );

        setText(
            state.text
        );

        setTextX(
            state.textX
        );

        setTextY(
            state.textY
        );

        setTextSize(
            state.textSize
        );

        setTextColor(
            state.textColor
        );


        if (
            remember
        ) {

            setHistory([]);

            setHistoryIndex(-1);

            setTimeout(
                () => {
                    saveHistory();
                },
                0
            );
        }
    };


    // =====================================================
    // SELECT IMAGE FROM LIST
    // =====================================================

    const selectImage = (
        index
    ) => {

        if (
            index < 0 ||
            index >= imageFiles.length
        ) {
            return;
        }


        setSelectedIndex(
            index
        );


        setSelectedFile(
            imageFiles[index]
        );


        setHistory([]);

        setHistoryIndex(-1);
    };


    // =====================================================
    // LOCAL FILE INPUT
    // =====================================================

    const handleLocalImage = (
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
                "image/"
            )
        ) {

            toast.error(
                "Please select an image file."
            );

            event.target.value =
                "";

            return;
        }


        setUploading(
            true
        );


        try {

            const objectUrl =
                URL.createObjectURL(
                    file
                );


            const temporaryFile = {
                localFileId:
                    "temporary-" +
                    Date.now(),

                mongoFileId:
                    null,

                userId,

                fileName:
                    file.name,

                fileType:
                    "image",

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


            setImageFiles(
                (currentFiles) => [
                    temporaryFile,
                    ...currentFiles
                ]
            );


            setSelectedIndex(
                0
            );


            setSelectedFile(
                temporaryFile
            );


            if (
                previewUrlRef.current
            ) {

                URL.revokeObjectURL(
                    previewUrlRef.current
                );
            }


            previewUrlRef.current =
                objectUrl;


            setHistory([]);

            setHistoryIndex(-1);


            toast.success(
                "Image loaded into editor."
            );

        } catch (error) {

            console.error(
                "Load local image error:",
                error
            );

            toast.error(
                "Unable to load image."
            );

        } finally {

            setUploading(
                false
            );

            event.target.value =
                "";
        }
    };


    // =====================================================
    // UNDO
    // =====================================================

    const handleUndo = () => {

        if (
            historyIndex <= 0
        ) {

            toast.error(
                "Nothing to undo."
            );

            return;
        }


        const previous =
            history[
                historyIndex - 1
            ];


        applyHistoryState(
            previous
        );


        setHistoryIndex(
            historyIndex - 1
        );
    };


    // =====================================================
    // REDO
    // =====================================================

    const handleRedo = () => {

        if (
            historyIndex >=
            history.length - 1
        ) {

            toast.error(
                "Nothing to redo."
            );

            return;
        }


        const next =
            history[
                historyIndex + 1
            ];


        applyHistoryState(
            next
        );


        setHistoryIndex(
            historyIndex + 1
        );
    };


    const applyHistoryState = (
        state
    ) => {

        if (!state) {
            return;
        }


        setBrightness(
            state.brightness
        );

        setContrast(
            state.contrast
        );

        setSaturation(
            state.saturation
        );

        setBlur(
            state.blur
        );

        setGrayscale(
            state.grayscale
        );

        setRotation(
            state.rotation
        );

        setFlipX(
            state.flipX
        );

        setFlipY(
            state.flipY
        );

        setZoom(
            state.zoom
        );

        setFilter(
            state.filter
        );

        setCropX(
            state.cropX
        );

        setCropY(
            state.cropY
        );

        setCropWidth(
            state.cropWidth
        );

        setCropHeight(
            state.cropHeight
        );

        setCropEnabled(
            state.cropEnabled
        );

        setText(
            state.text
        );

        setTextX(
            state.textX
        );

        setTextY(
            state.textY
        );

        setTextSize(
            state.textSize
        );

        setTextColor(
            state.textColor
        );
    };


    // =====================================================
    // EDIT ACTION HELPERS
    // =====================================================

    const rotateLeft = () => {

        setRotation(
            (currentRotation) =>
                currentRotation - 90
        );

        saveHistory();
    };


    const rotateRight = () => {

        setRotation(
            (currentRotation) =>
                currentRotation + 90
        );

        saveHistory();
    };


    const toggleFlipX = () => {

        setFlipX(
            (currentValue) =>
                !currentValue
        );

        saveHistory();
    };


    const toggleFlipY = () => {

        setFlipY(
            (currentValue) =>
                !currentValue
        );

        saveHistory();
    };


    const changeBrightness = (
        value
    ) => {

        setBrightness(
            Number(value)
        );
    };


    const changeContrast = (
        value
    ) => {

        setContrast(
            Number(value)
        );
    };


    const changeSaturation = (
        value
    ) => {

        setSaturation(
            Number(value)
        );
    };


    const changeBlur = (
        value
    ) => {

        setBlur(
            Number(value)
        );
    };


    const changeGrayscale = (
        value
    ) => {

        setGrayscale(
            Number(value)
        );
    };


    const changeZoom = (
        value
    ) => {

        setZoom(
            Number(value)
        );
    };


    const setPresetFilter = (
        value
    ) => {

        setFilter(
            value
        );

        saveHistory();
    };


    const toggleCrop = () => {

        setCropEnabled(
            (currentValue) =>
                !currentValue
        );

        saveHistory();
    };


    const resetCrop = () => {

        setCropX(0);

        setCropY(0);

        setCropWidth(100);

        setCropHeight(100);
    };


    const resetAll = () => {

        resetEditor(
            true
        );

        toast.success(
            "Edits reset."
        );
    };


    // =====================================================
    // SAVE EDITED COPY
    // =====================================================

    const saveEditedCopy = async() => {

        if (
            !selectedFile ||
            !imageRef.current
        ) {

            toast.error(
                "Select a photo first."
            );

            return;
        }


        if (!userId) {

            toast.error(
                "Please login again."
            );

            return;
        }


        const canvas =
            canvasRef.current;


        if (!canvas) {

            toast.error(
                "Editor canvas is not ready."
            );

            return;
        }


        try {

            setSaving(
                true
            );


            canvas.toBlob(
                async(blob) => {

                    if (!blob) {

                        toast.error(
                            "Unable to create edited image."
                        );

                        setSaving(false);

                        return;
                    }


                    const originalName =
                        getBaseName(
                            selectedFile.fileName
                        );


                    const file =
                        new File(
                            [blob],
                            `${originalName}_edited_${Date.now()}.jpg`,
                            {
                                type:
                                    "image/jpeg"
                            }
                        );


                    const localFileId =
                        createLocalFileId();


                    try {

                        await addFile({

                            localFileId,

                            userId,

                            fileName:
                                file.name,

                            fileType:
                                "image",

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


                        await updateFileByLocalId(
                            localFileId,
                            {
                                parentFileId:
                                    selectedFile.mongoFileId ||
                                    null,

                                isCopy:
                                    false,

                                isEdited:
                                    true,

                                syncStatus:
                                    "pending",

                                updatedAt:
                                    new Date()
                            }
                        );


                        try {

                            const response =
                                await createFile({

                                    localFileId,

                                    fileName:
                                        file.name,

                                    fileType:
                                        "image",

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

                                    // =================================================
                                    // ACTUAL EDITED FILE
                                    // =================================================
                                    // Required by file.service.js so the
                                    // backend can upload the file to Cloudinary.
                                    // =================================================

                                    file

                                });


                            // createFile() already returns response.data
                            const mongoFile =
                                response;


                            if (
                                mongoFile &&
                                mongoFile._id
                            ) {

                                await updateFileByLocalId(
                                    localFileId,
                                    {

                                        mongoFileId:
                                            mongoFile._id,

                                        // =================================================
                                        // CLOUDINARY METADATA
                                        // =================================================

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
                                "Edited image sync error:",
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
                            "Edited photo saved as a new copy."
                        );


                        await loadImageFiles();

                    } catch (error) {

                        console.error(
                            "Save edited copy error:",
                            error
                        );

                        toast.error(
                            error.message ||
                            "Unable to save edited photo."
                        );

                    } finally {

                        setSaving(
                            false
                        );
                    }

                },
                "image/jpeg",
                0.95
            );

        } catch (error) {

            console.error(
                "Export edited image error:",
                error
            );

            setSaving(false);

            toast.error(
                "Unable to export edited photo."
            );
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

        };

    }, []);


    // =====================================================
    // EMPTY SESSION
    // =====================================================

    if (!userId) {

        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">

                <div className="rounded-3xl border border-red-400/20 bg-red-500/5 p-8 text-center">

                    <ImageIcon
                        className="mx-auto text-red-400"
                        size={44}
                    />

                    <h1 className="mt-4 text-xl font-semibold text-white">
                        Session not available
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Please login again to use the photo editor.
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

                        <ImageIcon size={14} />

                        Photo Editor

                    </div>


                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Edit Your Photos
                    </h1>


                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Edit photos directly in your browser and save every edit as a new copy.
                    </p>

                </div>


                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={
                            handleUndo
                        }
                        disabled={
                            historyIndex <= 0
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Undo
                    </button>


                    <button
                        type="button"
                        onClick={
                            handleRedo
                        }
                        disabled={
                            historyIndex >=
                            history.length - 1
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Redo
                    </button>


                    <button
                        type="button"
                        onClick={
                            resetAll
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>

                </div>

            </div>


            {/* =================================================
                SELECT PHOTO
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                    <button
                        type="button"
                        onClick={
                            openPicker
                        }
                        disabled={
                            uploading
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                    >

                        <Upload size={18} />

                        {uploading
                            ? "Loading..."
                            : "Choose Photo"}

                    </button>


                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={
                            handleLocalImage
                        }
                    />


                    <div className="flex min-w-0 flex-1 items-center gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                selectImage(
                                    selectedIndex - 1
                                )
                            }
                            disabled={
                                selectedIndex <= 0 ||
                                imageFiles.length === 0
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                        >
                            <ChevronLeft size={18} />
                        </button>


                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-white">

                                {selectedFile
                                    ? selectedFile.fileName
                                    : "No photo selected"}

                            </p>


                            <p className="mt-1 text-xs text-slate-500">

                                {imageFiles.length > 0
                                    ? `${selectedIndex + 1} of ${imageFiles.length} photos`
                                    : "Upload a photo to start editing"}

                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                selectImage(
                                    selectedIndex + 1
                                )
                            }
                            disabled={
                                selectedIndex >=
                                    imageFiles.length - 1 ||
                                imageFiles.length === 0
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                        >
                            <ChevronRight size={18} />
                        </button>

                    </div>

                </div>

            </div>


            {loadingFiles ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/70">

                    <div className="text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                        <p className="mt-4 text-sm text-slate-400">
                            Loading photos...
                        </p>

                    </div>

                </div>
            ) : !selectedFile ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 px-6 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-slate-500">

                        <ImageIcon size={38} />

                    </div>


                    <h2 className="mt-5 text-lg font-semibold text-white">
                        No photos available
                    </h2>


                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Upload an image or add a photo to your Gallery first.
                    </p>


                    <button
                        type="button"
                        onClick={
                            openPicker
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                    >
                        <Upload size={17} />
                        Upload Photo
                    </button>

                </div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

                    {/* =================================================
                        CANVAS
                    ================================================= */}

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

                        <div className="flex min-h-[620px] items-center justify-center overflow-auto p-5 sm:p-8">

                            <div className="max-h-[75vh] max-w-full overflow-auto rounded-2xl border border-white/10 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-2">

                                <canvas
                                    ref={
                                        canvasRef
                                    }
                                    className="block max-h-[70vh] max-w-full rounded-lg object-contain"
                                />

                            </div>

                        </div>


                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-900/80 p-4">

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        changeZoom(
                                            Math.max(
                                                0.5,
                                                zoom - 0.1
                                            )
                                        )
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                    title="Zoom out"
                                >
                                    <ZoomOut size={17} />
                                </button>


                                <span className="min-w-14 text-center text-xs font-semibold text-slate-400">
                                    {Math.round(
                                        zoom * 100
                                    )}%
                                </span>


                                <button
                                    type="button"
                                    onClick={() =>
                                        changeZoom(
                                            Math.min(
                                                2,
                                                zoom + 0.1
                                            )
                                        )
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                    title="Zoom in"
                                >
                                    <ZoomIn size={17} />
                                </button>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    saveEditedCopy
                                }
                                disabled={
                                    saving
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                            >

                                <Save size={17} />

                                {saving
                                    ? "Saving..."
                                    : "Save as Edited Copy"}

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        TOOLS
                    ================================================= */}

                    <div className="space-y-4">

                        {/* TRANSFORM */}

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                            <div className="mb-4 flex items-center gap-2">

                                <Scan
                                    size={17}
                                    className="text-slate-300"
                                />

                                <h2 className="text-sm font-semibold text-white">
                                    Transform
                                </h2>

                            </div>


                            <div className="grid grid-cols-2 gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        rotateLeft
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                                >
                                    <RotateCcw size={15} />
                                    Rotate Left
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        rotateRight
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                                >
                                    <RotateCw size={15} />
                                    Rotate Right
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        toggleFlipX
                                    }
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                                        flipX
                                            ? "border-white/20 bg-white/10 text-white"
                                            : "border-white/10 bg-white/5 text-slate-300"
                                    }`}
                                >
                                    <FlipHorizontal size={15} />
                                    Flip Horizontal
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        toggleFlipY
                                    }
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                                        flipY
                                            ? "border-white/20 bg-white/10 text-white"
                                            : "border-white/10 bg-white/5 text-slate-300"
                                    }`}
                                >
                                    <FlipVertical size={15} />
                                    Flip Vertical
                                </button>

                            </div>

                        </div>


                        {/* ADJUSTMENTS */}

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                            <div className="mb-4 flex items-center gap-2">

                                <Sun
                                    size={17}
                                    className="text-slate-300"
                                />

                                <h2 className="text-sm font-semibold text-white">
                                    Adjustments
                                </h2>

                            </div>


                            <div className="space-y-4">

                                <label className="block">

                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                        <span className="inline-flex items-center gap-2">
                                            <Sun size={14} />
                                            Brightness
                                        </span>

                                        <span>
                                            {brightness}
                                        </span>

                                    </div>


                                    <input
                                        type="range"
                                        min="40"
                                        max="160"
                                        value={
                                            brightness
                                        }
                                        onChange={(event) =>
                                            changeBrightness(
                                                event.target.value
                                            )
                                        }
                                        className="w-full"
                                    />

                                </label>


                                <label className="block">

                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                        <span className="inline-flex items-center gap-2">
                                            <Contrast size={14} />
                                            Contrast
                                        </span>

                                        <span>
                                            {contrast}
                                        </span>

                                    </div>


                                    <input
                                        type="range"
                                        min="40"
                                        max="180"
                                        value={
                                            contrast
                                        }
                                        onChange={(event) =>
                                            changeContrast(
                                                event.target.value
                                            )
                                        }
                                        className="w-full"
                                    />

                                </label>


                                <label className="block">

                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                        <span className="inline-flex items-center gap-2">
                                            <Droplets size={14} />
                                            Saturation
                                        </span>

                                        <span>
                                            {saturation}
                                        </span>

                                    </div>


                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={
                                            saturation
                                        }
                                        onChange={(event) =>
                                            changeSaturation(
                                                event.target.value
                                            )
                                        }
                                        className="w-full"
                                    />

                                </label>


                                <label className="block">

                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                        <span>
                                            Blur
                                        </span>

                                        <span>
                                            {blur}px
                                        </span>

                                    </div>


                                    <input
                                        type="range"
                                        min="0"
                                        max="12"
                                        value={
                                            blur
                                        }
                                        onChange={(event) =>
                                            changeBlur(
                                                event.target.value
                                            )
                                        }
                                        className="w-full"
                                    />

                                </label>


                                <label className="block">

                                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">

                                        <span>
                                            Grayscale
                                        </span>

                                        <span>
                                            {grayscale}%
                                        </span>

                                    </div>


                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={
                                            grayscale
                                        }
                                        onChange={(event) =>
                                            changeGrayscale(
                                                event.target.value
                                            )
                                        }
                                        className="w-full"
                                    />

                                </label>

                            </div>

                        </div>


                        {/* CROP */}

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                            <div className="mb-4 flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                    <Crop
                                        size={17}
                                        className="text-slate-300"
                                    />

                                    <h2 className="text-sm font-semibold text-white">
                                        Crop
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        toggleCrop
                                    }
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                        cropEnabled
                                            ? "border-white/20 bg-white text-slate-950"
                                            : "border-white/10 bg-white/5 text-slate-400"
                                    }`}
                                >
                                    {cropEnabled
                                        ? "Enabled"
                                        : "Enable"}
                                </button>

                            </div>


                            {cropEnabled && (
                                <div className="grid grid-cols-2 gap-3">

                                    <label className="text-xs text-slate-500">

                                        X %

                                        <input
                                            type="number"
                                            min="0"
                                            max="99"
                                            value={
                                                cropX
                                            }
                                            onChange={(event) =>
                                                setCropX(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                        />

                                    </label>


                                    <label className="text-xs text-slate-500">

                                        Y %

                                        <input
                                            type="number"
                                            min="0"
                                            max="99"
                                            value={
                                                cropY
                                            }
                                            onChange={(event) =>
                                                setCropY(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                        />

                                    </label>


                                    <label className="text-xs text-slate-500">

                                        Width %

                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={
                                                cropWidth
                                            }
                                            onChange={(event) =>
                                                setCropWidth(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                        />

                                    </label>


                                    <label className="text-xs text-slate-500">

                                        Height %

                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={
                                                cropHeight
                                            }
                                            onChange={(event) =>
                                                setCropHeight(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                        />

                                    </label>


                                    <button
                                        type="button"
                                        onClick={
                                            resetCrop
                                        }
                                        className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                                    >
                                        Reset Crop
                                    </button>

                                </div>
                            )}

                        </div>


                        {/* FILTERS */}

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                            <div className="mb-4 flex items-center gap-2">

                                <Sparkles
                                    size={17}
                                    className="text-slate-300"
                                />

                                <h2 className="text-sm font-semibold text-white">
                                    Filters
                                </h2>

                            </div>


                            <div className="grid grid-cols-3 gap-2">

                                {[
                                    "none",
                                    "vintage",
                                    "warm",
                                    "cool",
                                    "dramatic",
                                    "fade"
                                ].map(
                                    (item) => (
                                        <button
                                            key={
                                                item
                                            }
                                            type="button"
                                            onClick={() =>
                                                setPresetFilter(
                                                    item
                                                )
                                            }
                                            className={`rounded-xl border px-2 py-2.5 text-xs font-semibold capitalize ${
                                                filter === item
                                                    ? "border-white/20 bg-white text-slate-950"
                                                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

                            </div>

                        </div>


                        {/* TEXT */}

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">

                            <div className="mb-4 flex items-center gap-2">

                                <Type
                                    size={17}
                                    className="text-slate-300"
                                />

                                <h2 className="text-sm font-semibold text-white">
                                    Add Text
                                </h2>

                            </div>


                            <input
                                type="text"
                                value={
                                    text
                                }
                                onChange={(event) =>
                                    setText(
                                        event.target.value
                                    )
                                }
                                placeholder="Write something..."
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600"
                            />


                            <div className="mt-3 grid grid-cols-2 gap-3">

                                <label className="text-xs text-slate-500">

                                    Size

                                    <input
                                        type="number"
                                        min="12"
                                        max="160"
                                        value={
                                            textSize
                                        }
                                        onChange={(event) =>
                                            setTextSize(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                    />

                                </label>


                                <label className="text-xs text-slate-500">

                                    Color

                                    <input
                                        type="color"
                                        value={
                                            textColor
                                        }
                                        onChange={(event) =>
                                            setTextColor(
                                                event.target.value
                                            )
                                        }
                                        className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950 p-1"
                                    />

                                </label>


                                <label className="text-xs text-slate-500">

                                    X %

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            textX
                                        }
                                        onChange={(event) =>
                                            setTextX(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                    />

                                </label>


                                <label className="text-xs text-slate-500">

                                    Y %

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            textY
                                        }
                                        onChange={(event) =>
                                            setTextY(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                        className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                                    />

                                </label>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setText(
                                        ""
                                    )
                                }
                                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                            >
                                <X size={14} />
                                Remove Text
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                CAPABILITY INFO
            ================================================= */}

            <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Crop
                        size={21}
                        className="text-slate-300"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Crop & Transform
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Crop, rotate and flip photos without changing the original file.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Sparkles
                        size={21}
                        className="text-slate-300"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Adjust & Filters
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Brightness, contrast, saturation, blur, grayscale and built-in filters.
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">

                    <Save
                        size={21}
                        className="text-slate-300"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-white">
                        Safe Edited Copy
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Every export becomes a new file linked to the original through metadata.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default PhotoEditor;
