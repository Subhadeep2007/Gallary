import {
  Image,
  Video,
  FileText,
  Music2,
  Star,
  Upload,
  FolderOpen,
  Clock3,
  ArrowRight,
  MoreHorizontal,
  HardDrive,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import {
  getAllFiles,
  getFileCounts,
} from "../../services/storage/db.js";

const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    images: 0,
    videos: 0,
    audio: 0,
    documents: 0,
    favorites: 0,
  });

  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // GET USER ID
  // ========================================

  const getUserId = () => {
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

  // ========================================
  // FORMAT FILE SIZE
  // ========================================

  const formatFileSize = (size) => {
    if (!size || size === 0) {
      return "0 Bytes";
    }

    if (size < 1024) {
      return `${size} Bytes`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ========================================
  // FILE ICON
  // ========================================

  const getFileIcon = (fileType) => {
    if (fileType === "image") {
      return Image;
    }

    if (fileType === "video") {
      return Video;
    }

    return FileText;
  };

  // ========================================
  // FILE ICON STYLE
  // ========================================

  const getFileIconClass = (fileType) => {
    if (fileType === "image") {
      return "bg-indigo-500/10 text-indigo-400";
    }

    if (fileType === "video") {
      return "bg-purple-500/10 text-purple-400";
    }

    return "bg-red-500/10 text-red-400";
  };

  // ========================================
  // LOAD DASHBOARD DATA
  // ========================================

  const loadGalleryData = async () => {
    const userId = getUserId();

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const counts = await getFileCounts(userId);
      const files = await getAllFiles(userId);

      const audioCount = files.filter((file) => {
        return file.fileType === "audio";
      }).length;

      setStats({
        images: counts.images || 0,
        videos: counts.videos || 0,
        audio: audioCount,
        documents: counts.pdfs || 0,
        favorites: counts.favorites || 0,
      });

      const sortedFiles = [...files].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      });

      setRecentFiles(sortedFiles.slice(0, 5));
    } catch (error) {
      console.error("Failed to load gallery data:", error);

      setStats({
        images: 0,
        videos: 0,
        audio: 0,
        documents: 0,
        favorites: 0,
      });

      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD ON PAGE OPEN
  // ========================================

  useEffect(() => {
    loadGalleryData();
  }, [user]);

  // ========================================
  // STATS
  // ========================================

  const statsData = [
    {
      title: "Images",
      value: stats.images,
      icon: Image,
      text: "Photos stored",
      iconClass: "bg-indigo-500/10 text-indigo-400",
    },
    {
      title: "Videos",
      value: stats.videos,
      icon: Video,
      text: "Videos stored",
      iconClass: "bg-purple-500/10 text-purple-400",
    },
    {
      title: "Audio",
      value: stats.audio,
      icon: Music2,
      text: "Audio stored",
      iconClass: "bg-pink-500/10 text-pink-400",
    },
    {
      title: "Documents",
      value: stats.documents,
      icon: FileText,
      text: "PDFs & files",
      iconClass: "bg-red-500/10 text-red-400",
    },
    {
      title: "Favorites",
      value: stats.favorites,
      icon: Star,
      text: "Saved favorites",
      iconClass: "bg-yellow-500/10 text-yellow-400",
    },
  ];

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="mx-auto max-w-7xl">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-400">
            Welcome back 👋
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Your Gallery
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your photos, videos and documents from one place.
          </p>
        </div>

        <button
          onClick={() => navigate("/gallery/files")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
        >
          <Upload size={18} />
          Upload Files
        </button>
      </div>

      {/* ========================================
          STATS
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statsData.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-white">
                    {loading ? "..." : stat.value}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {stat.text}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================
          STORAGE INFO
      ======================================== */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <HardDrive size={19} />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Private Local Storage
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your gallery files are stored locally for offline-friendly access.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================
          UPLOAD AREA
      ======================================== */}

      <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 sm:p-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400">
            <Upload size={28} />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Add files to your gallery
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
            Upload images, videos and PDF documents. Your gallery is designed
            for private storage and offline-friendly access.
          </p>

          <button
            onClick={() => navigate("/gallery/files")}
            className="mt-6 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Open My Files
          </button>
        </div>
      </div>

      {/* ========================================
          RECENT ACTIVITY
      ======================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ========================================
            RECENT FILES
        ======================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 lg:col-span-2">

          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-400" />

              <h2 className="font-semibold text-white">
                Recent Files
              </h2>
            </div>

            <button
              onClick={() => navigate("/gallery/files")}
              className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="p-4 sm:p-5">

            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading recent files...
                  </p>
                </div>
              </div>
            ) : recentFiles.length === 0 ? (
              <div className="flex min-h-56 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                    <FolderOpen size={24} />
                  </div>

                  <h3 className="font-medium text-slate-300">
                    No files yet
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your recently uploaded files will appear here.
                  </p>

                  <button
                    onClick={() => navigate("/gallery/files")}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Upload your first file
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => {
                  const FileIcon = getFileIcon(file.fileType);

                  return (
                    <button
                      key={file.localFileId}
                      onClick={() => navigate("/gallery/files")}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-left transition hover:border-slate-700 hover:bg-slate-800/70"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getFileIconClass(file.fileType)}`}
                      >
                        <FileIcon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {file.fileName}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>
                            {formatFileSize(file.size)}
                          </span>

                          <span>•</span>

                          <span>
                            {formatDate(file.createdAt)}
                          </span>

                          {file.isFavorite ? (
                            <>
                              <span>•</span>

                              <Star
                                size={12}
                                className="fill-yellow-400 text-yellow-400"
                              />
                            </>
                          ) : null}
                        </div>
                      </div>

                      <MoreHorizontal
                        size={18}
                        className="shrink-0 text-slate-500"
                      />
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ========================================
            QUICK ACTIONS
        ======================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <h2 className="font-semibold text-white">
            Quick Actions
          </h2>

          <div className="mt-4 space-y-3">

            {/* Upload */}
            <button
              onClick={() => navigate("/gallery/files")}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400">
                <Upload size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Upload Files
                </p>

                <p className="text-xs text-slate-500">
                  Add new files
                </p>
              </div>
            </button>

            {/* Favorites */}
            <button
              onClick={() => navigate("/gallery/favorites")}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
                <Star size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Favorites
                </p>

                <p className="text-xs text-slate-500">
                  View saved files
                </p>
              </div>
            </button>

            {/* Trash */}
            <button
              onClick={() => navigate("/gallery/trash")}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <FolderOpen size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Trash
                </p>

                <p className="text-xs text-slate-500">
                  Restore deleted files
                </p>
              </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Gallery;