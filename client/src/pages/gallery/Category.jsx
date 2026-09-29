import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Folder,
    Plus,
    Pencil,
    Trash2,
    X,
    Image,
    Video,
    Music2,
    FileText,
    Upload,
    Search,
    Check,
    FolderOpen,
    HardDrive,
    Smartphone,
    LoaderCircle,
    ExternalLink,
    Download
} from "lucide-react";

import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth.js";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/category/category.service.js";

import {
    getAllFiles,
    updateFileByLocalId,
    addFile
} from "../../services/storage/db.js";

import {
    createFile,
    changeFileCategory,
    getFiles
} from "../../services/file/file.service.js";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_FILE_SIZE =
    1024 *
    1024 *
    1024;


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
// FILE TYPE
// =========================================================

const getFileType = (file) => {

    if (!file) {
        return null;
    }

    const mimeType =
        file.type
            ? file.type.toLowerCase()
            : "";

    const fileName =
        file.name
            ? file.name.toLowerCase()
            : "";


    if (
        mimeType.startsWith("image/")
    ) {
        return "image";
    }


    if (
        mimeType.startsWith("video/")
    ) {
        return "video";
    }


    if (
        mimeType.startsWith("audio/")
    ) {
        return "audio";
    }


    if (
        mimeType === "application/pdf" ||
        fileName.endsWith(".pdf")
    ) {
        return "pdf";
    }


    return null;
};


// =========================================================
// FILE ICON
// =========================================================

const FileTypeIcon = ({
    type,
    size = 20
}) => {

    if (type === "image") {
        return (
            <Image
                size={size}
                strokeWidth={1.8}
            />
        );
    }


    if (type === "video") {
        return (
            <Video
                size={size}
                strokeWidth={1.8}
            />
        );
    }


    if (type === "audio") {
        return (
            <Music2
                size={size}
                strokeWidth={1.8}
            />
        );
    }


    return (
        <FileText
            size={size}
            strokeWidth={1.8}
        />
    );
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


    return (
        `${value.toFixed(
            index === 0
                ? 0
                : 2
        )} ${units[index]}`
    );
};


// =========================================================
// DATE
// =========================================================

const formatDate = (value) => {

    if (!value) {
        return "";
    }

    try {

        return new Date(
            value
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return "";

    }
};


// =========================================================
// OBJECT URL
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
// FILE PREVIEW
// =========================================================

const CategoryFilePreview = ({
    file,
    large = false
}) => {

    const [
        previewUrl,
        setPreviewUrl
    ] = useState(null);


    useEffect(() => {

        let objectUrl = null;


        if (
            file &&
            file.fileData
        ) {

            objectUrl =
                createObjectUrl(
                    file.fileData
                );

            setPreviewUrl(
                objectUrl
            );

        } else if (file?.fileUrl) {

            setPreviewUrl(file.fileUrl);

        } else {

            setPreviewUrl(
                null
            );

        }


        return () => {

            if (objectUrl) {

                URL.revokeObjectURL(
                    objectUrl
                );

            }

        };

    }, [file]);


    const heightClass =
        large
            ? "h-64"
            : "h-44";


    if (
        file &&
        file.fileType === "image" &&
        previewUrl
    ) {

        return (
            <div
                className={`w-full bg-slate-950 ${heightClass}`}
            >
                <img
                    src={previewUrl}
                    alt={
                        file.fileName ||
                        "Image"
                    }
                    className="h-full w-full object-contain"
                />
            </div>
        );

    }


    if (
        file &&
        file.fileType === "video" &&
        previewUrl
    ) {

        return (
            <div
                className={`w-full bg-black ${heightClass}`}
            >
                <video
                    src={previewUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                />
            </div>
        );

    }


    if (
        file &&
        file.fileType === "audio" &&
        previewUrl
    ) {

        return (
            <div
                className={`flex w-full flex-col items-center justify-center gap-4 bg-slate-950 px-4 ${heightClass}`}
            >

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-indigo-400">

                    <Music2
                        size={30}
                    />

                </div>


                <audio
                    src={previewUrl}
                    controls
                    className="w-full"
                />

            </div>
        );

    }


    if (
        file &&
        file.fileType === "pdf" &&
        previewUrl
    ) {

        return (
            <div
                className={`w-full bg-white ${heightClass}`}
            >
                <iframe
                    src={previewUrl}
                    title={
                        file.fileName ||
                        "PDF"
                    }
                    className="h-full w-full"
                />
            </div>
        );

    }


    return (
        <div
            className={`flex w-full items-center justify-center bg-slate-950 text-slate-600 ${heightClass}`}
        >
            <FileTypeIcon
                type={
                    file
                        ? file.fileType
                        : null
                }
                size={
                    large
                        ? 55
                        : 40
                }
            />
        </div>
    );
};


// =========================================================
// CATEGORY FILE CARD
// =========================================================

const CategoryFileCard = ({
    file,
    onOpen,
    onDownload
}) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">

            {/* PREVIEW */}

            <CategoryFilePreview
                file={file}
            />


            {/* DETAILS */}

            <div className="p-4">

                <div className="flex items-start gap-3">

                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-slate-400">

                        <FileTypeIcon
                            type={
                                file.fileType
                            }
                            size={18}
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
                                file.fileType
                            }

                            {" • "}

                            {
                                formatFileSize(
                                    file.size
                                )
                            }

                        </p>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="mt-4 flex items-center gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            onOpen(file)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >

                        <ExternalLink
                            size={15}
                        />

                        Open

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            onDownload(file)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >

                        <Download
                            size={15}
                        />

                        Download

                    </button>

                </div>

            </div>

        </div>
    );
};


