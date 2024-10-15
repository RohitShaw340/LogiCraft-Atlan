import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const findColor = (type, status) => {
  if (type == "Dumper") {
    if (status == "empty") return "green";
    else if (status == "filling") return "violet";
    else if (status == "full") return "red";
  } else {
    return "yellow";
  }
};

const LocationMarker = ({ vehicle, type, coords, status, assigned }) => {
  return (
    <Marker
      key={vehicle}
      coordinate={{
        latitude: coords.latitude,
        longitude: coords.longitude,
      }}
      title={assigned.status ? "Assigned" : "Idle"}
      description={assigned.status ? assigned.id : ""}
    >
      <Text
        style={{
          fontWeight: "bold",
          backgroundColor: "white",
        }}
      >
        {vehicle}
      </Text>

      <MaterialCommunityIcons
        name={type == "Shovel" ? "crane" : "dump-truck"}
        color={findColor(type, status)}
        size={48}
      />
    </Marker>
  );
};

export default LocationMarker;

const styles = StyleSheet.create({
  bubble: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 0.5,
    padding: 15,
    width: 150,
  },
});
