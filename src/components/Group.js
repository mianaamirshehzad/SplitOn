import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../assets/Colours";

const Group = ({ group, onGroupPress }) => {
  const {
    groupImage,
    groupName,
    groupDescription,
    members,
    id,
    createdAt,
    createdBy,
  } = group;

  const creationDate = new Date(
    createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000
  );
  const formattedDate = creationDate.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onGroupPress} >
      <View style={styles.leftContainer}>
        <TouchableOpacity>
          <Image
            source={{ uri: groupImage }}
            style={styles.groupImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.groupDescription}>{groupDescription}</Text>
        </View>
      </View>

      <Text style={styles.creationTime}>
        {formattedDate ? formattedDate : "Loading..."}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: "row",
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
  },
  groupInfo: {
    marginLeft: 15,
    justifyContent: "center",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.BLACK,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 4,
  },
  creationTime: {
    fontSize: 12,
    color: Colors.GRAY,
  },
});

export default Group;
