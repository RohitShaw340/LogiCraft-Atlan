import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Checkbox from "expo-checkbox";
import * as Crypto from "expo-crypto";
import tw from "twrnc";
import { Feather } from "@expo/vector-icons";
import { SERVER_URL } from "../../env";

const SignUp = (props) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState(""); // New state for Address
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user"); // New state for User Type (default: "user")
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (phoneNumber === "" || password === "") {
      Alert.alert("Error", "Please enter a valid phone number and password");
      return;
    }

    try {
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );

      // Prepare the data to send to the server
      const userData = {
        name: name,
        phone_number: phoneNumber,
        address: address,
        password: hashedPassword,
        user_type: userType,
      };

      const api_url = SERVER_URL + "signup";

      // Make the POST request
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.status === 200) {
        Alert.alert("Success", "Your account has been created successfully");

        props.navigation.navigate("Login");
      } else if (response.status === 409) {
        Alert.alert("Warning", "Your account already exists");

        props.navigation.navigate("Login");
      } else {
        throw new Error("Failed to create account");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      Alert.alert("Signup Error", error.message || "Failed to create account");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow justify-center px-6 py-10`}
        >
          <View style={tw`bg-white rounded-3xl shadow-lg px-8 py-10`}>
            <Text
              style={tw`text-4xl font-bold text-center text-indigo-600 mb-8`}
            >
              Create Account
            </Text>

            {/* Name Field */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-700 text-lg font-semibold mb-2`}>
                Name
              </Text>
              <View style={tw`flex-row items-center border-b border-gray-300`}>
                <Feather
                  name="user"
                  size={20}
                  color="#4F46E5"
                  style={tw`mr-2`}
                />
                <TextInput
                  style={tw`flex-1 py-2 text-lg text-gray-700`}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Phone Number Field */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-700 text-lg font-semibold mb-2`}>
                Phone Number
              </Text>
              <View style={tw`flex-row items-center border-b border-gray-300`}>
                <Feather
                  name="phone"
                  size={20}
                  color="#4F46E5"
                  style={tw`mr-2`}
                />
                <TextInput
                  style={tw`flex-1 py-2 text-lg text-gray-700`}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Address Field */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-700 text-lg font-semibold mb-2`}>
                Address
              </Text>
              <View style={tw`flex-row items-center border-b border-gray-300`}>
                <Feather
                  name="map-pin"
                  size={20}
                  color="#4F46E5"
                  style={tw`mr-2`}
                />
                <TextInput
                  style={tw`flex-1 py-2 text-lg text-gray-700`}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-700 text-lg font-semibold mb-2`}>
                Password
              </Text>
              <View style={tw`flex-row items-center border-b border-gray-300`}>
                <Feather
                  name="lock"
                  size={20}
                  color="#4F46E5"
                  style={tw`mr-2`}
                />
                <TextInput
                  style={tw`flex-1 py-2 text-lg text-gray-700`}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#4F46E5"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* User Type Radio Buttons */}
            <View style={tw`flex-row justify-between mb-6`}>
              <TouchableOpacity
                style={tw`flex-row items-center`}
                onPress={() => setUserType("user")}
              >
                <View
                  style={tw`w-6 h-6 rounded-full border-2 border-indigo-600 justify-center items-center mr-2 ${
                    userType === "user" ? "bg-indigo-600" : "bg-white"
                  }`}
                >
                  {userType === "user" && (
                    <View style={tw`w-3 h-3 rounded-full bg-white`} />
                  )}
                </View>
                <Text style={tw`text-gray-700`}>User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-row items-center`}
                onPress={() => setUserType("driver")}
              >
                <View
                  style={tw`w-6 h-6 rounded-full border-2 border-indigo-600 justify-center items-center mr-2 ${
                    userType === "driver" ? "bg-indigo-600" : "bg-white"
                  }`}
                >
                  {userType === "driver" && (
                    <View style={tw`w-3 h-3 rounded-full bg-white`} />
                  )}
                </View>
                <Text style={tw`text-gray-700`}>Driver</Text>
              </TouchableOpacity>
            </View>

            {/* Terms Checkbox */}
            <View style={tw`flex-row items-center mb-6`}>
              <Checkbox
                style={tw`w-6 h-6 mr-2`}
                value={agree}
                onValueChange={setAgree}
                color={agree ? "#4F46E5" : undefined}
              />
              <Text style={tw`text-gray-600`}>
                I agree to the Terms and Conditions
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={tw`${
                agree ? "bg-indigo-600" : "bg-gray-400"
              } rounded-full py-3 px-6`}
              onPress={handleSubmit}
              disabled={!agree}
            >
              <Text style={tw`text-white text-lg font-semibold text-center`}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
