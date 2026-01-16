import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import app from "../../firebase";
import { Colors } from "../../assets/Colours";
import { fetchInAppNotificationsForUser, markNotificationRead } from "../../utils/inAppNotifications";

const Notifications = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const userEmail = auth.currentUser ? auth.currentUser.email : null;

  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userEmail) return;
    setRefreshing(true);
    try {
      const list = await fetchInAppNotificationsForUser(db, userEmail);
      setItems(list);
    } catch (e) {
      console.error("Error fetching notifications:", e);
      setItems([]);
    } finally {
      setRefreshing(false);
    }
  }, [db, userEmail]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-none" size={50} color={Colors.BUTTON_COLOR} />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          renderItem={({ item }) => {
            const paidByName = item?.data?.paidByName || "A group member";
            const description = item?.data?.description || "an expense";
            const amount = item?.data?.amount != null ? `Rs.${item.data.amount}` : "";
            const groupName = item?.data?.groupName || "";

            return (
              <TouchableOpacity
                style={[styles.row, !item.read && styles.rowUnread]}
                onPress={async () => {
                  if (!item.read) {
                    try {
                      await markNotificationRead(db, item.id);
                      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
                    } catch (e) {
                      // ignore
                    }
                  }
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title || "Notification"}
                  </Text>
                  <Text style={styles.body} numberOfLines={2}>
                    {paidByName} added "{description}" {amount} {groupName ? `in ${groupName}` : ""}
                  </Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_COLOR,
    padding: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    gap: 10,
  },
  rowUnread: {
    borderWidth: 1,
    borderColor: Colors.BUTTON_COLOR,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.BLACK,
  },
  body: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.BUTTON_COLOR,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default Notifications;


