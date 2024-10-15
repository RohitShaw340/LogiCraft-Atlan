import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, ScrollView } from "react-native";
import tailwind from "twrnc";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { SERVER_URL } from "../../../env";
import VehicleInfo from "../../Components/VehicleInfo";
import OrderInfo from "../../Components/OrderInfo";

const DriverDashboard = ({ userDetails, logout }) => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      let locationInterval;

      const fetchAssignmentDetails = async () => {
        setLoading(true);
        const api_url = SERVER_URL + `assignment-user/${userDetails.uid}`;

        var servrAss = null;
        try {
          const response = await fetch(api_url);
          const data = await response.json();
          if (data.assignment) {
            setAssignment(data.assignment);
            await handleVehicleAndBooking(data.assignment);
            // Start sending location data when the page is in focus
            locationInterval = setInterval(() => {
              if (
                data &&
                data.assignment.vehicle_no &&
                data.assignment.booking_id
              ) {
                console.log("send location from if : ", data.assignment);
                sendLocation(data.assignment);
              } else if (
                assignment &&
                assignment.vehicle_no &&
                assignment.booking_id
              ) {
                console.log("send location if else : ", assignment);
                sendLocation(assignment);
              }
            }, 5000);
          } else {
            handleLogout();
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching assignment details:", error);
          setLoading(false);
        }
      };

      // Function to send location data to the server
      const sendLocation = async (assignment) => {
        try {
          // Request permission to access the location
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission to access location was denied");
            return;
          }

          // Get the current location
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const { latitude, longitude } = location.coords;
          console.log(
            "Sending location data to server...",
            latitude,
            longitude
          );

          // Send the location data to the server
          const response = await fetch(
            `${SERVER_URL}vehicle/update-location/${assignment.vehicle_no}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
                uid: userDetails.uid,
              }),
            }
          );

          if (response.ok) {
            console.log("Location updated successfully on the server");
          } else {
            console.error("Failed to update location on the server");
          }
        } catch (error) {
          console.error("Error sending location to server:", error);
        }
      };

      fetchAssignmentDetails();

      // Cleanup the interval when the screen is unfocused
      return () => {
        if (locationInterval) {
          clearInterval(locationInterval);
        }
      };
    }, [userDetails])
  );

  const handleVehicleAndBooking = async (assignment) => {
    if (assignment.vehicle_no) {
      // Fetch vehicle info if VehicleNo is present
      const vehicleResponse = await fetch(
        SERVER_URL + `vehicle/${assignment.vehicle_no}`
      );
      const vehicleData = await vehicleResponse.json();
      setVehicleData(vehicleData.vehicle);
    }

    if (assignment.booking_id) {
      // Fetch booking data if booking_id is present
      const bookingResponse = await fetch(
        SERVER_URL + `booking/${assignment.booking_id}`
      );
      const bookingData = await bookingResponse.json();
      setBookingData(bookingData.booking);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (assignment && !assignment.vehicle_no) {
    Alert.alert(
      "Verification Pending",
      "Your account is not yet verified by admin. Please wait for verification.",
      [
        {
          text: "OK",
          onPress: handleLogout,
        },
      ]
    );
    return null;
  }

  return (
    <ScrollView>
      <View style={tailwind`h-full w-full p-4`}>
        {assignment && assignment.vehicle_no ? (
          <>
            {/* Render the Vehicle Component */}
            <VehicleInfo vehicle={vehicleData} />

            {/* if a job is assigned show current Booking Details*/}
            {assignment.booking_id ? (
              <OrderInfo booking={bookingData} userDetails={userDetails} />
            ) : (
              <Text style={styles.noJobText}>No job is assigned</Text>
            )}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default DriverDashboard;

const styles = StyleSheet.create({
  trackJobButton: {
    backgroundColor: "#1c8dd9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noJobText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
