import React from "react";
import { View, Image, StyleSheet, Dimensions, ScrollView, Text, TouchableOpacity } from "react-native";
import { XCircle } from "lucide-react-native"; // Assuming you have lucide-react-native for icons
import { COLORS } from "@/constants/colors"; // Assuming you have a colors constant

interface ImageAttachmentViewerProps {
  attachments: string | Record<string, string>;
}

const { width } = Dimensions.get("window");

const ImageAttachmentViewer: React.FC<ImageAttachmentViewerProps> = ({ attachments }) => {
  if (!attachments) {
    return null;
  }

  let imageUrls: string[] = [];

  if (typeof attachments === "string") {
    try {
      const parsed = JSON.parse(attachments);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter((item) => typeof item === "string");
      } else if (typeof parsed === "string") {
        imageUrls = [parsed];
      }
    } catch (e) {
      // If it's a string but not valid JSON, treat it as a single URL
      imageUrls = [attachments];
    }
  } else if (Array.isArray(attachments)) {
    imageUrls = attachments.map((att) => att.uri);
    console.log("---", imageUrls);
  }

  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>المرفقات:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        {imageUrls.map((url, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
            {/* Optional: Add a placeholder for broken images or a button to remove/view */}
            {/* <TouchableOpacity style={styles.removeButton}>
              <XCircle size={20} color={COLORS.white} />
            </TouchableOpacity> */}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  scrollViewContent: {
    paddingRight: 10, // Add some padding to the right for the last image
  },
  imageWrapper: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  image: {
    width: width * 0.4, // Display images at 40% of screen width
    height: width * 0.4, // Make them square
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 2,
  },
});

export default ImageAttachmentViewer;
