import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import tw from "twrnc";
// import { ScrollView } from "react-native";

const Admin_Login = (props) => {
  const [username, set_username] = useState("");
  const [Password, set_pass] = useState("");
  const Submit = () => {
    if (username === "admin" && Password === "123") {
      console.log("yes");
      props.user({ uid: username, type: "admin" });
      Alert.alert("Verified Successfully");
      // const obj = { username: username };
      // props.navigation.navigate("Dashboard", obj);
    } else if (username === "rohit" && Password === "123") {
      props.user({ uid: username, type: "Admin" });
      Alert.alert("Verified Successfully");
    } else {
      Alert.alert("Username or Password Is in correct");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={tw`flex-1 flex-col bg-white items-center  relative`}>
        <View style={tw`items-center`}>
          <View style={tw`flex items-center h-60 w-80 p-2`}>
            <Image
              style={tw`w-full h-full `}
              source={require("../../assets/app_logo.jpg")}
            />
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw` text-gray-700 text-xl font-bold mb-2`}>
              Username
            </Text>
            <TextInput
              style={tw`border rounded w-80 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline`}
              autoCapitalize="none"
              value={username}
              onChangeText={(input) => {
                set_username(input);
              }}
            />
          </View>
          <View style={tw`relative mb-4`}>
            <Text style={tw`text-gray-700 text-xl font-bold mb-2`}>
              Password
            </Text>
            <TextInput
              style={tw`border rounded w-80 py-2 px-3 text-gray-700  focus:outline-none focus:shadow-outline `}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              value={Password}
              onChangeText={(input) => {
                set_pass(input);
              }}
            />
          </View>
          <View style={tw`flex flex-col items-center justify-center`}>
            <TouchableOpacity
              onPress={() => {
                Submit();
              }}
            >
              <Text
                style={tw` w-40 text-xl bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded text-center m-3`}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate("Login");
            }}
          >
            <Text style={tw`text-base text-blue-700`}>Sign-In as Operator</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Admin_Login;
