import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../assets/Colours";
import { Images } from "../assets/Images";

const Group = ({ group, onGroupPress, userEmail, isMember, onJoinGroup }) => {
  const {
    groupImage,
    groupName,
    groupDescription,
    members,
    id,
    createdAt,
    createdBy,
  } = group;

  const getFormattedDate = (timestamp) => {
    if (!timestamp) return "No date";
    try {
      let dateObj;
      if (timestamp.seconds !== undefined) {
        dateObj = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
      } else if (typeof timestamp.toDate === 'function') {
        dateObj = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        dateObj = timestamp;
      } else {
        dateObj = new Date(timestamp);
      }
      return dateObj.toLocaleDateString("en-US", {
        year: "2-digit",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formattedDate = getFormattedDate(createdAt);

  const [imageError, setImageError] = React.useState(false);

  return (
    <TouchableOpacity style={styles.container} onPress={onGroupPress} >
      <View style={styles.leftContainer}>
        <TouchableOpacity disabled={true} >
          <Image
            source={
              groupImage && !imageError && groupImage.trim() !== ""
                ? { uri: groupImage }
                : Images.defaultGroupIcon
            }
            style={styles.groupImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </TouchableOpacity>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.groupDescription}>{groupDescription}</Text>
        </View>
      </View>

      {isMember ? (
        <Text style={styles.creationTime}>
          {formattedDate}
        </Text>
      ) : (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={(e) => {
            e.stopPropagation();
            if (onJoinGroup) {
              onJoinGroup();
            }
          }}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      )}
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
    borderWidth: 0.25,
    borderColor: Colors.BLACK,
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
    color: Colors.BLACK,
    marginTop: 4,
    opacity: 0.6,
  },
  creationTime: {
    fontSize: 12,
    color: Colors.BLACK,
    opacity: 0.6,
  },
  joinButton: {
    backgroundColor: Colors.BUTTON_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinButtonText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default Group;
