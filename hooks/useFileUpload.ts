import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "@/lib/trpc";

interface UseFileUploadOptions {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndUploadFile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Pick Document
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsLoading(false);
        return;
      }

      const asset = result.assets[0];

      // 2. Prepare Upload
      const formData = new FormData();
      const filename = asset.name || "document.pdf";

      // @ts-ignore - React Native FormData
      formData.append("file", {
        uri: asset.uri,
        name: filename,
        type: asset.mimeType || "application/pdf",
      });

      // 3. Upload
      console.log("📤 Uploading file to:", `${API_URL}/upload`);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("📥 Upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Upload success:", data);

      if (data.success && data.url) {
        options.onUploadSuccess?.(data.url);
        return data.url;
      } else {
        throw new Error(data.error || "Failed to get file URL");
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred during upload";
      setError(msg);
      options.onUploadError?.(msg);
      console.error("❌ File upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickAndUploadFile,
    isLoading,
    error,
  };
};
