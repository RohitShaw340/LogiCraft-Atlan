import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React, { useEffect, useState, useRef } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import tailwind from "twrnc";

import { SERVER_URL } from "../../env";

const Map = ({ route }) => {
  const { vehicle_no, pickup_location, dropoff_location, userDetails } =
    route.params;
  const mapRef = useRef(null);
  const [vehicleCoords, setVehicleCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(vehicle_no, pickup_location, dropoff_location, userDetails);

  const fetchVehicleCoords = async () => {
    try {
      const response = await fetch(SERVER_URL + `vehicle-coords/${vehicle_no}`);
      const data = await response.json();
      console.log(data);
      if (data) {
        setVehicleCoords(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle coordinates:", error);
    }
  };

  // useFocusEffect to start interval for fetching vehicle coords when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const intervalId = setInterval(fetchVehicleCoords, 5000); // Fetch every 5 seconds
      return () => clearInterval(intervalId); // Clear interval when user leaves the screen
    }, [])
  );

  // Fit map to show pickup, dropoff, and vehicle location
  useEffect(() => {
    if (
      mapRef.current &&
      vehicleCoords &&
      pickup_location &&
      dropoff_location
    ) {
      mapRef.current.fitToCoordinates(
        [pickup_location, dropoff_location, vehicleCoords],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [vehicleCoords, pickup_location, dropoff_location]);

  useEffect(() => {
    // Once the vehicle coordinates are fetched, we can stop the loading
    if (vehicleCoords) {
      setLoading(false);
    }
  }, [vehicleCoords]);

  if (loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: pickup_location.latitude,
          longitude: pickup_location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={pickup_location}
          title="Pickup Location"
          pinColor="green"
        />

        {/* Dropoff Marker */}
        <Marker
          coordinate={dropoff_location}
          title="Dropoff Location"
          pinColor="red"
        />

        {/* Vehicle Marker */}
        {vehicleCoords && (
          <Marker
            coordinate={vehicleCoords}
            title="Vehicle Location"
            pinColor="blue"
          />
        )}

        {/* Draw Polyline between Pickup and Dropoff */}
        <Polyline
          coordinates={[pickup_location, dropoff_location]}
          strokeColor="#000" // black color
          strokeWidth={3}
        />
      </MapView>

      {/* Button to refresh location */}
      <TouchableOpacity
        onPress={fetchVehicleCoords}
        style={tailwind`absolute right-4 bottom-[20px] bg-white p-3 rounded-full`}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={30} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Map;
