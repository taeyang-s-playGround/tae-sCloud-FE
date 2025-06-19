import React, { useState, useRef, useEffect } from "react";

// Declare tus as a global variable available on the window object
// Provide a more specific type declaration for the tus object
declare global {
  namespace tus {
    interface UploadOptions {
      endpoint: string;
      chunkSize?: number;
      retryDelays?: number[];
      metadata?: { [key: string]: string };
      onError?: (error: Error) => void;
      onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
      onSuccess?: () => void;
      // Add other options as needed from tus-js-client documentation
    }

    class Upload {
      constructor(file: File, options: UploadOptions);
      findPreviousUploads: () => Promise<any[]>;
      resumeFromPreviousUpload: (previousUpload: any) => void;
      start: () => void;
      abort: () => void;
      // Add other methods/properties as needed
    }
  }

  interface Window {
    tus: typeof tus; // Reference the declared namespace
  }
}

// Inline SVG components to replace lucide-react icons
const UploadCloud = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 14.899A7 7 0 0 1 15 12h3a5 5 0 0 1 0 10H8a7 7 0 0 1-4-12.101Z" />
    <path d="M12 16v6" />
    <path d="m16 20-4-4-4 4" />
  </svg>
);

const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const AlertCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const Loader = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" x2="12" y1="2" y2="6" />
    <line x1="12" x2="12" y1="18" y2="22" />
    <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
    <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
    <line x1="2" x2="6" y1="12" y2="12" />
    <line x1="18" x2="22" y1="12" y2="12" />
    <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
    <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
  </svg>
);

const FileText = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

// Helper function to format bytes into a human-readable string
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

interface UploadedFile {
  id: string;
  file: File;
  upload: tus.Upload | null; // Now using the tus.Upload type from the global declaration
  progress: number;
  status: "pending" | "in-progress" | "success" | "error";
  message: string;
  uploadSpeed: string;
}

