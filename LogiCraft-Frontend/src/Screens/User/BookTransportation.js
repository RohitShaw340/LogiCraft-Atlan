import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { SERVER_URL } from "../../../env";
import { useRoute } from "@react-navigation/native";

const BookTransportation = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("small");
  const route = useRoute();
  const { userDetails } = route.params; // Accessing userDetails from params

  var pickupLocation = null;
  var dropoffLocation = null;

  const rates = {
    small: 5, // per km
    medium: 10,
    large: 15,
  };

  const handleGeocode = async (address, type) => {
    try {
      const geocoded = await Location.geocodeAsync(address);
      console.log(geocoded);
      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const locationData = { lat: latitude, lng: longitude };
        console.log(locationData);
        if (type === "pickup") {
          pickupLocation = locationData;
          // setPickupAddress(address);
        } else {
          dropoffLocation = locationData;
          // setDropoffAddress(address);
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("Error", "Failed to geocode address.");
    }
  };

  const calculateDistance = (pickup, dropoff) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (dropoff.lat - pickup.lat) * (Math.PI / 180);
    const dLon = (dropoff.lng - pickup.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pickup.lat * (Math.PI / 180)) *
        Math.cos(dropoff.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const calculateCost = (distance, vehicleType) => {
    return distance * rates[vehicleType];
  };

  const Book = (distance, estimatedCost) => {
    const api_url = SERVER_URL + "book";
    console.log(pickupLocation, dropoffLocation);
    console.log(
      JSON.stringify({
        pickup_coords: {
          latitude: parseFloat(pickupLocation.lat),
          longitude: parseFloat(pickupLocation.lng),
        },
        dropoff_coords: {
          latitude: parseFloat(dropoffLocation.lat),
          longitude: parseFloat(dropoffLocation.lng),
        },
        vehicle_type: vehicleType.toLowerCase(),
        distance,
        estimatedCost,
        user_id: userDetails.uid,
      })
    );
    fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pickup_coords: {
          latitude: parseFloat(pickupLocation.lat),
          longitude: parseFloat(pickupLocation.lng),
        },
        dropoff_coords: {
          latitude: parseFloat(dropoffLocation.lat),
          longitude: parseFloat(dropoffLocation.lng),
        },
        vehicle_type: vehicleType.toLowerCase(),
        distance,
        estimatedCost,
        user_id: userDetails.uid,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Alert.alert(
            "Booking Confirmed",
            "Your transportation has been booked."
          );
          setPickupAddress("");
          setDropoffAddress("");
          setVehicleType("small");
        } else {
          Alert.alert(
            "Error",
            "Booking failed. No Trucks of your Requirment is available. Please try again."
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Alert.alert(
          "Error",
          "Booking failed. No Trucks of your Requirment is available. Please try again."
        );
      });
  };

  const handleBooking = async () => {
    await handleGeocode(pickupAddress, "pickup");
    await handleGeocode(dropoffAddress, "dropoff");

    if (!pickupLocation || !dropoffLocation) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const distance = calculateDistance(pickupLocation, dropoffLocation);
    const estimatedCost = calculateCost(distance, vehicleType);

    // Prepare billing format
    const billingMessage = `
      Total Distance: ${distance.toFixed(2)} km
      Cost per km: ₹${rates[vehicleType]} 
      Estimated Total Cost: ₹${estimatedCost.toFixed(2)}
    `;

    Alert.alert("Estimated Cost", billingMessage, [
      {
        text: "Cancel",
        onPress: () => console.log("Cancelled"),
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          Book(distance, estimatedCost);
        },
      },
    ]);
  };

  return (
    <View style={{ padding: 20, backgroundColor: "#f4f4f4", flex: 1 }}>
      {/* Pickup Location */}
      <Text style={{ fontSize: 16, marginBottom: 5 }}>Pickup Location</Text>
      <TextInput
        placeholder="Enter Pickup Location"
        value={pickupAddress}
        onChangeText={(text) => setPickupAddress(text)}
        style={{
          height: 40,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: "#ddd",
          backgroundColor: "#fff",
          paddingHorizontal: 10,
          marginBottom: 20,
        }}
      />

      {/* Drop-off Location */}
      <Text style={{ fontSize: 16, marginBottom: 5 }}>Drop-off Location</Text>
      <TextInput
        placeholder="Enter Drop-off Location"
        value={dropoffAddress}
        onChangeText={(text) => setDropoffAddress(text)}
        style={{
          height: 40,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: "#ddd",
          backgroundColor: "#fff",
          paddingHorizontal: 10,
          marginBottom: 20,
        }}
      />

      {/* Vehicle Type */}
      <Text style={{ fontSize: 16, marginBottom: 5 }}>Select Vehicle Type</Text>
      <Picker
        selectedValue={vehicleType}
        onValueChange={(itemValue) => setVehicleType(itemValue)}
        style={{
          height: 50,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: "#ddd",
          backgroundColor: "#fff",
          color: "#333",
          marginBottom: 20,
        }}
      >
        <Picker.Item label="Small" value="small" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Large" value="large" />
      </Picker>

      {/* Book Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#007bff",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={handleBooking}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Book
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookTransportation;
