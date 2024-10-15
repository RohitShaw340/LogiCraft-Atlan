import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import tailwind from "twrnc";
import { SERVER_URL } from "../../env";
import OrderInfo from "../Components/OrderInfo";
import * as Location from "expo-location";

const Bookings = ({ userDetails, logout }) => {
  const [bookings, setBookings] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const [assignment, setAssignment] = useState(null);

  // Fetch bookings when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchBookings = async () => {
        try {
          setIsLoading(true);

          let endpoint = "";
          if (userDetails?.type === "admin") {
            endpoint = "/bookings"; // Fetch all bookings
          } else if (userDetails?.type === "user" && userDetails?.uid) {
            endpoint = `/bookings/id/user/${userDetails.uid}`; // Fetch bookings by user ID
          } else if (userDetails?.type === "driver" && userDetails?.uid) {
            endpoint = `/bookings/id/driver/${userDetails.uid}`; // Fetch bookings by user ID
          } else {
            throw new Error("Invalid user type or ID");
          }

          const response = await fetch(SERVER_URL + endpoint);
          const data = await response.json();
          if (response.ok && data && Array.isArray(data.bookings)) {
            console.log("inside use effect : ", data.bookings);
            setBookings(data.bookings);

            setError(false);
          } else if (response.ok && Array.isArray(data)) {
            setBookings(data);
            setError(false);
          } else {
            throw new Error(data ? data.message : "Failed to fetch bookings");
          }

          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching bookings:", err);
          setError(true);
          setIsLoading(false);
        }
      };

      let locationInterval;

      const fetchAssignmentDetails = async () => {
        const api_url = SERVER_URL + `assignment-user/${userDetails.uid}`;

        try {
          const response = await fetch(api_url);
          const data = await response.json();
          if (data.assignment) {
            setAssignment(data.assignment);
            // Start sending location data when the page is in focus
            locationInterval = setInterval(() => {
              console.log(assignment);
              if (
                data &&
                data.assignment.vehicle_no &&
                data.assignment.booking_id
              ) {
                sendLocation(data.assignment);
              } else if (
                assignment &&
                assignment.vehicle_no &&
                assignment.booking_id
              ) {
                sendLocation(assignment);
              }
            }, 5000);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Error fetching assignment details:", error);
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

      if (userDetails.type === "driver") {
        fetchAssignmentDetails();
      }
      fetchBookings();

      // Cleanup the interval when the screen is unfocused
      return () => {
        if (locationInterval) {
          clearInterval(locationInterval);
        }
      };
    }, [userDetails])
  );

  const renderBooking = ({ item }) => (
    <OrderInfo booking={item} userDetails={userDetails} />
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="black" />
      ) : error ? (
        <Text style={tailwind`text-center text-red-500`}>
          Something went wrong
        </Text>
      ) : bookings.length == 0 ? (
        <Text style={tailwind`text-center text-black`}>
          No Bookings Available
        </Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => (item.id ? item.id : item._id)}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default Bookings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});
