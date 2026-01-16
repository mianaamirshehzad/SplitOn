import React, { useMemo, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { MaterialIcons } from "@expo/vector-icons";
import app from "../firebase";
import { Colors } from "../assets/Colours";

/**
 * Reusable profile photo picker + uploader.
 * - Tap to pick image
 * - Upload to Firebase Storage
 * - Save `photoURL` to Firestore `users` doc (lookup by email)
 */
const ProfilePhotoPicker = ({
  userEmail,
  userId,
  displayName = "",
  photoURL = "",
  size = 80,
  disabled = false,
  onPhotoURLChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const db = getFirestore(app);

  const initials = useMemo(() => {
    const source = (displayName || userEmail || "U").trim();
    return source ? source.charAt(0).toUpperCase() : "U";
  }, [displayName, userEmail]);

  const ensureUserDocRef = async () => {
    if (!userEmail) return null;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const snap = await getDocs(q);
    if (!snap.empty) return doc(db, "users", snap.docs[0].id);
    const created = await addDoc(collection(db, "users"), {
      name: displayName || "",
      email: userEmail,
      mobile: "",
      photoURL: "",
      createdAt: serverTimestamp(),
    });
    return doc(db, "users", created.id);
  };

  const pickAndUpload = async () => {
    if (disabled || uploading) return;
    if (!userEmail) {
      Alert.alert("Not logged in", "Please login again to update your profile photo.");
      return;
    }

    try {
      setUploading(true);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access to choose a profile photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      const storage = getStorage(app);
      const path = `profilePhotos/${userId || userEmail}/${Date.now()}.jpg`;
      const ref = storageRef(storage, path);

      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(ref, blob, { contentType: "image/jpeg" });
      const downloadURL = await getDownloadURL(ref);

      const userDocRef = await ensureUserDocRef();
      if (userDocRef) {
        await updateDoc(userDocRef, {
          photoURL: downloadURL,
          photoUpdatedAt: serverTimestamp(),
        });
      }

      onPhotoURLChange?.(downloadURL);
      Alert.alert("Success", "Profile photo updated!");
    } catch (e) {
      const code = e?.code || "";
      console.error("Error updating profile photo:", e);
      if (code === "storage/unauthorized") {
        Alert.alert(
          "Storage permission denied",
          "Firebase Storage rules are blocking uploads. Update Storage rules to allow authenticated users to write to profilePhotos/*."
        );
      } else {
        Alert.alert("Error", "Failed to update profile photo. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      onPress={pickAndUpload}
      activeOpacity={0.85}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Change profile photo"
    >
      {photoURL ? (
        <Image source={{ uri: photoURL }} style={styles.avatarImage} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: Math.max(18, Math.floor(size * 0.4)) }]}>{initials}</Text>
      )}

      <View style={styles.cameraBadge}>
        {uploading ? (
          <ActivityIndicator size="small" color={Colors.WHITE} />
        ) : (
          <MaterialIcons name="photo-camera" size={18} color={Colors.WHITE} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: Colors.BUTTON_COLOR,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontWeight: "bold",
    color: Colors.WHITE,
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.BLACK,
    borderWidth: 2,
    borderColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProfilePhotoPicker;