// =========================================================
// CATEGORY PAGE
// =========================================================

const Category = () => {

    const {
        user
    } = useAuth();


    const userId =
        getUserId(user);


    // =====================================================
    // MAIN DATA
    // =====================================================

    const [
        categories,
        setCategories
    ] = useState([]);


    const [
        allLocalFiles,
        setAllLocalFiles
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    // =====================================================
    // CATEGORY MODAL
    // =====================================================

    const [
        showCategoryModal,
        setShowCategoryModal
    ] = useState(false);


    const [
        editingCategory,
        setEditingCategory
    ] = useState(null);


    const [
        categoryName,
        setCategoryName
    ] = useState("");


    const [
        categoryDescription,
        setCategoryDescription
    ] = useState("");


    const [
        savingCategory,
        setSavingCategory
    ] = useState(false);


    // =====================================================
    // ADD FILE MODAL
    // =====================================================

    const [
        showAddFilesModal,
        setShowAddFilesModal
    ] = useState(false);


    const [
        selectedCategory,
        setSelectedCategory
    ] = useState(null);


    const [
        addFilesTab,
        setAddFilesTab
    ] = useState("gallery");


    const [
        selectedLocalIds,
        setSelectedLocalIds
    ] = useState([]);


    const [
        gallerySearch,
        setGallerySearch
    ] = useState("");


    const [
        processingFiles,
        setProcessingFiles
    ] = useState(false);


    // =====================================================
    // VIEW FILES MODAL
    // =====================================================

    const [
        showViewFilesModal,
        setShowViewFilesModal
    ] = useState(false);


    const [
        viewingCategory,
        setViewingCategory
    ] = useState(null);


    // =====================================================
    // REFS
    // =====================================================

    const fileInputRef =
        useRef(null);


    const folderInputRef =
        useRef(null);


    // =====================================================
    // LOAD DATA
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);


            const categoryResponse =
                await getCategories();


            let categoryList = [];


            if (
                categoryResponse &&
                Array.isArray(
                    categoryResponse.data
                )
            ) {

                categoryList =
                    categoryResponse.data;

            }


            let localFileList = [];
            let cloudFileList = [];


            if (userId) {

                const localFiles =
                    await getAllFiles(
                        userId
                    );


                if (
                    Array.isArray(
                        localFiles
                    )
                ) {

                    localFileList =
                        localFiles;

                }

                try {
                    const cloudResponse = await getFiles();
                    cloudFileList = Array.isArray(cloudResponse?.data)
                        ? cloudResponse.data
                        : Array.isArray(cloudResponse?.files)
                            ? cloudResponse.files
                            : [];
                } catch (cloudError) {
                    console.error("Cloud category files load error:", cloudError);
                }

            }

            const mergedFiles = [...localFileList];
            cloudFileList.forEach((cloudFile) => {
                const match = mergedFiles.find((localFile) =>
                    (cloudFile.localFileId && localFile.localFileId === cloudFile.localFileId) ||
                    (cloudFile._id && localFile.mongoFileId === cloudFile._id)
                );
                const categoryId = cloudFile.category?._id || cloudFile.category || null;
                if (match) {
                    Object.assign(match, {
                        mongoFileId: cloudFile._id || match.mongoFileId,
                        fileUrl: cloudFile.fileUrl || match.fileUrl || null,
                        categoryId,
                        isFavorite: cloudFile.isFavorite === true,
                        isDeleted: cloudFile.isDeleted === true,
                        syncStatus: "synced"
                    });
                } else {
                    mergedFiles.push({
                        ...cloudFile,
                        localId: null,
                        localFileId: cloudFile.localFileId || cloudFile._id,
                        mongoFileId: cloudFile._id,
                        userId,
                        fileData: null,
                        categoryId,
                        syncStatus: "synced"
                    });
                }
            });


            const activeFiles =
                mergedFiles.filter(
                    (file) => {

                        return (
                            file.isDeleted !== true
                        );

                    }
                );


            const categoriesWithCounts =
                categoryList.map(
                    (category) => {

                        let fileCount = 0;


                        for (
                            let i = 0;
                            i < activeFiles.length;
                            i++
                        ) {

                            const file =
                                activeFiles[i];


                            if (
                                String(
                                    file.categoryId
                                ) ===
                                String(
                                    category._id
                                )
                            ) {

                                fileCount++;

                            }

                        }


                        return {
                            ...category,
                            fileCount
                        };

                    }
                );


            setCategories(
                categoriesWithCounts
            );


            setAllLocalFiles(
                mergedFiles
            );


        } catch (error) {

            console.error(
                "Category load error:",
                error
            );

            toast.error(
                "Failed to load category data."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadData();

    }, [userId]);


    // =====================================================
    // CREATE CATEGORY
    // =====================================================

    const openCreateCategory = () => {

        setEditingCategory(null);

        setCategoryName("");

        setCategoryDescription("");

        setShowCategoryModal(
            true
        );

    };


    // =====================================================
    // EDIT CATEGORY
    // =====================================================

    const openEditCategory = (
        category
    ) => {

        setEditingCategory(
            category
        );

        setCategoryName(
            category.name || ""
        );

        setCategoryDescription(
            category.description || ""
        );

        setShowCategoryModal(
            true
        );

    };


    // =====================================================
    // CLOSE CATEGORY MODAL
    // =====================================================

    const closeCategoryModal = () => {

        if (savingCategory) {
            return;
        }

        setShowCategoryModal(
            false
        );

        setEditingCategory(
            null
        );

        setCategoryName("");

        setCategoryDescription("");

    };


    // =====================================================
    // SUBMIT CATEGORY
    // =====================================================

    const handleCategorySubmit = async (
        event
    ) => {

        event.preventDefault();


        const name =
            categoryName.trim();


        const description =
            categoryDescription.trim();


        if (!name) {

            toast.error(
                "Category name is required."
            );

            return;

        }


        if (
            name.length > 50
        ) {

            toast.error(
                "Category name cannot exceed 50 characters."
            );

            return;

        }


        if (
            description.length > 200
        ) {

            toast.error(
                "Description cannot exceed 200 characters."
            );

            return;

        }


        try {

            setSavingCategory(
                true
            );


            let response;


            if (editingCategory) {

                response =
                    await updateCategory(
                        editingCategory._id,
                        {
                            name,
                            description
                        }
                    );

            } else {

                response =
                    await createCategory({
                        name,
                        description
                    });

            }


            if (
                response &&
                response.success
            ) {

                toast.success(
                    editingCategory
                        ? "Category updated successfully."
                        : "Category created successfully."
                );


                closeCategoryModal();

                await loadData();

                return;

            }


            toast.error(
                response.message ||
                "Unable to save category."
            );


        } catch (error) {

            console.error(
                "Category save error:",
                error
            );


            let message =
                "Something went wrong.";


            if (
                error &&
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                message =
                    error.response.data.message;

            }


            toast.error(
                message
            );

        } finally {

            setSavingCategory(
                false
            );

        }

    };


    // =====================================================
    // DELETE CATEGORY
    // =====================================================

    const handleDeleteCategory = async (
        category
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${category.name}" category?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteCategory(
                category._id
            );


            const filesInCategory =
                allLocalFiles.filter(
                    (file) => {

                        return (
                            String(
                                file.categoryId
                            ) ===
                            String(
                                category._id
                            )
                        );

                    }
                );


            for (
                let i = 0;
                i < filesInCategory.length;
                i++
            ) {

                const file =
                    filesInCategory[i];


                if (file.localId === null || file.localId === undefined) {
                    continue;
                }

                await updateFileByLocalId(
                    file.localFileId,
                    {
                        categoryId: null,
                        syncStatus:
                            file.mongoFileId
                                ? "synced"
                                : "pending"
                    }
                );

            }


            toast.success(
                "Category deleted successfully."
            );


            await loadData();

        } catch (error) {

            console.error(
                "Category delete error:",
                error
            );


            let message =
                "Unable to delete category.";


            if (
                error &&
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                message =
                    error.response.data.message;

            }


            toast.error(
                message
            );

        }

    };


    // =====================================================
    // OPEN ADD FILE MODAL
    // =====================================================

    const openAddFilesModal = (
        category
    ) => {

        setSelectedCategory(
            category
        );

        setSelectedLocalIds([]);

        setGallerySearch("");

        setAddFilesTab(
            "gallery"
        );

        setShowAddFilesModal(
            true
        );

    };


    // =====================================================
    // CLOSE ADD FILE MODAL
    // =====================================================

    const closeAddFilesModal = () => {

        if (processingFiles) {
            return;
        }

        setShowAddFilesModal(
            false
        );

        setSelectedCategory(
            null
        );

        setSelectedLocalIds([]);

        setGallerySearch("");

        setAddFilesTab(
            "gallery"
        );

    };


    // =====================================================
    // OPEN VIEW FILES MODAL
    // =====================================================

    const openViewFilesModal = (
        category
    ) => {

        setViewingCategory(
            category
        );

        setShowViewFilesModal(
            true
        );

    };


    // =====================================================
    // CLOSE VIEW FILES MODAL
    // =====================================================

    const closeViewFilesModal = () => {

        setShowViewFilesModal(
            false
        );

        setViewingCategory(
            null
        );

    };


    // =====================================================
    // ACTIVE FILES
    // =====================================================

    const activeFiles =
        useMemo(() => {

            return allLocalFiles.filter(
                (file) => {

                    return (
                        file.isDeleted !== true
                    );

                }
            );

        }, [
            allLocalFiles
        ]);


    // =====================================================
    // CATEGORY FILES
    // =====================================================

    const categoryFiles =
        useMemo(() => {

            if (!viewingCategory) {
                return [];
            }


            return activeFiles
                .filter(
                    (file) => {

                        return (
                            String(
                                file.categoryId
                            ) ===
                            String(
                                viewingCategory._id
                            )
                        );

                    }
                )
                .sort(
                    (a, b) => {

                        return (
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                        );

                    }
                );

        }, [
            activeFiles,
            viewingCategory
        ]);


    // =====================================================
    // GALLERY FILES FOR ASSIGNING
    // =====================================================

    const galleryFiles =
        useMemo(() => {

            const searchValue =
                gallerySearch
                    .trim()
                    .toLowerCase();


            return activeFiles.filter(
                (file) => {

                    if (
                        selectedCategory &&
                        String(
                            file.categoryId
                        ) ===
                        String(
                            selectedCategory._id
                        )
                    ) {

                        return false;

                    }


                    if (
                        searchValue
                    ) {

                        const fileName =
                            String(
                                file.fileName ||
                                ""
                            ).toLowerCase();


                        if (
                            !fileName.includes(
                                searchValue
                            )
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );

        }, [
            activeFiles,
            gallerySearch,
            selectedCategory
        ]);


    // =====================================================
    // TOGGLE LOCAL FILE
    // =====================================================

    const toggleLocalFile = (
        localFileId
    ) => {

        setSelectedLocalIds(
            (previous) => {

                if (
                    previous.includes(
                        localFileId
                    )
                ) {

                    return previous.filter(
                        (id) => {

                            return (
                                id !==
                                localFileId
                            );

                        }
                    );

                }


                return [
                    ...previous,
                    localFileId
                ];

            }
        );

    };


    // =====================================================
    // SELECT ALL
    // =====================================================

    const selectAllVisible = () => {

        const visibleIds =
            galleryFiles.map(
                (file) => {

                    return file.localFileId;

                }
            );


        setSelectedLocalIds(
            visibleIds
        );

    };


    // =====================================================
    // CLEAR SELECTION
    // =====================================================

    const clearSelection = () => {

        setSelectedLocalIds([]);

    };


    // =====================================================
    // ASSIGN EXISTING GALLERY FILES
    // =====================================================

    const assignExistingFiles = async () => {

        if (!selectedCategory) {

            toast.error(
                "Select a category first."
            );

            return;

        }


        if (
            selectedLocalIds.length === 0
        ) {

            toast.error(
                "Select at least one file."
            );

            return;

        }


        try {

            setProcessingFiles(
                true
            );


            let successCount = 0;

            let pendingCount = 0;

            let failedCount = 0;


            for (
                let i = 0;
                i < selectedLocalIds.length;
                i++
            ) {

                const localFileId =
                    selectedLocalIds[i];


                const file =
                    activeFiles.find(
                        (item) => {

                            return (
                                item.localFileId ===
                                localFileId
                            );

                        }
                    );


                if (!file) {

                    failedCount++;

                    continue;

                }


                try {

                    if (
                        file.mongoFileId
                    ) {

                        try {

                            await changeFileCategory(
                                file.mongoFileId,
                                selectedCategory._id
                            );


                            if (file.localId !== null && file.localId !== undefined) {
                                await updateFileByLocalId(file.localFileId, {
                                    categoryId: selectedCategory._id,
                                    syncStatus: "synced"
                                });
                            }


                            successCount++;

                        } catch (apiError) {

                            if (file.localId !== null && file.localId !== undefined) {
                                await updateFileByLocalId(file.localFileId, {
                                    categoryId: selectedCategory._id,
                                    syncStatus: "pending"
                                });
                                pendingCount++;
                            } else {
                                failedCount++;
                            }

                        }

                    } else {

                        await updateFileByLocalId(
                            file.localFileId,
                            {
                                categoryId:
                                    selectedCategory._id,
                                syncStatus:
                                    "pending"
                            }
                        );


                        pendingCount++;

                    }

                } catch (error) {

                    console.error(
                        "Assign existing file error:",
                        error
                    );

                    failedCount++;

                }

            }


            if (
                successCount > 0
            ) {

                toast.success(
                    `${successCount} file${successCount === 1 ? "" : "s"} added to ${selectedCategory.name}.`
                );

            }


            if (
                pendingCount > 0
            ) {

                toast(
                    `${pendingCount} file${pendingCount === 1 ? "" : "s"} saved locally and marked for sync.`
                );

            }


            if (
                failedCount > 0
            ) {

                toast.error(
                    `${failedCount} file${failedCount === 1 ? "" : "s"} could not be added.`
                );

            }


            await loadData();

            closeAddFilesModal();

        } catch (error) {

            console.error(
                "Assign existing files error:",
                error
            );

            toast.error(
                "Unable to add selected files."
            );

        } finally {

            setProcessingFiles(
                false
            );

        }

    };


    // =====================================================
    // OPEN FILE PICKER
    // =====================================================

    const openFilePicker = () => {

        if (
            fileInputRef.current
        ) {

            fileInputRef.current.click();

        }

    };


    // =====================================================
    // OPEN FOLDER PICKER
    // =====================================================

    const openFolderPicker = () => {

        if (
            folderInputRef.current
        ) {

            folderInputRef.current.click();

        }

    };


    // =====================================================
    // LOCAL ID
    // =====================================================

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
            Math.random()
                .toString(36)
                .slice(2)
        );

    };


    // =====================================================
    // UPLOAD DEVICE FILES
    // =====================================================

    const uploadDeviceFiles = async (
        fileList
    ) => {

        if (!selectedCategory) {

            toast.error(
                "Select a category first."
            );

            return;

        }


        if (
            !fileList ||
            fileList.length === 0
        ) {

            return;

        }


        try {

            setProcessingFiles(
                true
            );


            let addedCount = 0;

            let pendingCount = 0;

            let duplicateCount = 0;

            let failedCount = 0;


            for (
                let i = 0;
                i < fileList.length;
                i++
            ) {

                const browserFile =
                    fileList[i];


                const fileType =
                    getFileType(
                        browserFile
                    );


                if (!fileType) {

                    failedCount++;

                    continue;

                }


                if (
                    browserFile.size >
                    MAX_FILE_SIZE
                ) {

                    toast.error(
                        `${browserFile.name} is larger than 1GB.`
                    );

                    failedCount++;

                    continue;

                }


                const duplicate =
                    activeFiles.find(
                        (file) => {

                            return (
                                file.fileName ===
                                    browserFile.name &&
                                file.size ===
                                    browserFile.size &&
                                file.fileType ===
                                    fileType
                            );

                        }
                    );


                if (duplicate) {

                    duplicateCount++;


                    try {

                        if (
                            duplicate.mongoFileId
                        ) {

                            try {

                                await changeFileCategory(
                                    duplicate.mongoFileId,
                                    selectedCategory._id
                                );


                                if (duplicate.localId !== null && duplicate.localId !== undefined) {
                                    await updateFileByLocalId(duplicate.localFileId, {
                                        categoryId: selectedCategory._id,
                                        syncStatus: "synced"
                                    });
                                }


                                addedCount++;

                            } catch (apiError) {

                                if (duplicate.localId !== null && duplicate.localId !== undefined) {
                                    await updateFileByLocalId(duplicate.localFileId, {
                                        categoryId: selectedCategory._id,
                                        syncStatus: "pending"
                                    });
                                    pendingCount++;
                                } else {
                                    failedCount++;
                                }

                            }

                        } else {

                            if (duplicate.localId !== null && duplicate.localId !== undefined) {
                                await updateFileByLocalId(duplicate.localFileId, {
                                    categoryId: selectedCategory._id,
                                    syncStatus: "pending"
                                });
                            }


                            pendingCount++;

                        }

                    } catch (error) {

                        failedCount++;

                    }


                    continue;

                }


                const localFileId =
                    createLocalFileId();


                try {

                    await addFile({

                        localFileId,

                        userId,

                        fileName:
                            browserFile.name,

                        fileType,

                        mimeType:
                            browserFile.type ||
                            "application/octet-stream",

                        size:
                            browserFile.size,

                        fileData:
                            browserFile,

                        categoryId:
                            selectedCategory._id,

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
                                    browserFile.name,

                                fileType,

                                mimeType:
                                    browserFile.type ||
                                    "application/octet-stream",

                                size:
                                    browserFile.size,

                                categoryId:
                                    selectedCategory._id,

                                parentFileId:
                                    null,

                                isCopy:
                                    false,

                                isEdited:
                                    false,

                                file:
                                    browserFile

                            });


                        const mongoFile =
                            response && response.data;


                        if (
                            mongoFile &&
                            mongoFile._id
                        ) {

                            await updateFileByLocalId(
                                localFileId,
                                {
                                    mongoFileId:
                                        mongoFile._id,
                                    categoryId:
                                        selectedCategory._id,
                                    syncStatus:
                                        "synced"
                                }
                            );


                            addedCount++;

                        } else {

                            pendingCount++;

                        }

                    } catch (apiError) {

                        await updateFileByLocalId(
                            localFileId,
                            {
                                categoryId:
                                    selectedCategory._id,
                                syncStatus:
                                    "pending"
                            }
                        );


                        pendingCount++;

                    }

                } catch (error) {

                    console.error(
                        "Device file save error:",
                        error
                    );

                    failedCount++;

                }

            }


            if (
                addedCount > 0
            ) {

                toast.success(
                    `${addedCount} file${addedCount === 1 ? "" : "s"} added to ${selectedCategory.name}.`
                );

            }


            if (
                pendingCount > 0
            ) {

                toast(
                    `${pendingCount} file${pendingCount === 1 ? "" : "s"} saved locally and pending sync.`
                );

            }


            if (
                duplicateCount > 0
            ) {

                toast(
                    `${duplicateCount} existing file${duplicateCount === 1 ? "" : "s"} reused.`
                );

            }


            if (
                failedCount > 0
            ) {

                toast.error(
                    `${failedCount} file${failedCount === 1 ? "" : "s"} failed.`
                );

            }


            await loadData();

            closeAddFilesModal();

        } catch (error) {

            console.error(
                "Device upload error:",
                error
            );

            toast.error(
                "Unable to add selected files."
            );

        } finally {

            setProcessingFiles(
                false
            );

        }

    };


    // =====================================================
    // FILE INPUT
    // =====================================================

    const handleFileInputChange = (
        event
    ) => {

        const files =
            event.target.files;


        uploadDeviceFiles(
            files
        );


        event.target.value = "";

    };


    // =====================================================
    // OPEN FILE
    // =====================================================

    const handleOpenFile = (
        file
    ) => {

        if (!file) {
            toast.error("This file is not available.");
            return;
        }

        if (file.fileUrl) {
            window.open(file.fileUrl, "_blank", "noopener,noreferrer");
            return;
        }

        if (!file.fileData) {

            toast.error(
                "This file is not available on this device."
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


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            60000
        );

    };


    // =====================================================
    // DOWNLOAD FILE
    // =====================================================

    const handleDownloadFile = (
        file
    ) => {

        if (!file) {
            toast.error("This file is not available.");
            return;
        }

        if (file.fileUrl) {
            const link = document.createElement("a");
            link.href = file.fileUrl;
            link.download = file.fileName || "download";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }

        if (!file.fileData) {

            toast.error(
                "This file is not available on this device."
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


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            5000
        );

    };


    // =====================================================
    // CATEGORY COUNT
    // =====================================================

    const getCategoryCount = (
        categoryId
    ) => {

        let count = 0;


        for (
            let i = 0;
            i < activeFiles.length;
            i++
        ) {

            const file =
                activeFiles[i];


            if (
                String(
                    file.categoryId
                ) ===
                String(
                    categoryId
                )
            ) {

                count++;

            }

        }


        return count;

    };


    // =====================================================
    // UNCATEGORIZED
    // =====================================================

    const uncategorizedCount =
        activeFiles.filter(
            (file) => {

                return !file.categoryId;

            }
        ).length;


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="min-h-screen bg-slate-950 text-white">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b border-white/10">

                <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">

                                    <Folder
                                        size={25}
                                    />

                                </div>


                                <div>

                                    <h1 className="text-2xl font-bold">
                                        Categories
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Organize images, videos, audio and PDFs.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={
                                openCreateCategory
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                        >

                            <Plus
                                size={18}
                            />

                            Create Category

                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


                {/* =================================================
                    INFO
                ================================================= */}

                <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <h2 className="text-base font-semibold">
                                Category File Manager
                            </h2>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                                View files already inside a category, add files from your gallery, or choose new files from your device.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-400">
                                <Image size={15} />
                                Images
                            </div>


                            <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-400">
                                <Video size={15} />
                                Videos
                            </div>


                            <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-400">
                                <Music2 size={15} />
                                Audio
                            </div>


                            <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs text-slate-400">
                                <FileText size={15} />
                                PDFs
                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {[
                            1,
                            2,
                            3,
                            4
                        ].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="h-56 animate-pulse rounded-2xl border border-white/10 bg-slate-900"
                                />

                            )
                        )}

                    </div>

                )}


                {/* =================================================
                    EMPTY CATEGORIES
                ================================================= */}

                {!loading &&
                categories.length === 0 && (

                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 px-6 py-20 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">

                            <Folder
                                size={30}
                            />

                        </div>


                        <h2 className="mt-5 text-xl font-semibold">
                            No categories yet
                        </h2>


                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Create a category and start adding your gallery files.
                        </p>


                        <button
                            type="button"
                            onClick={
                                openCreateCategory
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                        >

                            <Plus
                                size={18}
                            />

                            Create Category

                        </button>

                    </div>

                )}


                {/* =================================================
                    CATEGORY GRID
                ================================================= */}

                {!loading &&
                categories.length > 0 && (

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {categories.map(
                            (category) => {

                                const count =
                                    getCategoryCount(
                                        category._id
                                    );


                                return (

                                    <div
                                        key={
                                            category._id
                                        }
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70"
                                    >

                                        <div className="p-5">

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">

                                                        <Folder
                                                            size={24}
                                                        />

                                                    </div>


                                                    <div className="min-w-0">

                                                        <h3 className="truncate text-base font-semibold">
                                                            {
                                                                category.name
                                                            }
                                                        </h3>


                                                        <p className="mt-1 text-xs text-slate-500">

                                                            {count}

                                                            {" "}

                                                            file
                                                            {count === 1
                                                                ? ""
                                                                : "s"}

                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="flex items-center gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditCategory(
                                                                category
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                                                        title="Edit"
                                                    >

                                                        <Pencil
                                                            size={16}
                                                        />

                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteCategory(
                                                                category
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                                                        title="Delete"
                                                    >

                                                        <Trash2
                                                            size={16}
                                                        />

                                                    </button>

                                                </div>

                                            </div>


                                            <p className="mt-5 min-h-10 line-clamp-2 text-sm leading-5 text-slate-400">

                                                {
                                                    category.description
                                                        ? category.description
                                                        : "No description added."
                                                }

                                            </p>


                                            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                                                <span className="text-xs text-slate-500">
                                                    Files
                                                </span>

                                                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                                    {count}
                                                </span>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="grid grid-cols-2 border-t border-white/10">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openViewFilesModal(
                                                        category
                                                    )
                                                }
                                                className="flex items-center justify-center gap-2 border-r border-white/10 bg-slate-950/50 px-4 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                                            >

                                                <FolderOpen
                                                    size={17}
                                                />

                                                View Files

                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openAddFilesModal(
                                                        category
                                                    )
                                                }
                                                className="flex items-center justify-center gap-2 bg-slate-950/50 px-4 py-3.5 text-sm font-semibold text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                                            >

                                                <Plus
                                                    size={17}
                                                />

                                                Add Files

                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}


                {/* =================================================
                    UNCATEGORIZED
                ================================================= */}

                {!loading &&
                uncategorizedCount > 0 && (

                    <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-5">

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-semibold">
                                    Uncategorized Files
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Files that are not assigned to a category.
                                </p>

                            </div>


                            <span className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">

                                {uncategorizedCount}

                                {" "}

                                file
                                {uncategorizedCount === 1
                                    ? ""
                                    : "s"}

                            </span>

                        </div>

                    </div>

                )}

            </main>


            {/* =====================================================
                CREATE / EDIT CATEGORY MODAL
            ===================================================== */}

            {showCategoryModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                            <div>

                                <h2 className="text-lg font-semibold">

                                    {
                                        editingCategory
                                            ? "Edit Category"
                                            : "Create Category"
                                    }

                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    {
                                        editingCategory
                                            ? "Update category information."
                                            : "Create a category for your gallery files."
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeCategoryModal
                                }
                                disabled={
                                    savingCategory
                                }
                                className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleCategorySubmit
                            }
                            className="space-y-5 p-6"
                        >

                            <div>

                                <label
                                    htmlFor="category-name"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Category Name
                                </label>


                                <input
                                    id="category-name"
                                    type="text"
                                    value={
                                        categoryName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCategoryName(
                                            event.target.value
                                        )
                                    }
                                    maxLength={50}
                                    placeholder="Example: Family"
                                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/30"
                                />


                                <p className="mt-2 text-right text-xs text-slate-600">
                                    {categoryName.length}/50
                                </p>

                            </div>


                            <div>

                                <label
                                    htmlFor="category-description"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Description

                                    <span className="ml-2 text-xs text-slate-600">
                                        Optional
                                    </span>

                                </label>


                                <textarea
                                    id="category-description"
                                    value={
                                        categoryDescription
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCategoryDescription(
                                            event.target.value
                                        )
                                    }
                                    maxLength={200}
                                    rows={4}
                                    placeholder="Example: Family photos and videos"
                                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/30"
                                />


                                <p className="mt-2 text-right text-xs text-slate-600">
                                    {categoryDescription.length}/200
                                </p>

                            </div>


                            <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        closeCategoryModal
                                    }
                                    disabled={
                                        savingCategory
                                    }
                                    className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:bg-white/5"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        savingCategory
                                    }
                                    className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
                                >

                                    {savingCategory && (

                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />

                                    )}


                                    {
                                        savingCategory
                                            ? "Saving..."
                                            : editingCategory
                                                ? "Update"
                                                : "Create"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                ADD FILES MODAL
            ===================================================== */}

            {showAddFilesModal &&
            selectedCategory && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">

                    <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">

                            <div>

                                <h2 className="text-lg font-semibold">
                                    Add Files
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    Add files to{" "}

                                    <span className="font-medium text-slate-300">

                                        {
                                            selectedCategory.name
                                        }

                                    </span>

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeAddFilesModal
                                }
                                disabled={
                                    processingFiles
                                }
                                className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        {/* TABS */}

                        <div className="flex border-b border-white/10 px-5">

                            <button
                                type="button"
                                onClick={() =>
                                    setAddFilesTab(
                                        "gallery"
                                    )
                                }
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                                    addFilesTab ===
                                    "gallery"
                                        ? "border-indigo-500 text-white"
                                        : "border-transparent text-slate-500"
                                }`}
                            >

                                <FolderOpen
                                    size={17}
                                />

                                My Gallery

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    setAddFilesTab(
                                        "device"
                                    )
                                }
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                                    addFilesTab ===
                                    "device"
                                        ? "border-indigo-500 text-white"
                                        : "border-transparent text-slate-500"
                                }`}
                            >

                                <HardDrive
                                    size={17}
                                />

                                Device / Browser

                            </button>

                        </div>


                        {/* BODY */}

                        <div className="min-h-0 flex-1 overflow-y-auto">


                            {/* =================================================
                                MY GALLERY
                            ================================================= */}

                            {addFilesTab ===
                            "gallery" && (

                                <div className="p-5">

                                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                                        <div className="relative w-full lg:max-w-md">

                                            <Search
                                                size={18}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                                            />


                                            <input
                                                type="text"
                                                value={
                                                    gallerySearch
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setGallerySearch(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Search gallery files..."
                                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-10 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/20"
                                            />

                                        </div>


                                        <div className="flex flex-wrap items-center gap-2">

                                            <button
                                                type="button"
                                                onClick={
                                                    selectAllVisible
                                                }
                                                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                                            >
                                                Select Visible
                                            </button>


                                            <button
                                                type="button"
                                                onClick={
                                                    clearSelection
                                                }
                                                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                                            >
                                                Clear
                                            </button>


                                            <span className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-400">

                                                {
                                                    selectedLocalIds.length
                                                }

                                                {" "}

                                                selected

                                            </span>

                                        </div>

                                    </div>


                                    {galleryFiles.length === 0 && (

                                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-5 py-16 text-center">

                                            <FolderOpen
                                                size={42}
                                                className="mx-auto text-slate-700"
                                            />

                                            <h3 className="mt-4 text-base font-semibold">
                                                No files available
                                            </h3>

                                            <p className="mt-2 text-sm text-slate-500">
                                                Upload a file in My Files, Camera or Audio Recorder first.
                                            </p>

                                        </div>

                                    )}


                                    {galleryFiles.length > 0 && (

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                            {galleryFiles.map(
                                                (file) => {

                                                    const selected =
                                                        selectedLocalIds.includes(
                                                            file.localFileId
                                                        );


                                                    return (

                                                        <div
                                                            key={
                                                                file.localFileId
                                                            }
                                                            className={`overflow-hidden rounded-2xl border ${
                                                                selected
                                                                    ? "border-indigo-500 bg-indigo-500/10"
                                                                    : "border-white/10 bg-slate-950/50"
                                                            }`}
                                                        >

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleLocalFile(
                                                                        file.localFileId
                                                                    )
                                                                }
                                                                className="block w-full text-left"
                                                            >

                                                                <div className="relative">

                                                                    <CategoryFilePreview
                                                                        file={
                                                                            file
                                                                        }
                                                                    />


                                                                    <div
                                                                        className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border ${
                                                                            selected
                                                                                ? "border-indigo-400 bg-indigo-500 text-white"
                                                                                : "border-white/20 bg-black/60 text-transparent"
                                                                        }`}
                                                                    >

                                                                        <Check
                                                                            size={16}
                                                                        />

                                                                    </div>

                                                                </div>


                                                                <div className="p-3">

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

                                                                    </p>

                                                                </div>

                                                            </button>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </div>

                            )}


                            {/* =================================================
                                DEVICE
                            ================================================= */}

                            {addFilesTab ===
                            "device" && (

                                <div className="p-5">

                                    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/50 px-5 py-16 text-center">

                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">

                                            <Upload
                                                size={29}
                                            />

                                        </div>


                                        <h3 className="mt-5 text-lg font-semibold">
                                            Choose files from your device
                                        </h3>


                                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                            Select images, videos, audio files or PDFs. Multiple files and folders are supported.
                                        </p>


                                        <div className="mt-7 flex flex-wrap justify-center gap-3">

                                            <button
                                                type="button"
                                                onClick={
                                                    openFilePicker
                                                }
                                                disabled={
                                                    processingFiles
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
                                            >

                                                <Smartphone
                                                    size={18}
                                                />

                                                Choose Files

                                            </button>


                                            <button
                                                type="button"
                                                onClick={
                                                    openFolderPicker
                                                }
                                                disabled={
                                                    processingFiles
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                                            >

                                                <FolderOpen
                                                    size={18}
                                                />

                                                Choose Folder

                                            </button>

                                        </div>


                                        {processingFiles && (

                                            <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-400">

                                                <LoaderCircle
                                                    size={18}
                                                    className="animate-spin"
                                                />

                                                Adding files...

                                            </div>

                                        )}


                                        <div className="mt-8 flex flex-wrap justify-center gap-2">

                                            <span className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-500">
                                                Images
                                            </span>

                                            <span className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-500">
                                                Videos
                                            </span>

                                            <span className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-500">
                                                Audio
                                            </span>

                                            <span className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-500">
                                                PDFs
                                            </span>

                                        </div>

                                    </div>


                                    <div className="mt-5 rounded-2xl border border-yellow-400/10 bg-yellow-400/5 p-4">

                                        <p className="text-sm leading-6 text-slate-400">
                                            The browser can only give this website files after you choose them. The app cannot silently scan your whole device.
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* FOOTER */}

                        {addFilesTab ===
                            "gallery" && (

                            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-xs text-slate-500">

                                    {
                                        selectedLocalIds.length
                                    }

                                    {" "}

                                    selected

                                </p>


                                <div className="flex justify-end gap-3">

                                    <button
                                        type="button"
                                        onClick={
                                            closeAddFilesModal
                                        }
                                        disabled={
                                            processingFiles
                                        }
                                        className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            assignExistingFiles
                                        }
                                        disabled={
                                            processingFiles ||
                                            selectedLocalIds.length === 0
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                                    >

                                        {
                                            processingFiles
                                                ? "Adding..."
                                                : "Add to " +
                                                  selectedCategory.name
                                        }

                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* =====================================================
                VIEW FILES MODAL
            ===================================================== */}

            {showViewFilesModal &&
            viewingCategory && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">

                    <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">

                                    <Folder
                                        size={20}
                                    />

                                </div>


                                <div>

                                    <h2 className="text-lg font-semibold">

                                        {
                                            viewingCategory.name
                                        }

                                    </h2>


                                    <p className="mt-1 text-sm text-slate-500">

                                        {categoryFiles.length}

                                        {" "}

                                        file
                                        {categoryFiles.length === 1
                                            ? ""
                                            : "s"}

                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeViewFilesModal
                                }
                                className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        {/* FILES */}

                        <div className="min-h-0 flex-1 overflow-y-auto p-5">

                            {categoryFiles.length === 0 && (

                                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                                    <FolderOpen
                                        size={55}
                                        className="text-slate-700"
                                    />

                                    <h3 className="mt-5 text-lg font-semibold">
                                        No files in this category
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Add files and they will appear here.
                                    </p>

                                </div>

                            )}


                            {categoryFiles.length > 0 && (

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                                    {categoryFiles.map(
                                        (file) => (

                                            <CategoryFileCard
                                                key={
                                                    file.localFileId
                                                }
                                                file={
                                                    file
                                                }
                                                onOpen={
                                                    handleOpenFile
                                                }
                                                onDownload={
                                                    handleDownloadFile
                                                }
                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                HIDDEN INPUTS
            ===================================================== */}

            <input
                ref={
                    fileInputRef
                }
                type="file"
                multiple
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={
                    handleFileInputChange
                }
                className="hidden"
            />


            <input
                ref={
                    folderInputRef
                }
                type="file"
                multiple
                webkitdirectory=""
                directory=""
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={
                    handleFileInputChange
                }
                className="hidden"
            />

        </div>

    );
};


export default Category;
