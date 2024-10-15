import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SERVER_URL } from "../../env";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const DriverInfo = ({ assign }) => {
  const [assignment, setAssignment] = useState(assign);
  const [driverData, setDriverData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [vehicleNo, setVehicleNo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setVehicleData(null);
    setDriverData(null);
    setBookingData(null);

    try {
      const driverResponse = await fetch(
        `${SERVER_URL}users/${assignment.uid}`
      );
      const driverData = await driverResponse.json();
      setDriverData(driverData.user);

      if (assignment.vehicle_no) {
        const vehicleResponse = await fetch(
          `${SERVER_URL}vehicle/${assignment.vehicle_no}`
        );
        const vehicleData = await vehicleResponse.json();
        setVehicleData(vehicleData.vehicle);
      }

      if (assignment.booking_id) {
        const bookingResponse = await fetch(
          `${SERVER_URL}booking/${assignment.booking_id}`
        );
        const bookingData = await bookingResponse.json();
        setBookingData(bookingData.booking);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [assignment])
  );

  const assignVehicle = () => {
    const capitalizedVehicleNo = vehicleNo.toUpperCase();
    const api_url = `${SERVER_URL}assignments/${assignment.uid}/assign_vehicle`;

    fetch(api_url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle_no: capitalizedVehicleNo }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to assign vehicle");
        return res.json();
      })
      .then(() => {
        setAssignment((prev) => ({
          ...prev,
          vehicle_no: capitalizedVehicleNo,
        }));
        setVehicleNo("");
        setModalVisible(false);
        fetchData();
      })
      .catch((error) => {
        console.error("Error assigning vehicle:", error);
        alert("Failed to assign vehicle");
      });
  };

  return (
    <View style={styles.card}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Driver Information</Text>
            <MaterialCommunityIcons name="account" size={30} color="#3686E9" />
          </View>

          {/* Display Driver information if present */}
          {driverData ? (
            <>
              <Text style={styles.subTitle}>Name: {driverData.name}</Text>
              <Text style={styles.subTitle}>
                Phone: {driverData.phone_number}
              </Text>
              <Text style={styles.subTitle}>Address: {driverData.address}</Text>
            </>
          ) : (
            <Text style={styles.redText}>Driver data not found.</Text>
          )}

          {/* Display vehicle information if present */}
          {assignment.vehicle_no ? (
            vehicleData ? (
              <View style={styles.vehicleSection}>
                <Text style={styles.subTitle}>
                  Vehicle No: {vehicleData.vehicle_no}
                </Text>
                <Text style={styles.subTitle}>
                  Vehicle Type: {vehicleData.vehicle_type}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.redText}>No vehicle assigned</Text>
                <Button
                  title="Assign Vehicle"
                  onPress={() => setModalVisible(true)}
                />
              </View>
            )
          ) : (
            <View>
              <Text style={styles.redText}>No vehicle assigned</Text>
              <Button
                title="Assign Vehicle"
                onPress={() => setModalVisible(true)}
              />
            </View>
          )}

          {/* Display Current booking if a job is assigned */}
          {assignment.booking_id ? (
            bookingData ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
                <Text style={styles.subTitle}>
                  Booking ID: {bookingData.id}
                </Text>
                <Text style={styles.subTitle}>Cost: ₹{bookingData.cost}</Text>
                <Text style={styles.subTitle}>
                  Distance: {bookingData.distance} km
                </Text>
                <Text style={styles.subTitle}>
                  Status: {bookingData.job_status}
                </Text>
              </View>
            ) : (
              <Text style={styles.redText}>Loading booking details...</Text>
            )
          ) : (
            <Text style={styles.redText}>No job assigned</Text>
          )}

          <Modal visible={modalVisible} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Vehicle No"
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                />
                <View style={styles.buttonContainer}>
                  <Button title="OK" onPress={assignVehicle} />
                  <Button
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default DriverInfo;

// Styles
const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3686E9",
  },
  subTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
    marginTop: 15,
  },
  redText: {
    color: "red",
    fontSize: 16,
  },
  section: {
    paddingTop: 10,
  },
  vehicleSection: {
    paddingVertical: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
