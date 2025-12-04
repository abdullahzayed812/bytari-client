import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

interface UseBookDownloadOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export const useBookDownload = (options: UseBookDownloadOptions = {}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadMutation = useMutation(
        trpc.content.downloadBook.mutationOptions(),

    );

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
                    onSuccess: () => {
                        options.onSuccess?.();
                    },
                    onError: (error) => {
                        console.error("Download mutation error:", error);
                        options.onError?.(error);
                    },
                });

                const filename = book.filePath!.split('/').pop() || 'book.pdf';
                const result = await FileSystem.downloadAsync(
                    book.filePath!,
                    FileSystem.documentDirectory + filename
                );

                console.log('Finished downloading to ', result.uri);

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(result.uri);
                } else {
                    Alert.alert("تم", "تم تحميل الكتاب بنجاح");
                }
            } catch (error) {
                console.error("Download error:", error);
                Alert.alert("خطأ", "فشل في تحميل الكتاب");
            } finally {
                setIsDownloading(false);
            }
        };

        Alert.alert(
            "تحميل الكتاب",
            `هل تريد تحميل كتاب "${book.title}"؟${book.fileSize ? `\nحجم الملف: ${book.fileSize}` : ''}`,
            [
                { text: "إلغاء", style: "cancel" },
                {
                    text: "تحميل",
                    onPress: startDownload,
                },
            ]
        );
    };

    return {
        downloadBook,
        isDownloading,
    };
};
