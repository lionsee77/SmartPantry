import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase  } from "../services/supabase";

export default function ReceiptPage() {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // ✅ Store Authenticated User ID

  // ✅ Fetch user ID on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Authentication Error", "Unable to retrieve user details.");
      } else {
        setUserId(data?.user?.id);
      }
    };

    getUser();
  }, []);

  // ✅ Open camera and capture image
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required to scan receipts.");
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      const capturedImage = result.assets[0].uri;
      console.log("Captured Image URI:", capturedImage); // ✅ Log before updating state
      setImage(capturedImage);
    } else {
      console.log("Image was cancelled");
    }
  };
  
  // ✅ Log updated image state
  useEffect(() => {
    if (image) {
      console.log("Updated Image State:", image); // ✅ Will log after `setImage`
    }
  }, [image]);
  

  // ✅ Upload receipt to API
  const uploadReceipt = async () => {
    if (!image) {
      console.log("No image found");
      Alert.alert("No Image", "Please capture a receipt before uploading.");
      return;
    }
    if (!userId) {
      console.log("No UserID found");
      Alert.alert("Authentication Error", "User ID is missing. Please re-login.");
      return;
    }
  
    try {
      setLoading(true);
  
      // Ensure `file://` scheme for local image
      const fileUri = image.startsWith("file://") ? image : `file://${image}`;
      const fileName = fileUri.split("/").pop(); // Get filename from path
      const fileType = fileName.split(".").pop().toLowerCase(); // Extract extension
  
      const mimeType = fileType === "jpg" ? "image/jpeg" : `image/${fileType}`;

      // Ensure correct FormData format
      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });

      formData.append("user_id", userId);

      const apiUrl = "http://192.168.79.16:8000/parse-receipt/"
      console.log("Uploading to:", apiUrl);
      console.log("FormData:", formData);

      // Use fetch without manually setting `Content-Type`
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert("Success", "Receipt uploaded successfully!");
      } else {
        console.error("API Error:", result);
        Alert.alert("Upload Failed", result.detail ? JSON.stringify(result.detail) : "Something went wrong.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Upload Failed", "Network request failed. Check your API connection.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Receipt Scanner 📜</Text>
      <Text style={styles.description}>Capture a receipt using your iPhone camera.</Text>

      {/* Camera Button */}
      <TouchableOpacity onPress={openCamera} style={styles.cameraButton}>
        <Text style={styles.cameraText}>Open Camera</Text>
      </TouchableOpacity>

      {/* Display Captured Image */}
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity onPress={uploadReceipt} style={styles.uploadButton} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.uploadText}>Upload Receipt</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  backText: {
    fontSize: 18,
    color: "#6200ea",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: "#6200ea",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  cameraText: {
    color: "white",
    fontSize: 18,
  },
  image: {
    width: 250,
    height: 350,
    marginTop: 20,
    borderRadius: 10,
  },
  uploadButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadText: {
    color: "white",
    fontSize: 18,
  },
});