"use client";

import React, { useState } from "react";

export default function UnlockPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (!password) {
      setError("Please enter the document password.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const res = await fetch("/api/unlock-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unlock PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^/.]+$/, "")}-unlocked.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#111827] border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-800/40">
            <span>✨</span>
            <span>Professional PDF Toolkit</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Unlock PDF</h1>
          <p className="text-slate-400 text-sm">
            Remove password protection from your secure PDF documents easily.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          {/* Drag & Drop File Upload Box */}
          <div className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 transition-colors rounded-2xl p-6 text-center bg-[#0d1322]/80 relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="pdf-upload"
            />
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {file ? file.name : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Protected PDF documents up to 50MB</p>
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Document Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/80 text-red-300 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file || !password}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 text-sm tracking-wide"
          >
            {loading ? "Unlocking PDF..." : "Unlock and Download PDF"}
          </button>
        </form>

        {/* Secure Footer Note */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secure processing • Password decryption verified safely</span>
        </div>

      </div>
    </div>
  );
}