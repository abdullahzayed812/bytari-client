import React from "react";
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Camera } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useImageUpload } from "../hooks/useImageUpload";

interface ImageUploaderProps {
    imageUri?: string;
    onUploadComplete: (url: string) => void;
    label?: string;
    aspect?: [number, number];
    containerStyle?: any;
    imageStyle?: any;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    imageUri,
    onUploadComplete,
    label,
    aspect = [1, 1],
    containerStyle,
    imageStyle,
}) => {
    const { pickAndUploadImage, isLoading, error } = useImageUpload({
        onUploadSuccess: (url) => {
            onUploadComplete(url);
        },
        onUploadError: (err) => {
            // You might want to show a toast here via a global toast provider
            console.error("Upload failed:", err);
        },
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.imageWrapper}>
                <Image
                    source={{
                        uri: imageUri || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80"
                    }}
                    style={[styles.image, imageStyle]}
                />

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}

                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => pickAndUploadImage(aspect)}
                    disabled={isLoading}
                >
                    <Camera size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 12,
    },
    imageWrapper: {
        position: "relative",
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.lightGray,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 60,
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 8,
    },
});
