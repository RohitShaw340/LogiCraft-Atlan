import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import tailwind from "twrnc";

const Logout = (props) => {
  return (
    <View style={styles.but2}>
      <TouchableOpacity
        onPress={() => {
          return Alert.alert(
            "Are your sure?",
            "Are you sure you want Logout?",
            [
              {
                text: "Yes",
                onPress: () => {
                  props.logout();
                },
              },
              {
                text: "No",
              },
            ]
          );
        }}
      >
        <Text style={tailwind`text-center text-white`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  but2: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    color: "white",
    width: 70,
    height: 30,
    margin: 10,
    backgroundColor: "#4D59F5",
  },
});

export default Logout;
