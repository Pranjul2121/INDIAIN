import { useState, useRef } from "react";
import API from "../services/api";

export default function ResumeUpload({ setResumeText }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("idle"); // 'idle' | 'success' | 'error'
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const upload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setStatus("idle");

      const form = new FormData();
      form.append("file", file);

      // 🔥 API call
      const res = await API.post("/upload-resume", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ IMPORTANT: backend se text lena
      const extractedText = res.data.text;

      // ✅ parent ko bhejna (Dashboard)
      if (setResumeText) {
        setResumeText(extractedText);
      }

      setStatus("success");
      setFile(null);

    } catch (error) {
      console.error("Upload failed", error);
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full font-sans">
      
      {/* Upload Zone */}
      <div 
        onClick={() => !file && fileInputRef.current.click()}
        className={`relative w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 text-center
          ${file 
            ? "border-indigo-200 bg-indigo-50/30" 
            : "border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-400 cursor-pointer group"
          }`}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />

        {!file ? (
          <>
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-200 transition-all duration-300">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p className="text-slate-700 font-bold mb-1">Click to upload your resume</p>
            <p className="text-slate-500 text-sm font-medium">PDF, DOCx (Max 5MB)</p>
          </>
        ) : (
          <div className="w-full flex items-center justify-between bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                📄
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                <p className="text-xs font-medium text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button onClick={clearFile}>❌</button>
          </div>
        )}
      </div>

      {/* Status */}
      {status === 'success' && (
        <div className="mt-4 text-green-600 font-bold">
          ✅ Resume uploaded & analyzed!
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 text-red-600 font-bold">
          ❌ Upload failed
        </div>
      )}

      {/* Button */}
      <div className="mt-auto pt-6">
        <button
          onClick={upload}
          disabled={!file || isUploading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl"
        >
          {isUploading ? "Uploading..." : "Analyze My Resume"}
        </button>
      </div>

    </div>
  );
}