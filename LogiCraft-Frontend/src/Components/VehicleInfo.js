import { Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import tailwind from "twrnc";
import { SERVER_URL } from "../../env";
import * as Location from "expo-location";

const VehicleInfo = ({ vehicle }) => {
  const [assignment, setAssignment] = useState(null);
  const [bgColor, setBgColor] = useState(vehicle.busy ? "#FF4C4C" : "#ACF35C"); // Default color based on busy status
  const [vehicleAddress, setVehicleAddress] = useState("");

  // Function to fetch the vehicle's address based on its coordinates
  const fetchAddress = async (latitude, longitude) => {
    try {
      const location = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (location.length > 0) {
        const address = `${location[0].name}, ${location[0].city}, ${location[0].region}`;
        setVehicleAddress(address);
      } else {
        setVehicleAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching vehicle address:", error);
      setVehicleAddress("Error fetching address");
    }
  };

  // Fetch assignment and address
  useFocusEffect(
    useCallback(() => {
      const fetchAssignment = async () => {
        try {
          const response = await fetch(
            SERVER_URL + `assignment-vehicle/${vehicle.vehicle_no}`
          );
          console.log(response);
          if (!response.ok) {
            if (response.status === 404) {
              setBgColor("#FFD700"); // Yellow color for no assignment
              setAssignment(null);
            } else {
              throw new Error("Failed to fetch assignment");
            }
          } else {
            const data = await response.json();
            if (data.success) {
              setBgColor(vehicle.busy ? "#FF4C4C" : "#ACF35C");
              setAssignment(data.assignment);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };

      // Fetch the vehicle's address based on its coordinates
      if (vehicle?.coordinates?.latitude && vehicle?.coordinates?.longitude) {
        fetchAddress(
          vehicle.coordinates.latitude,
          vehicle.coordinates.longitude
        );
      }

      fetchAssignment();
    }, [vehicle.vehicle_no, vehicle.coordinates])
  );

  return (
    <View style={tailwind`flex-col m-4 bg-white shadow-xl rounded-xl`}>
      <View
        style={[
          tailwind`flex-row items-center justify-between p-2 rounded-t-xl`,
          { backgroundColor: bgColor },
        ]}
      >
        <Text style={tailwind`text-xl font-bold text-black`}>
          {vehicle.vehicle_no}
        </Text>
        <MaterialCommunityIcons name={"dump-truck"} size={30} color="#3686E9" />
      </View>

      <View style={tailwind`p-3`}>
        <View style={tailwind`flex flex-row items-center`}>
          <Text style={tailwind`text-xl font-bold text-black pr-2`}>
            Vehicle Type :
          </Text>
          <Text style={tailwind`text-xl text-black`}>
            {vehicle.vehicle_type}
          </Text>
        </View>

        {/* Display coordinates */}
        <View style={tailwind`flex flex-row justify-between p-3`}>
          <View style={tailwind`flex flex-col items-center`}>
            <Text style={tailwind`text-xl font-bold text-black`}>Latitude</Text>
            <Text style={tailwind`text-xl text-black`}>
              {vehicle?.coordinates?.latitude.toFixed(4)}
            </Text>
          </View>
          <View style={tailwind`flex flex-col items-center`}>
            <Text style={tailwind`text-xl font-bold text-black`}>
              Longitude
            </Text>
            <Text style={tailwind`text-xl text-black`}>
              {vehicle?.coordinates?.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Display vehicle's reverse-geocoded address */}
        <View style={tailwind`flex flex-row items-center my-2`}>
          <Text style={tailwind`text-xl font-bold text-black pr-2`}>
            Address:
          </Text>
          <Text style={tailwind`text-base text-black`}>{vehicleAddress}</Text>
        </View>

        {/* Show vehicle status */}
        <View style={tailwind`flex flex-row items-center`}>
          <Text style={tailwind`text-xl font-bold text-black pr-2`}>
            Status:
          </Text>
          <Text style={tailwind`text-xl text-black`}>
            {vehicle.busy ? "Busy" : "Available"}
          </Text>
        </View>

        {/* Display assignment information if present */}
        {assignment && (
          <View style={tailwind`flex flex-row items-center mt-3`}>
            <Text style={tailwind`text-xl font-bold text-black pr-3`}>
              Driver Id:
            </Text>
            <Text style={tailwind`text-sm items-center`}>
              {assignment.uid.toString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default VehicleInfo;
