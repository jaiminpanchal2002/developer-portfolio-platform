"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Trash2,
  Copy,
  FileText,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  getMediaFiles,
  deleteMediaFile,
  MediaFile,
} from "@/services/mediaService";
import { uploadImage } from "@/services/uploadService";
import { getImageUrl } from "@/lib/api";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const toast = (title: string, icon: "success" | "error") =>
  Swal.fire({
    title,
    icon,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1800,
    background: "#0f172a",
    color: "#ffffff",
  });

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await getMediaFiles();
      setFiles(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMediaFiles();
        if (!cancelled) setFiles(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFiles = useCallback(
    async (list: FileList | File[]) => {
      setUploading(true);
      try {
        for (const file of Array.from(list)) {
          await uploadImage(file);
        }
        await refresh();
        toast("Uploaded", "success");
      } catch (error) {
        console.error(error);
        toast("Upload failed", "error");
      } finally {
        setUploading(false);
      }
    },
    [refresh]
  );

  const handleDelete = async (name: string) => {
    const result = await Swal.fire({
      title: "Delete this file?",
      text: `${name} — anything still referencing it will break.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#ffffff",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMediaFile(name);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      toast("Deleted", "success");
    } catch (error) {
      console.error(error);
      toast("Delete failed", "error");
    }
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(getImageUrl(file.url));
    toast("URL copied", "success");
  };

  const visible = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Media Library</h1>
        <p className="text-gray-400 mt-1">
          Every uploaded asset — drag files in to add more
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files);
        }}
        className={`rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
          dragActive
            ? "border-cyan-500 bg-cyan-500/5"
            : "border-slate-700 bg-slate-900/50"
        }`}
      >
        <UploadCloud size={32} className="mx-auto text-slate-500" />
        <p className="mt-3 text-sm text-slate-400">
          {uploading ? "Uploading…" : "Drag & drop files here, or"}
        </p>
        {!uploading && (
          <label className="mt-2 inline-block cursor-pointer text-sm font-semibold text-cyan-400 hover:underline">
            browse files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search files…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">
          {files.length === 0 ? "No uploads yet." : "Nothing matches that search."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visible.map((file) => (
            <div
              key={file.name}
              className="group rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden"
            >
              <div className="relative aspect-square bg-slate-950">
                {file.image ? (
                  <Image
                    src={getImageUrl(file.url)}
                    alt={file.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText size={32} className="text-slate-600" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-slate-300" title={file.name}>
                  {file.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {formatSize(file.sizeBytes)} ·{" "}
                  {new Date(file.modifiedAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => copyUrl(file)}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700"
                    aria-label={`Copy URL for ${file.name}`}
                  >
                    <Copy size={12} /> URL
                  </button>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/20"
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
