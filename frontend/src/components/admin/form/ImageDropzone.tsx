"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  previewUrl: string | null;
  uploading: boolean;
  onFileSelected: (file: File) => void;
  onClear?: () => void;
  label?: string;
  hint?: string;
}

/** Shared drag-and-drop image upload zone with preview, used across admin
 *  forms instead of each one rolling its own bare `<input type="file">`. */
export default function ImageDropzone({ previewUrl, uploading, onFileSelected, onClear, label = "Image", hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--noir-fg-muted)]">{label}</label>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-[var(--noir-accent)] bg-[var(--noir-accent-soft)]"
            : "border-[var(--noir-border-strong)] hover:border-[var(--noir-accent)]/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {previewUrl ? (
          <div className="relative h-40 w-full overflow-hidden rounded-lg">
            <Image src={getImageUrl(previewUrl)} alt="Preview" fill sizes="400px" unoptimized className="object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 size={22} className="animate-spin text-white" />
              </div>
            )}
            {onClear && !uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                aria-label="Remove image"
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <>
            <UploadCloud size={28} className="text-[var(--noir-fg-subtle)]" />
            <p className="text-sm text-[var(--noir-fg-muted)]">
              {uploading ? "Uploading…" : "Drag & drop an image, or click to browse"}
            </p>
          </>
        )}
        {hint && <p className="text-xs text-[var(--noir-fg-subtle)]">{hint}</p>}
      </div>
    </div>
  );
}
