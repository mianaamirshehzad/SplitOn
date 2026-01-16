import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
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
import app from "../firebase";

// Show notifications while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function getExpoProjectId() {
  // Works across EAS + classic configs
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    undefined
  );
}

async function ensureUserDocRefByEmail(db, email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snap = await getDocs(q);
  if (!snap.empty) return doc(db, "users", snap.docs[0].id);

  const created = await addDoc(collection(db, "users"), {
    name: "",
    email,
    mobile: "",
    photoURL: "",
    expoPushToken: "",
    createdAt: serverTimestamp(),
  });
  return doc(db, "users", created.id);
}

export async function registerAndSavePushTokenAsync(userEmail) {
  if (!userEmail) return null;

  // Android channel (required for proper behavior)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const projectId = getExpoProjectId();
  const tokenResult = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  const token = tokenResult?.data;
  if (!token) return null;

  const db = getFirestore(app);
  const userDocRef = await ensureUserDocRefByEmail(db, userEmail);
  await updateDoc(userDocRef, {
    expoPushToken: token,
    pushTokenUpdatedAt: serverTimestamp(),
  });

  return token;
}

async function getPushTokensForEmails(db, emails) {
  const clean = Array.from(new Set((emails || []).filter(Boolean)));
  if (clean.length === 0) return [];

  const tokens = [];
  // Firestore `in` supports up to 10 values
  for (let i = 0; i < clean.length; i += 10) {
    const chunk = clean.slice(i, i + 10);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "in", chunk));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data();
      if (data?.expoPushToken) tokens.push(data.expoPushToken);
    });
  }
  return tokens;
}

export async function sendSplitExpenseNotificationAsync({
  db,
  recipientEmails,
  excludeEmail,
  title,
  body,
  data,
}) {
  const filtered = (recipientEmails || []).filter(
    (e) => e && e !== excludeEmail
  );
  if (filtered.length === 0) return;

  const tokens = await getPushTokensForEmails(db, filtered);
  if (tokens.length === 0) return;

  // Expo push endpoint
  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title,
    body,
    data: data || {},
  }));

  // Send in chunks (Expo recommends <= 100 per request)
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chunk),
    });
  }
}


