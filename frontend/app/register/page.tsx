"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../src/services/authService";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(formData);

      Swal.fire({
        title: "Registration Successful!",
        text: "Please login with your new credentials.",
        icon: "success",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#06b6d4",
      });

      router.push("/login");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "An error occurred. Check if the email already exists.";
      Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold text-white">
          Register
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 rounded bg-slate-800 text-white"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-slate-800 text-white"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-slate-800 text-white"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-black py-3 rounded font-semibold"
        >
          Register
        </button>

        <p className="text-center text-white">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-cyan-400 hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}