"use client";

import { useEffect, useState } from "react";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "@/services/profileService";

import Image from "next/image";
import { uploadImage } from "@/services/uploadService";
import { getImageUrl } from "@/lib/api";
import { Profile } from "@/types";


export default function ProfilePage() {
  const [profileExists, setProfileExists] =
    useState(false);

  const [preview, setPreview] =
    useState("");

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
      alert("Image upload failed");
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

    try {
      if (profileExists) {
        await updateProfile(normalizedProfile);

        alert(
          "Profile Updated Successfully"
        );
      } else {
        await createProfile(normalizedProfile);

        alert(
          "Profile Created Successfully"
        );
      }

      fetchProfile();
    } catch (error) {
      console.error(error);

      alert("Operation Failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-4xl font-bold mb-8">
        Profile Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          name="fullName"
          placeholder="Full Name"
          value={profile.fullName}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="headline"
          placeholder="Headline"
          value={profile.headline}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <textarea
          name="about"
          placeholder="About"
          rows={5}
          value={profile.about}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="phone"
          placeholder="Phone"
          value={profile.phone}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="location"
          placeholder="Location"
          value={profile.location}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="linkedinUrl"
          placeholder="LinkedIn URL"
          value={profile.linkedinUrl}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="githubUrl"
          placeholder="GitHub URL"
          value={profile.githubUrl}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

        <input
          name="resumeUrl"
          placeholder="Resume URL"
          value={profile.resumeUrl}
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-900 border border-slate-700"
        />

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

          {preview && (
            <Image
              src={preview}
              alt="Profile"
              width={160}
              height={160}
              unoptimized
              className="w-40 h-40 rounded-full object-cover border"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-cyan-500 text-black px-6 py-3 rounded-lg font-semibold"
        >
          {profileExists
            ? "Update Profile"
            : "Create Profile"}
        </button>

      </form>
    </div>
  );
}