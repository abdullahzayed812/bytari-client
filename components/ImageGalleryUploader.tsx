import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageGalleryUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    label?: string;
    aspect?: [number, number];
}

export function ImageGalleryUploader({
    images,
    onImagesChange,
    maxImages = 5,
    label = 'الصور',
    aspect = [4, 3],
}: ImageGalleryUploaderProps) {
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const { pickAndUploadImage, isLoading } = useImageUpload({
        onUploadSuccess: (url) => {
            onImagesChange([...images, url]);
            setUploadingIndex(null);
        },
        onUploadError: (error) => {
            console.error('Upload error:', error);
            setUploadingIndex(null);
        },
    });

    const handleAddImage = () => {
        if (images.length >= maxImages) {
            return;
        }
        setUploadingIndex(images.length);
        pickAndUploadImage(aspect);
    };

    const handleRemoveImage = (index: number) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gallery}
            >
                {images.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri }} style={styles.image} />
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveImage(index)}
                        >
                            <X size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                ))}

                {images.length < maxImages && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddImage}
                        disabled={isLoading}
                    >
                        {isLoading && uploadingIndex === images.length ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                            <>
                                <Plus size={32} color={COLORS.primary} />
                                <Text style={styles.addButtonText}>
                                    إضافة صورة
                                </Text>
                                <Text style={styles.countText}>
                                    {images.length}/{maxImages}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            {images.length === 0 && (
                <Text style={styles.emptyText}>
                    لم يتم إضافة صور بعد
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'right',
    },
    gallery: {
        flexDirection: 'row-reverse',
        gap: 12,
        paddingVertical: 8,
    },
    imageContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.error,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
    },
    addButtonText: {
        fontSize: 12,
        color: COLORS.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    countText: {
        fontSize: 10,
        color: COLORS.darkGray,
        marginTop: 2,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginTop: 8,
    },
});
