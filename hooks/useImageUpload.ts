import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/lib/trpc";

interface UseImageUploadOptions {
    onUploadSuccess?: (url: string) => void;
    onUploadError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickAndUploadImage = async (aspect: [number, number] = [1, 1]) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Request Permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                const msg = "Permission to access media library is required";
                setError(msg);
                options.onUploadError?.(msg);
                setIsLoading(false);
                return;
            }

            // 2. Pick Image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: aspect,
                quality: 0.8,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                setIsLoading(false);
                return;
            }

            const asset = result.assets[0];

            // 3. Prepare Upload
            const formData = new FormData();
            const filename = asset.uri.split("/").pop() || "image.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // @ts-ignore - React Native FormData
            formData.append("file", {
                uri: asset.uri,
                name: filename,
                type,
            });

            // 4. Upload
            // Use configured API URL or fallback to dev machine IP
            // Note: In a real app, this should come from a config file


            console.log("📤 Uploading to:", `${API_URL}/upload`);

            const response = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formData,
                // Don't set Content-Type header - let the browser set it with boundary
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
                throw new Error(data.error || "Failed to get image URL");
            }
        } catch (err: any) {
            const msg = err.message || "An error occurred during upload";
            setError(msg);
            options.onUploadError?.(msg);
            console.error("❌ Image upload error:", err);
            console.error("Server URL was:", process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.6:3001");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        pickAndUploadImage,
        isLoading,
        error,
    };
};
