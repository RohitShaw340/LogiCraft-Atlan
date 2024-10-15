import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Vehicle = ({ vehicleDetails }) => {
  return (
    <View style={styles.vehicleCard}>
      <Text style={styles.vehicleText}>
        Vehicle No: {vehicleDetails.vehicle_no}
      </Text>
      <Text style={styles.vehicleText}>
        Vehicle Type: {vehicleDetails.vehicle_type}
      </Text>
    </View>
  );
};

export default Vehicle;

const styles = StyleSheet.create({
  vehicleCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