const FileUpload: React.FC = () => {
  const [filesToUpload, setFilesToUpload] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTusClientLoaded, setIsTusClientLoaded] = useState(false);

  // Load tus-js-client via CDN if not already present
  useEffect(() => {
    if (!window.tus && !document.getElementById("tus-js-client-script")) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/tus-js-client@3.0.0-0/dist/tus.min.js";
      script.id = "tus-js-client-script";
      script.onload = () => setIsTusClientLoaded(true);
      script.onerror = () =>
        console.error("Failed to load tus-js-client script.");
      document.head.appendChild(script);
    } else if (window.tus) {
      setIsTusClientLoaded(true);
    }
  }, []);

  // Handles file selection from the input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: file.name + "-" + file.size + "-" + Date.now(), // Unique ID for each file
        file,
        upload: null, // tus.Upload instance will be set later
        progress: 0,
        status: "pending",
        message: "",
        uploadSpeed: "0 B/s",
      }));
      setFilesToUpload((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Initiates the upload for a specific file
  const startUpload = (fileId: string) => {
    if (!isTusClientLoaded || !window.tus) {
      console.error("tus-js-client is not loaded yet.");
      setFilesToUpload((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", message: "Tus 클라이언트 로드 실패" }
            : f
        )
      );
      return;
    }

    setFilesToUpload((prevFiles) =>
      prevFiles.map((fileData) => {
        if (fileData.id === fileId && fileData.status === "pending") {
          const upload = new window.tus.Upload(fileData.file, {
            //endpoint: "http://localhost:8080/api/tus/file/upload",
            endpoint: "https://nuneddine.xquare.app/api/tus/file/upload",
            chunkSize: 50 * 1024 * 1024, // 50MB chunks
            retryDelays: [0, 1000, 3000, 5000],
            metadata: {
              filename: fileData.file.name,
              filetype: fileData.file.type,
            },
            onError: (error: Error) => {
              // Explicitly type error
              console.error("Upload failed:", error);
              setFilesToUpload((prev) =>
                prev.map((f) =>
                  f.id === fileId
                    ? {
                        ...f,
                        status: "error",
                        message: `업로드 실패: ${error.message}`,
                      }
                    : f
                )
              );
            },
            onProgress: (bytesUploaded: number, bytesTotal: number) => {
              // Explicitly type parameters
              const percentage = parseFloat(
                ((bytesUploaded / bytesTotal) * 100).toFixed(2)
              );
              setFilesToUpload((prev) =>
                prev.map((f) =>
                  f.id === fileId
                    ? {
                        ...f,
                        progress: percentage,
                        status: "in-progress",
                        message: `업로드 중... ${formatBytes(
                          bytesUploaded
                        )} / ${formatBytes(bytesTotal)}`,
                        // tus-js-client doesn't directly provide speed, can calculate if needed
                      }
                    : f
                )
              );
            },
            onSuccess: () => {
              setFilesToUpload((prev) =>
                prev.map((f) =>
                  f.id === fileId
                    ? {
                        ...f,
                        progress: 100,
                        status: "success",
                        message: "파일 저장 완료",
                      }
                    : f
                )
              );
              // Clear the input after successful upload if desired
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            },
          });

          // Attempt to resume if a previous upload exists
          upload
            .findPreviousUploads()
            .then((previousUploads: any[]) => {
              // Explicitly type previousUploads
              if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0]);
              }
              upload.start();
            })
            .catch((error: Error) => {
              // Explicitly type error
              console.error("Failed to find previous uploads or start:", error);
              setFilesToUpload((prev) =>
                prev.map((f) =>
                  f.id === fileId
                    ? {
                        ...f,
                        status: "error",
                        message: `업로드 시작 실패: ${error.message}`,
                      }
                    : f
                )
              );
            });

          return {
            ...fileData,
            upload,
            status: "in-progress",
            message: "업로드 시작 중...",
          };
        }
        return fileData;
      })
    );
  };

  // Resets the state, clearing all selected files and progress
  const resetAllUploads = () => {
    filesToUpload.forEach((fileData) => {
      if (fileData.upload && fileData.status === "in-progress") {
        fileData.upload.abort(); // Abort active uploads
      }
    });
    setFilesToUpload([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans antialiased flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <UploadCloud className="w-16 h-16 text-teal-600 mx-auto mb-4 animate-bounce-y-slow" />
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            파일 업로드 센터
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            안전하고 효율적으로 파일을 클라우드에 저장하세요.
          </p>
        </div>

        {/* File Input Section */}
        <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 text-center bg-teal-50/50 transition-all duration-300 hover:bg-teal-100 hover:border-teal-400 cursor-pointer">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
            multiple // Allow multiple file selection
            ref={fileInputRef}
            disabled={!isTusClientLoaded} // Disable if tus client not loaded
          />
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center justify-center p-4"
          >
            <UploadCloud className="w-16 h-16 text-teal-500 mb-4 animate-pulse-slow" />
            <span className="text-gray-700 text-lg font-semibold">
              {isTusClientLoaded
                ? "클릭하여 파일을 선택하거나 여기에 드래그앤드롭하세요"
                : "Tus 클라이언트 로드 중..."}
            </span>
            <span className="text-sm text-gray-500 mt-2">
              최대 파일 크기: 무제한 (Tus는 대용량 파일에 최적화되어 있습니다.)
            </span>
          </label>
        </div>

        {/* File List and Progress Section */}
        {filesToUpload.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              업로드 대기/진행 중인 파일 ({filesToUpload.length})
            </h2>
            {filesToUpload.map((fileData) => (
              <div
                key={fileData.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex items-center space-x-4 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg"
              >
                <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-lg">
                    {fileData.file.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    파일 크기: {formatBytes(fileData.file.size)}
                  </p>
                  {fileData.status !== "pending" && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3 relative overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          fileData.status === "success"
                            ? "bg-green-500"
                            : fileData.status === "error"
                            ? "bg-red-500"
                            : "bg-teal-500"
                        }`}
                        style={{ width: `${fileData.progress}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
                        {fileData.status === "in-progress" &&
                          `${fileData.progress.toFixed(2)}%`}
                        {fileData.status === "success" && "완료"}
                        {fileData.status === "error" && "실패"}
                      </span>
                    </div>
                  )}
                  <p
                    className={`text-sm mt-2 font-medium ${
                      fileData.status === "success"
                        ? "text-green-600"
                        : fileData.status === "error"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {fileData.message ||
                      (fileData.status === "pending"
                        ? "업로드 대기 중..."
                        : "")}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {fileData.status === "pending" && (
                    <button
                      onClick={() => startUpload(fileData.id)}
                      className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-colors duration-200"
                      disabled={!isTusClientLoaded} // Disable if tus client not loaded
                    >
                      <UploadCloud className="inline-block mr-2 w-5 h-5" />
                      업로드
                    </button>
                  )}
                  {fileData.status === "in-progress" && (
                    <div className="flex items-center space-x-2 text-teal-600">
                      <Loader className="w-6 h-6 animate-spin" />
                      <span>진행 중...</span>
                    </div>
                  )}
                  {fileData.status === "success" && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>성공!</span>
                    </div>
                  )}
                  {fileData.status === "error" && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-6 h-6" />
                      <span>오류!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <button
                onClick={resetAllUploads}
                className="px-8 py-4 bg-rose-600 text-white font-semibold rounded-xl shadow-lg hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-500 focus:ring-opacity-50 transition-all duration-300"
              >
                <AlertCircle className="inline-block mr-3 w-6 h-6" />
                모두 지우기
              </button>
            </div>
          </div>
        )}

        {filesToUpload.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <FileText className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <p className="text-xl">업로드할 파일을 선택해주세요.</p>
            <p className="text-md mt-2">강태양의 프로젝트 실무 프로젝트</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
