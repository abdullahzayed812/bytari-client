import { useState } from "react";
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

interface UseBookDownloadOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useBookDownload = (options: UseBookDownloadOptions = {}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadMutation = useMutation(trpc.content.downloadBook.mutationOptions());

  const downloadBook = async (book: { id: string | number; title: string; filePath?: string; fileSize?: string }) => {
    if (!book.filePath) {
      Alert.alert("خطأ", "ملف الكتاب غير متوفر");
      return;
    }

    const startDownload = async () => {
      try {
        setIsDownloading(true);

        // Increment download count
        downloadMutation.mutate({ id: Number(book.id) } as any, {
          onSuccess: () => options.onSuccess?.(),
          onError: (error) => {
            console.error("Download mutation error:", error);
            options.onError?.(error);
          },
        });

        const filename = book.filePath!.split("/").pop() || "book.pdf";

        if (Platform.OS === "android") {
          // Android: Save to Downloads folder
          const { StorageAccessFramework } = await import("expo-file-system");

          const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("خطأ", "يجب منح صلاحية الوصول للتنزيل");
            return;
          }

          // Download to temp cache
          const tempUri = FileSystem.cacheDirectory + filename;
          await FileSystem.downloadAsync(book.filePath!, tempUri);

          // Create file in Downloads folder
          const destUri = await StorageAccessFramework.createFileAsync(
            permission.directoryUri,
            filename,
            "application/pdf"
          );

          const fileBase64 = await FileSystem.readAsStringAsync(tempUri, { encoding: FileSystem.EncodingType.Base64 });
          await FileSystem.writeAsStringAsync(destUri, fileBase64, { encoding: FileSystem.EncodingType.Base64 });

          Alert.alert("تم", "تم تنزيل الكتاب");
          console.log("Downloaded to:", destUri);
        } else {
          // iOS: Save to app's document directory
          const localUri = FileSystem.documentDirectory + filename;
          await FileSystem.downloadAsync(book.filePath!, localUri);
          Alert.alert("تم", "تم تنزيل الكتاب بنجاح");
          console.log("Downloaded to:", localUri);
        }
      } catch (error) {
        console.error("Download error:", error);
        Alert.alert("خطأ", "فشل في تنزيل الكتاب");
      } finally {
        setIsDownloading(false);
      }
    };

    Alert.alert(
      "تحميل الكتاب",
      `هل تريد تحميل كتاب "${book.title}"؟${book.fileSize ? `\nحجم الملف: ${book.fileSize}` : ""}`,
      [
        { text: "إلغاء", style: "cancel" },
        { text: "تحميل", onPress: startDownload },
      ]
    );
  };

  return { downloadBook, isDownloading };
};
