import { useNavigation } from "@react-navigation/native";
import { Text, View, Button, Alert } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import tailwind from "twrnc";
import { SERVER_URL } from "../../env";
import ErrorPopup from "./ErrorPopup";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

const OrderInfo = ({ booking, userDetails }) => {
  const navigation = useNavigation();
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (booking?.pickup_location && booking?.dropoff_location) {
          const pickup = await Location.reverseGeocodeAsync({
            latitude: booking.pickup_location.latitude,
            longitude: booking.pickup_location.longitude,
          });
          const dropoff = await Location.reverseGeocodeAsync({
            latitude: booking.dropoff_location.latitude,
            longitude: booking.dropoff_location.longitude,
          });

          setPickupAddress(
            pickup.length > 0
              ? `${pickup[0].name}, ${pickup[0].city}, ${pickup[0].region}`
              : "Address not found"
          );
          setDropoffAddress(
            dropoff.length > 0
              ? `${dropoff[0].name}, ${dropoff[0].city}, ${dropoff[0].region}`
              : "Address not found"
          );
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, [booking]);

  const showErrorPopup = (message) => {
    setErrorMessage(message);
    setErrorVisible(true);
  };

  const completeJob = async (booking) => {
    const bookingId = booking._id ? booking._id : booking.id;
    try {
      const response = await fetch(SERVER_URL + `/complete-job/${bookingId}`);
      console.log(response);

      if (!response.ok) {
        // Parse the error response
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || "An error occurred");
      }

      const data = await response.json();

      Alert.alert(
        "Success",
        "Job completed successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Dashboard");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      // Handle error response
      showErrorPopup(error.message);
    }
  };

  // Determine background color based on job status
  // Green for completed, Yellow for in-transit, Red for others
  const bgColor =
    booking.job_status === "completed"
      ? "#ACF35C"
      : booking.job_status === "in-transit"
      ? "#FFED4C"
      : "#FF4C4C";

  return (
    <View style={tailwind`flex-col m-4 bg-white shadow-xl rounded-xl`}>
      <View
        style={[
          tailwind`flex-row items-center justify-between p-2 rounded-t-xl`,
          { backgroundColor: bgColor },
        ]}
      >
        <View style={tailwind`flex-col items-start pl-2`}>
          <Text style={tailwind`text-lg font-bold text-black`}>
            Booking ID:
          </Text>
          <Text style={tailwind`text-lg text-black`}>
            {booking._id ? booking._id : booking.id}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={"clipboard-list"}
          size={30}
          color="#3686E9"
        />
      </View>

      <View style={tailwind`p-3`}>
        {/* Vehicle Number */}
        <View style={tailwind`flex-row items-center`}>
          <Text style={tailwind`text-base font-bold text-black pr-2`}>
            Vehicle No:
          </Text>
          <Text style={tailwind`text-base text-black`}>
            {booking.vehicle_no}
          </Text>
        </View>

        {/* Driver ID */}
        <View style={tailwind`flex-row items-center`}>
          <Text style={tailwind`text-base font-bold text-black pr-2`}>
            Driver ID:
          </Text>
          <Text style={tailwind`text-base text-black`}>
            {booking.driver_id}
          </Text>
        </View>

        {/* User ID */}
        <View style={tailwind`flex-row items-center`}>
          <Text style={tailwind`text-base font-bold text-black pr-2`}>
            User ID:
          </Text>
          <Text style={tailwind`text-base text-black`}>{booking.user_id}</Text>
        </View>

        {/* Pickup and Dropoff Locations */}
        <View style={tailwind`flex-row justify-between p-3`}>
          <View style={tailwind`flex-col items-center`}>
            <Text style={tailwind`text-base font-bold text-black`}>Pickup</Text>
            <Text style={tailwind`text-sm text-black`}>
              Lat: {booking?.pickup_location?.latitude.toFixed(4)}
            </Text>
            <Text style={tailwind`text-sm text-black`}>
              Lon: {booking?.pickup_location?.longitude.toFixed(4)}
            </Text>
          </View>
          <View style={tailwind`flex-col items-center`}>
            <Text style={tailwind`text-base font-bold text-black`}>
              Dropoff
            </Text>
            <Text style={tailwind`text-sm text-black`}>
              Lat: {booking?.dropoff_location?.latitude.toFixed(4)}
            </Text>
            <Text style={tailwind`text-sm text-black`}>
              Lon: {booking?.dropoff_location?.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Distance and Cost */}
        <View style={tailwind`flex-row justify-between p-3`}>
          <View style={tailwind`flex-col items-center`}>
            <Text style={tailwind`text-base font-bold text-black`}>
              Distance
            </Text>
            <Text style={tailwind`text-base text-black`}>
              {booking.distance.toFixed(2)} km
            </Text>
          </View>
          <View style={tailwind`flex-col items-center`}>
            <Text style={tailwind`text-base font-bold text-black`}>Cost</Text>
            <Text style={tailwind`text-base text-black`}>
              ₹{booking.cost.toFixed(2)}
            </Text>
          </View>
        </View>
        {/* Address Information */}
        <View style={tailwind`flex-col my-3 `}>
          <View style={tailwind`flex-row items-center`}>
            <Text style={tailwind`text-base font-bold text-black pr-2`}>
              Pickup Address:
            </Text>
            <Text style={tailwind`text-base text-black`}>{pickupAddress}</Text>
          </View>
          <View style={tailwind`flex-row items-center`}>
            <Text style={tailwind`text-base font-bold text-black pr-2`}>
              Dropoff Address:
            </Text>
            <Text style={tailwind`text-base text-black`}>{dropoffAddress}</Text>
          </View>
        </View>

        {/* Job Status */}
        <View style={tailwind`flex-row items-center`}>
          <Text style={tailwind`text-base font-bold text-black pr-2`}>
            Status:
          </Text>
          <Text style={tailwind`text-base text-black`}>
            {booking.job_status}
          </Text>
        </View>

        {/* Buttons for Tracking and Completing Job */}
        {booking.job_status === "in-transit" && (
          <View style={tailwind`flex-col mt-4`}>
            <View style={tailwind`flex-col pb-2 mt-2`}>
              <Button
                title="Track Now"
                onPress={() =>
                  navigation.navigate("Map", {
                    vehicle_no: booking.vehicle_no,
                    pickup_location: booking.pickup_location,
                    dropoff_location: booking.dropoff_location,
                    userDetails: userDetails,
                  })
                }
                color="#3686E9"
              />
            </View>
            {userDetails.type === "driver" && (
              <View>
                <Button
                  title="Complete Job"
                  onPress={() => {
                    completeJob(booking);
                  }}
                  color="#3686E9"
                />
                <ErrorPopup
                  visible={errorVisible}
                  message={errorMessage}
                  onClose={() => setErrorVisible(false)}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderInfo;
