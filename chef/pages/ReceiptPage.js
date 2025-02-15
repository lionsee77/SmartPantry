// import React, { useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as ImagePicker from "expo-image-picker";

// export default function ReceiptPage() {
//   const navigation = useNavigation();
//   const [image, setImage] = useState(null);

//   // Function to handle camera access
//   const openCamera = async () => {
//     // Request camera permissions
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "Camera access is required to scan receipts.");
//       return;
//     }

//     // Launch the camera
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri); // Store the captured image
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Back Button */}
//       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//         <Text style={styles.backText}>← Back</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>Receipt Scanner 📜</Text>
//       <Text style={styles.description}>Capture a receipt using your iPhone camera.</Text>

//       {/* Camera Button */}
//       <TouchableOpacity onPress={openCamera} style={styles.cameraButton}>
//         <Text style={styles.cameraText}>Open Camera</Text>
//       </TouchableOpacity>

//       {/* Display Captured Image */}
//       {image && (
//         <Image source={{ uri: image }} style={styles.image} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   backButton: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   backText: {
//     fontSize: 18,
//     color: "#6200ea",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 16,
//     color: "gray",
//     textAlign: "center",
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   cameraButton: {
//     backgroundColor: "#6200ea",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   cameraText: {
//     color: "white",
//     fontSize: 18,
//   },
//   image: {
//     width: 250,
//     height: 350,
//     marginTop: 20,
//     borderRadius: 10,
//   },
// });


import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export default function ReceiptPage() {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = "your_user_id_here"; // Replace with actual user ID if needed

  // Function to open the camera and capture an image
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
      setImage(result.assets[0].uri);
    }
  };

  // Function to upload receipt to API
  const uploadReceipt = async () => {
    if (!image) {
      Alert.alert("No Image", "Please capture a receipt before uploading.");
      return;
    }

    try {
      setLoading(true);

      // Convert image to Blob format
      const imageBlob = await FileSystem.uploadAsync(
        `http://localhost:8000/parse-receipt/?user_id=${userId}`,
        image,
        {
          fieldName: "file",
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      const response = JSON.parse(imageBlob.body);

      if (imageBlob.status === 200) {
        Alert.alert("Success", "Receipt uploaded successfully!");
      } else {
        Alert.alert("Upload Failed", response.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      Alert.alert("Upload Failed", "An error occurred while uploading the receipt.");
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

