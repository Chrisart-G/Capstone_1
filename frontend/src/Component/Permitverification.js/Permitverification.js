import React, { useState } from "react";
import {
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8081";

const PermitVerification = () => {
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [decodeLoading, setDecodeLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [docHint, setDocHint] = useState(null); 

  const resetState = () => {
    setError("");
    setResult(null);
  };

  const verifyByUid = async (value) => {
    const trimmed = (value || uid).trim();
    if (!trimmed) {
      setError("Please enter the Application UID from the QR code.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/verification/any-json/${encodeURIComponent(
          trimmed
        )}`
      );

      if (!data.success) {
        setError(data.message || "Verification failed.");
      } else {
        setResult(data);
        setUid(data.app_uid || trimmed);
      }
    } catch (err) {
      console.error("verify error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to verify the document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = async (e) => {
    e.preventDefault();
    await verifyByUid(uid);
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetState();
    setDecodeLoading(true);

    try {
      const formData = new FormData();
      formData.append("qr", file);

      const { data } = await axios.post(
        `${API_BASE_URL}/api/verification/upload-qr`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!data.success) {
        setError(data.message || "Unable to read QR from the image.");
      } else {
        // QR decoded, set UID and immediately verify
        setUid(data.app_uid || "");
        await verifyByUid(data.app_uid);
      }
    } catch (err) {
      console.error("QR upload error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to decode the QR image. Please try another image."
      );
    } finally {
      setDecodeLoading(false);
      // allows re-uploading same file
      e.target.value = "";
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-0 md:px-0"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Full-screen card */}
      <div className="w-full h-screen grid md:grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-none md:rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - same style as login */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-white" />

          <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-black">
            <img
              src="/img/logo.png"
              alt="Municipality of Hinigaran Seal"
              className="h-60 w-30"
            />
            <div className="mt-4 text-center">
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-black">
                Municipality of Hinigaran
              </p>
              <p className="text-[11px] md:text-xs text-black mt-1">
                Province of Negros Occidental, Philippines
              </p>
            </div>

            <p className="mt-6 max-w-sm text-[11px] md:text-xs text-black text-center leading-relaxed">
              Verify municipal permits and official documents using their secure
              QR codes.
            </p>
          </div>
        </div>

        {/* Right Side - Verification UI */}
        <div className="bg-white px-6 py-8 md:px-8 md:py-10 flex flex-col justify-center max-h-screen overflow-y-auto">
          {/* Logo for mobile */}
          <div className="md:hidden flex flex-col items-center mb-4">
            <img
              src="/img/logo.png"
              alt="Municipality of Hinigaran Seal"
              className="h-20 w-20 opacity-80"
            />
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500 text-center">
              Municipality of Hinigaran
            </p>
          </div>

          {/* Header */}
          <div className="mb-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase text-center md:text-left">
              Permit verification
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 text-center md:text-left mt-1 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              Check document authenticity
            </h2>
            <p className="text-xs text-slate-500 mt-1 text-center md:text-left">
              Scan the QR code using any scanner and upload the image, or paste
              the Application UID printed beside the QR.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Result message */}
          {result && result.success && (
            <div className="mt-3 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs">
                    Document verified – {result.doc_kind === "mayors_permit"
                      ? "Mayor’s Permit"
                      : result.doc_kind === "business_lgu_form"
                      ? "Business Permit – LGU Form"
                      : "Permit Document"}
                  </p>
                  <p className="mt-1">
                    {result.label
                      ? `Matched attachment: ${result.label}`
                      : "The QR code corresponds to a valid permit document stored in the Municipal Permits System."}
                  </p>

                  <div className="mt-3 border-t border-emerald-100 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[11px]">
                    <div>
                      <span className="font-semibold">Application UID:</span>{" "}
                      {result.app_uid}
                    </div>
                    <div>
                      <span className="font-semibold">Application type:</span>{" "}
                      {result.application_type}
                    </div>
                    <div>
                      <span className="font-semibold">Business name:</span>{" "}
                      {result.meta?.business_name || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{" "}
                      {result.meta?.status || "Unknown"}
                    </div>
                  </div>

                  {result.file_url && (
                    <a
                      href={result.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium shadow-sm"
                    >
                      <FileText className="h-3 w-3 mr-1.5" />
                      View PDF document
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="mt-4 space-y-4" onSubmit={handleVerifyClick}>
            {/* QR upload */}
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                <Upload className="h-4 w-4 text-slate-400" />
                Upload QR image
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Take a screenshot or photo of the permit’s QR code and upload
                it here. The system will read the QR and verify the document
                automatically.
              </p>
              <div className="mt-2">
                <label className="inline-flex items-center justify-center px-4 py-2.5 border border-dashed border-slate-300 rounded-xl text-[12px] font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition">
                  <Upload className="h-4 w-4 mr-2" />
                  {decodeLoading ? "Reading QR..." : "Choose QR image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* UID input */}
            <div>
              <label
                htmlFor="uid"
                className="text-xs font-medium text-slate-700 flex items-center justify-between"
              >
                <span>Application UID</span>
                <span className="text-[11px] text-slate-400">
                  Example: APP-BUSINESS-123-1a2b3c
                </span>
              </label>
              <div className="relative mt-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="uid"
                  type="text"
                  value={uid}
                  onChange={(e) => {
                    setUid(e.target.value);
                    setError("");
                    setResult(null);
                  }}
                  placeholder="Paste or type the Application UID from the QR"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Verify button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || decodeLoading}
                className={`w-full inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-md transition ${
                  loading || decodeLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1`}
              >
                {loading || decodeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Verify document
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footnote */}
          <p className="mt-4 text-[10px] text-center text-slate-400">
            This tool only confirms permits that were generated and stored in
            the Municipal Permits System.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermitVerification;
