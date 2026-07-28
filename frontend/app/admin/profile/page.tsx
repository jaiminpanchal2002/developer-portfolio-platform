"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "@/services/profileService";

import Image from "next/image";
import { uploadImage } from "@/services/uploadService";
import { getImageUrl } from "@/lib/api";
import { toastError, toastSuccess } from "@/lib/toast";
import { Profile } from "@/types";


/** The upload endpoint always returns a relative "/uploads/xxx" path, but
 *  this field has historically also been hand-typed/pasted, which is how an
 *  absolute dev URL (http://localhost:8080/uploads/...) ended up stored in
 *  production. Stripping back to the relative path here means it self-heals
 *  on the next save regardless of how the bad value got in, and getImageUrl()
 *  already knows how to turn a relative path into the correct absolute URL
 *  for whatever host is actually serving the site. */
function normalizeUploadPath(url?: string): string | undefined {
  if (!url) return url;
  const idx = url.indexOf("/uploads/");
  if (idx !== -1 && /^https?:\/\//i.test(url)) {
    return url.slice(idx);
  }
  return url;
}

export default function ProfilePage() {
  const [profileExists, setProfileExists] =
    useState(false);

  const [preview, setPreview] =
    useState("");

  const [resumeUploading, setResumeUploading] = useState(false);

  const [profile, setProfile] =
    useState<Partial<Profile>>({
      fullName: "",
      headline: "",
      about: "",
      email: "",
      phone: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      resumeUrl: "",
      profileImageUrl: "",
    });

  const fetchProfile = async () => {
    try {
      const data = await getProfile();

      if (data) {
        setProfile(data);

        setPreview(
          getImageUrl(data.profileImageUrl) || ""
        );

        setProfileExists(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setPreview(
      URL.createObjectURL(file)
    );

    try {
      const imageUrl =
        await uploadImage(file);

      setProfile((prev) => ({
        ...prev,
        profileImageUrl:
          imageUrl,
      }));
    } catch (error) {
      console.error(error);
      toastError("Image upload failed");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toastError("Please upload a PDF file");
      return;
    }

    setResumeUploading(true);
    try {
      const url = await uploadImage(file);
      setProfile((prev) => ({ ...prev, resumeUrl: url }));
      toastSuccess("Resume uploaded — click Update Profile to save");
    } catch (error) {
      console.error(error);
      toastError("Resume upload failed");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // Normalize URLs before sending
    const normalizedProfile = { ...profile };
    if (normalizedProfile.githubUrl && !normalizedProfile.githubUrl.startsWith("http")) {
      normalizedProfile.githubUrl = `https://${normalizedProfile.githubUrl}`;
    }
    if (normalizedProfile.linkedinUrl && !normalizedProfile.linkedinUrl.startsWith("http")) {
      normalizedProfile.linkedinUrl = `https://${normalizedProfile.linkedinUrl}`;
    }
    normalizedProfile.resumeUrl = normalizeUploadPath(normalizedProfile.resumeUrl);
    normalizedProfile.profileImageUrl = normalizeUploadPath(normalizedProfile.profileImageUrl);

    try {
      if (profileExists) {
        await updateProfile(normalizedProfile);
        toastSuccess("Profile updated successfully");
      } else {
        await createProfile(normalizedProfile);
        toastSuccess("Profile created successfully");
      }

      fetchProfile();
    } catch (error) {
      console.error(error);
      toastError("Failed to save profile");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-4xl font-bold mb-8">
        Profile Management
      </h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >

        <input
          name="fullName"
          placeholder="Full Name"
          aria-label="Full Name"
          value={profile.fullName}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <input
          name="headline"
          placeholder="Headline"
          aria-label="Headline"
          value={profile.headline}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <textarea
          name="about"
          placeholder="About"
          aria-label="About"
          rows={5}
          value={profile.about}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <input
          name="email"
          placeholder="Email"
          aria-label="Email"
          value={profile.email}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <input
          name="phone"
          placeholder="Phone"
          aria-label="Phone"
          value={profile.phone}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <input
          name="location"
          placeholder="Location"
          aria-label="Location"
          value={profile.location}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <input
          name="linkedinUrl"
          placeholder="LinkedIn URL"
          aria-label="LinkedIn URL"
          value={profile.linkedinUrl}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <input
          name="githubUrl"
          placeholder="GitHub URL"
          aria-label="GitHub URL"
          value={profile.githubUrl}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)]"
        />

        <div className="space-y-2 rounded bg-[var(--noir-bg-elevated)] border border-[var(--noir-border-strong)] p-3">
          <label className="block text-sm font-medium text-[var(--noir-fg-muted)]">
            Resume (PDF)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              className="text-sm text-[var(--noir-fg-muted)]"
            />
            {resumeUploading && (
              <span className="text-xs text-[var(--noir-accent)]">Uploading…</span>
            )}
            {profile.resumeUrl && !resumeUploading && (
              <a
                href={getImageUrl(profile.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--noir-accent)] underline decoration-dotted"
              >
                View current resume
              </a>
            )}
          </div>
          <p className="text-xs text-[var(--noir-fg-subtle)]">
            Or paste a direct link (e.g. an externally hosted PDF):
          </p>
          <input
            name="resumeUrl"
            placeholder="Resume URL"
            aria-label="Resume URL"
            value={profile.resumeUrl}
            onChange={handleChange}
            className="w-full p-2.5 rounded bg-[var(--noir-bg)] border border-[var(--noir-border-strong)] text-sm"
          />
        </div>

        <div className="space-y-4">

          <label className="block">
            Profile Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={
              handleImageUpload
            }
            className="w-full"
          />

          <AnimatePresence mode="wait">
            {preview && (
              <motion.div
                key={preview}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <Image
                  src={preview}
                  alt="Profile"
                  width={160}
                  height={160}
                  unoptimized
                  className="w-40 h-40 rounded-full object-cover border"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-6 py-3 rounded-lg font-semibold"
        >
          {profileExists
            ? "Update Profile"
            : "Create Profile"}
        </motion.button>

      </motion.form>
    </div>
  );
}