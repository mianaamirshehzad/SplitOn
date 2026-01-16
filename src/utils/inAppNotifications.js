import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export async function createInAppNotificationsForSplitExpense({
  db,
  recipientEmails,
  excludeEmail,
  title,
  body,
  data,
}) {
  const recipients = Array.from(new Set((recipientEmails || []).filter(Boolean))).filter(
    (e) => e !== excludeEmail
  );
  if (recipients.length === 0) return;

  const batch = writeBatch(db);
  recipients.forEach((toEmail) => {
    const ref = doc(collection(db, "notifications"));
    batch.set(ref, {
      toEmail,
      title: title || "Notification",
      body: body || "",
      data: data || {},
      read: false,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function fetchInAppNotificationsForUser(db, userEmail) {
  if (!userEmail) return [];
  const q = query(collection(db, "notifications"), where("toEmail", "==", userEmail));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sort newest first (client-side to avoid composite index requirements)
  items.sort((a, b) => {
    const aT = a.createdAt?.seconds || 0;
    const bT = b.createdAt?.seconds || 0;
    return bT - aT;
  });
  return items;
}

export async function markNotificationRead(db, notificationId) {
  if (!notificationId) return;
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
    readAt: serverTimestamp(),
  });
}


