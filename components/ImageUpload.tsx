import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

interface ImageUploadProps {
  uploadType: "advertisements" | "pets" | "clinics" | "stores" | "products";
  onUploadComplete: (imageUrl: string, imagePath: string) => void;
  maxSize?: number; // MB
  quality?: number; // 0-100
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  uploadType,
  onUploadComplete,
  maxSize = 5,
  quality = 80,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access your photos");
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: quality / 100,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedImage = result.assets[0];

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
      if (fileInfo.size && fileInfo.size > maxSize * 1024 * 1024) {
        Alert.alert("File Too Large", `Please select an image smaller than ${maxSize}MB`);
        return;
      }

      setImage(selectedImage.uri);
      await uploadImage(selectedImage.uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access your camera");
      return;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: quality / 100,
    });

    if (!result.canceled && result.assets[0]) {
      const photo = result.assets[0];
      setImage(photo.uri);
      await uploadImage(photo.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();

      const filename = uri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri,
        name: filename,
        type,
      } as any);

      formData.append("uploadType", uploadType);
      formData.append("quality", quality.toString());

      // Upload to server
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/images/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (data.success) {
        onUploadComplete(data.data.url, data.data.path);
        Alert.alert("Success", "Image uploaded successfully");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}

      {!uploading && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Choose from Library</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 16,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "cover",
  },
  loadingOverlay: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#5856D6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
