"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, forgotPassword } from "../../src/services/authService";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();

  const [isResetMode, setIsResetMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isResetMode) {
      if (!resetEmail.trim()) {
        Swal.fire({
          title: "Email Required",
          text: "Please enter your registered email address.",
          icon: "warning",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#f59e0b",
        });
        setLoading(false);
        return;
      }

      try {
        await forgotPassword(resetEmail);
        Swal.fire({
          title: "Temporary Password Sent!",
          text: "We have generated and emailed a temporary password to you. Please check your inbox and spam folder.",
          icon: "success",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
        });
        setIsResetMode(false);
      } catch (error) {
        console.error(error);
        const errMsg =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || "Could not complete the password reset request.";
        Swal.fire({
          title: "Reset Request Failed",
          text: errMsg,
          icon: "error",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await login(formData);
        localStorage.setItem("token", response.token);

        Swal.fire({
          title: "Welcome Back!",
          text: "Logged in successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#0f172a",
          color: "#ffffff",
        });

        router.push("/admin");
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Login Failed",
          text: "Invalid email or password credentials.",
          icon: "error",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
        
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {isResetMode ? "Reset Password" : "Admin Login"}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {isResetMode 
              ? "Enter your email. If it exists in our records, we will send a temporary password." 
              : "Access the developer portfolio control panel."}
          </p>
        </div>

        {isResetMode ? (
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        ) : (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
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
              required
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-colors"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 text-black py-3.5 rounded-xl font-bold hover:scale-[1.01] hover:bg-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : (isResetMode ? "Request Reset Password" : "Login")}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsResetMode(!isResetMode);
              setResetEmail("");
            }}
            className="text-cyan-400 hover:underline text-sm font-semibold bg-transparent border-none cursor-pointer"
          >
            {isResetMode ? "Back to Login" : "Forgot Password?"}
          </button>
        </div>
      </form>
    </div>
  );
}