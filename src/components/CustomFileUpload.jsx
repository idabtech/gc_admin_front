import { useState } from "react";
import { uploadService } from "../service/upload.service";
import { C } from "./constants/data";
import { Loader2, Camera, X } from "lucide-react";
import { toast } from "sonner";

// Custom File Upload Component - Dark Theme
const CustomFileUpload = ({
    label,
    name,
    value,
    onChange,
    required,
    circular = false,
    height = "120px",
    width = "100%",
    maxWidth = "400px",
    accept = "image/*",
    maxSizeMB = 5,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        console.log('file', file)
        if (!file) return;

        if (!uploadService.isFileTypeAllowed(file)) {
            toast.error("File type not allowed");
            return;
        }

        if (!uploadService.isFileSizeValid(file, maxSizeMB)) {
            toast.error(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const response = await uploadService.uploadFile(file, (progress) => {
                setUploadProgress(progress.percentage);
            });

            onChange(response.url);
            toast.success("File uploaded successfully");
        } catch (error) {
            toast.error(error.message || "Failed to upload file");
            onChange(null);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleRemove = async () => {
        if (typeof value === "string" && value) {
            try {
                await uploadService.deleteFile(value);
                toast.success("File removed successfully");
            } catch (error) {
                console.error("Failed to delete file:", error);
            }
        }
        onChange(null);
    };

    return (
        <div className="mb-6">
            <h3 className="text-sm font-normal mb-3" style={{ color: C.black }}>
                {label}
                {required && <span style={{ color: C.red }}>*</span>}
            </h3>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                    <div
                        className={`flex items-center justify-center relative overflow-hidden ${circular ? "rounded-full" : "rounded-xl"
                            }`}
                        style={{
                            height: circular ? width : height,
                            width: circular ? width : "100% ",
                            maxWidth: circular ? width : maxWidth,
                            // backgroundColor: C.navy,
                            border: `1.5px solid ${C.teal}`,
                            boxShadow: `inset 0 0 0 1px ${C.border}`,
                        }}
                    >
                        {value ? (
                            <>
                                <img
                                    src={value}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute top-2 right-2 p-1 rounded-full shadow-md hover:opacity-80 transition-opacity"
                                    style={{
                                        backgroundColor: C.red,
                                    }}
                                    disabled={isUploading}
                                >
                                    <X className="h-4 w-4" style={{ color: C.textColor }} />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                {isUploading ? (
                                    <>
                                        <Loader2
                                            className="h-8 w-8 animate-spin"
                                            style={{ color: C.teal }}
                                        />
                                        <span className="mt-2 text-sm" style={{ color: C.slateL }}>
                                            {uploadProgress}%
                                        </span>
                                    </>
                                ) : (
                                    <Camera
                                        className="h-10 w-10"
                                        style={{ color: C.slate }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                    <input
                        type="file"
                        id={`file-${name}`}
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                    />
                    <label
                        htmlFor={`file-${name}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg transition-all cursor-pointer"
                        style={{
                            backgroundColor: isUploading ? C.slate : "",
                            color: C.black,
                            border: `1.5px solid ${C.teal}`,
                            opacity: isUploading ? 0.5 : 1,
                            cursor: isUploading ? "not-allowed" : "pointer",
                        }}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Camera className="h-4 w-4 mr-2" />
                                Choose File
                            </>
                        )}
                    </label>
                    <p className="text-xs" style={{ color: C.slateL }}>
                        JPG, PNG, GIF (Max {maxSizeMB}MB)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomFileUpload;
