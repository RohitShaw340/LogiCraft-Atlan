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
import * as Crypto from "expo-crypto";
import { SERVER_URL } from "../../env";

const Login = (props) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const Submit = async () => {
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    try {
      const apiUrl = SERVER_URL + "login";
      console.log(apiUrl);

      // Send a POST request with the phone number and password
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phone,
          password: hashedPassword,
        }),
      });

      const result = await response.json();
      // console.log(result);
      if (response.ok && result?.success) {
        Alert.alert("Verified", "Verified Successfully", [
          {
            text: "Ok",
            onPress: () => {
              props.user(result);
            },
          },
        ]);
      } else {
        Alert.alert("Invalid phone number or password");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("An error occurred during login");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={tw`flex-1 flex-col bg-white items-center  relative`}>
        <View style={tw`items-center`}>
          <View style={tw`flex items-center h-60 w-80 p-2 pt-5 mt-6`}>
            <Image
              style={tw`w-[80%] h-[80%] `}
              source={require("../../assets/app_logo.jpg")}
            />
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw` text-gray-700 text-xl font-bold mb-2`}>
              Phone Number
            </Text>
            <TextInput
              style={tw`border rounded w-80 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline`}
              autoCapitalize="none"
              value={phone}
              onChangeText={(input) => {
                setPhone(input);
              }}
            />
          </View>
          <View style={tw`relative mb-4`}>
            <Text style={tw`text-gray-700 text-xl font-bold mb-2`}>
              Password
            </Text>
            <TextInput
              style={tw`border rounded w-80 py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline `}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              value={password}
              onChangeText={(input) => {
                setPassword(input);
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
              props.navigation.navigate("Admin_Login");
            }}
          >
            <Text style={tw`text-base text-blue-700`}>Sign-In as Admin </Text>
          </TouchableOpacity>
          <View style={tw`flex flex-row`}>
            <Text style={tw`relative text-base`}>Do Not Have a Account ? </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate("Signup");
              }}
            >
              <Text style={tw`text-base text-blue-700`}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
