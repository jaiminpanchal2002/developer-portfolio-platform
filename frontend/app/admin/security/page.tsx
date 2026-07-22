"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { ShieldCheck, ShieldOff, Copy } from "lucide-react";
import Swal from "sweetalert2";

import {
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
} from "@/services/authService";

type Phase = "idle" | "setup";

export default function SecurityPage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await getTwoFactorStatus();
        if (!cancelled) setEnabled(status.enabled);
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

  const beginSetup = async () => {
    setBusy(true);
    try {
      const { secret: s, otpauthUrl } = await setupTwoFactor();
      setSecret(s);
      setQrDataUrl(
        await QRCode.toDataURL(otpauthUrl, { width: 220, margin: 1 })
      );
      setPhase("setup");
      setCode("");
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Could not start setup",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async () => {
    setBusy(true);
    try {
      await enableTwoFactor(code);
      setEnabled(true);
      setPhase("idle");
      setSecret("");
      setQrDataUrl("");
      Swal.fire({
        title: "Two-factor enabled",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#ffffff",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Invalid code",
        text: "That code didn't match. Make sure your device clock is correct and try the current code.",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    const { value: disableCode } = await Swal.fire({
      title: "Disable two-factor?",
      input: "text",
      inputLabel: "Enter a current 6-digit code to confirm",
      inputAttributes: { maxlength: "6", inputmode: "numeric" },
      showCancelButton: true,
      confirmButtonText: "Disable",
      confirmButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#ffffff",
    });
    if (!disableCode) return;
    setBusy(true);
    try {
      await disableTwoFactor(disableCode);
      setEnabled(false);
      Swal.fire({
        title: "Two-factor disabled",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#ffffff",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Invalid code",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setBusy(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    Swal.fire({
      title: "Secret copied",
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      background: "#0f172a",
      color: "#ffffff",
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Security</h1>
        <p className="text-gray-400 mt-1">
          Protect the admin panel with two-factor authentication
        </p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-500" />
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-2xl p-3 ${
                enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
              }`}
            >
              {enabled ? <ShieldCheck size={24} /> : <ShieldOff size={24} />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                Authenticator app (TOTP)
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {enabled
                  ? "Enabled — you'll be asked for a code from your app at every login."
                  : "Add a second step at login using Google Authenticator, Authy, or 1Password."}
              </p>

              {phase === "idle" && (
                <div className="mt-4">
                  {enabled ? (
                    <button
                      onClick={handleDisable}
                      disabled={busy}
                      className="rounded-xl bg-red-500/10 px-5 py-2.5 font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-60"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={beginSetup}
                      disabled={busy}
                      className="rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60"
                    >
                      {busy ? "Preparing…" : "Enable 2FA"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {phase === "setup" && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <ol className="space-y-5 text-sm text-slate-300">
                <li>
                  <p className="font-semibold">1. Scan this QR code</p>
                  <p className="mt-1 text-slate-400">
                    Open your authenticator app and scan, or enter the key
                    manually.
                  </p>
                  {qrDataUrl && (
                    <div className="mt-3 inline-block rounded-2xl bg-white p-3">
                      {/* Locally generated data URL — safe to render unoptimized */}
                      <Image
                        src={qrDataUrl}
                        alt="Two-factor QR code"
                        width={200}
                        height={200}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <code className="rounded-lg bg-slate-950 px-3 py-2 text-xs tracking-widest text-cyan-300 break-all">
                      {secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                      aria-label="Copy secret"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </li>
                <li>
                  <p className="font-semibold">2. Enter the 6-digit code</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-40 rounded-xl border border-slate-700 bg-slate-800 p-3 text-center text-xl tracking-[0.4em] text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      onClick={confirmEnable}
                      disabled={busy || code.length !== 6}
                      className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-60"
                    >
                      {busy ? "Verifying…" : "Confirm & enable"}
                    </button>
                    <button
                      onClick={() => {
                        setPhase("idle");
                        setSecret("");
                        setQrDataUrl("");
                      }}
                      className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
