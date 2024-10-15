import React from "react";
import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import tailwind from "twrnc";

const UserDashboard = (props) => {
  const navigation = useNavigation();
  console.log(props?.userDetails);
  console.log(props);

  return (
    <View style={tailwind`flex-1 items-center justify-center bg-gray-100 p-4`}>
      <View style={tailwind`w-full max-w-md bg-white shadow-xl rounded-xl p-4`}>
        <View style={tailwind`flex-row items-center mb-4`}>
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color="#3686E9"
          />
          <Text style={tailwind`text-lg font-bold text-black ml-2`}>
            Welcome {props.userDetails.name}
          </Text>
        </View>

        <View style={tailwind`flex-row items-center mb-2`}>
          <MaterialCommunityIcons name="phone" size={20} color="#3686E9" />
          <Text style={tailwind`text-base text-black ml-2`}>
            Phone Number: {props.userDetails.phone_number}
          </Text>
        </View>

        <View style={tailwind`flex-row items-center mb-2`}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#3686E9" />
          <Text style={tailwind`text-base text-black ml-2`}>
            Address: {props.userDetails.address}
          </Text>
        </View>

        <Button
          title="Book Transportation"
          onPress={() =>
            navigation.navigate("Booking", {
              screen: "BookTransportation",
              params: { userDetails: props.userDetails },
            })
          }
          color="#3686E9"
        />
      </View>
    </View>
  );
};

export default UserDashboard;
