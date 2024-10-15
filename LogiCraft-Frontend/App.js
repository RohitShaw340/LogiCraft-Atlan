import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useState } from "react";
import tw from "twrnc";
import "react-native-get-random-values";

import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "react-native-vector-icons";
// import { Package2 } from "lucide-react";

import Login from "./src/Screens/Login";
import Admin_Login from "./src/Screens/Admin_Login";
import Dashboard from "./src/Screens/Admin/Dashboard";

import Map from "./src/Screens/Map";
import DriverDashboard from "./src/Screens/Driver/DriverDashboard";
import UserDashboard from "./src/Screens/User/UserDashboard";
import BookTransportation from "./src/Screens/User/BookTransportation";

import Driver from "./src/Screens/Admin/Driver";
import Vehicle from "./src/Screens/Admin/Vehicle";
import Logout from "./src/Screens/Logout";
import SignUp from "./src/Screens/SignUp";
import Bookings from "./src/Screens/Bookings";

export default function App() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const [user, setUser] = useState(null);

  const signout = () => {
    setUser(null);
  };

  const MainStackNavigator = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="BookTransportation"
          component={BookTransportation}
        />
      </Stack.Navigator>
    );
  };

  if (user?.type == "admin") {
    console.log(user);
    return (
      <ToastProvider offsetBottom={130} successColor="green">
        <SafeAreaView>
          <NavigationContainer>
            <View style={tw`w-full h-full flex flex-col`}>
              <Tab.Navigator
                backBehavior={"history"}
                screenOptions={{
                  tabBarActiveTintColor: "tomato",
                  tabBarInactiveTintColor: "gray",
                  tabBarLabelStyle: { fontSize: 15, paddingBottom: 6 },
                  tabBarStyle: {
                    height: 70,
                    position: "fixed",
                    bottom: 0,
                  },
                }}
                initialRouteName="Dashboard"
              >
                <Tab.Screen
                  name="Dashboard"
                  // component={Dashboard}
                  options={{
                    headerRight: () => <Logout logout={signout} />,
                    tabBarLabel: "Dashboard",
                    tabBarIcon: ({ focused }) => {
                      return (
                        <Ionicons
                          name={focused ? "home" : "home-outline"}
                          size={30}
                          color={focused ? "tomato" : "gray"}
                        />
                      );
                    },
                  }}
                >
                  {(props) => (
                    <Dashboard {...props} userDetails={user} logout={signout} />
                  )}
                </Tab.Screen>

                <Tab.Screen
                  name="Driver"
                  component={Driver}
                  options={{
                    tabBarLabel: "Drivers",
                    tabBarIcon: ({ focused }) => {
                      return (
                        <MaterialIcons
                          name="engineering"
                          size={30}
                          color={focused ? "tomato" : "gray"}
                        />
                      );
                    },
                  }}
                />
                <Tab.Screen
                  name="Vehicle"
                  component={Vehicle}
                  options={{
                    tabBarLabel: "Vehicle",
                    tabBarIcon: ({ focused }) => {
                      return (
                        <MaterialCommunityIcons
                          name="dump-truck"
                          size={30}
                          color={focused ? "tomato" : "gray"}
                        />
                      );
                    },
                  }}
                />
                <Tab.Screen
                  name="Orders"
                  options={{
                    headerRight: () => <Logout logout={signout} />,
                    tabBarLabel: "Bookings",
                    tabBarIcon: ({ focused }) => {
                      return (
                        <Ionicons
                          name={focused ? "clipboard" : "clipboard-outline"}
                          size={30}
                          color={focused ? "tomato" : "gray"}
                        />
                      );
                    },
                  }}
                >
                  {(props) => (
                    <Bookings {...props} userDetails={user} logout={signout} />
                  )}
                </Tab.Screen>
                <Tab.Screen
                  name="Map"
                  component={Map}
                  options={{
                    tabBarButton: () => null, // Hide the bottom tab bar
                  }}
                />
              </Tab.Navigator>
            </View>
          </NavigationContainer>
          <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.6)" />
        </SafeAreaView>
      </ToastProvider>
    );
  } else if (user?.type == "user" || user?.type == "driver") {
    console.log("User loaded : ", user);
    return (
      <ToastProvider>
        <SafeAreaView>
          <NavigationContainer>
            <View style={tw`w-full h-full flex flex-col`}>
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: "tomato",
                  tabBarInactiveTintColor: "gray",
                  tabBarLabelStyle: { fontSize: 15, paddingBottom: 6 },
                  tabBarStyle: {
                    height: 70,
                    position: "fixed",
                    bottom: 0,
                  },
                }}
                initialRouteName="Dashboard"
              >
                <Tab.Screen
                  name="Dashboard"
                  options={{
                    headerRight: () => <Logout logout={signout} />,
                    tabBarLabel: "Dashboard",
                    tabBarIcon: ({ focused }) => {
                      return (
                        <Ionicons
                          name={focused ? "home" : "home-outline"}
                          size={30}
                          color={focused ? "tomato" : "gray"}
                        />
                      );
                    },
                  }}
                >
                  {user?.type == "user"
                    ? (props) => (
                        <UserDashboard
                          {...props}
                          userDetails={user}
                          logout={signout}
                        />
                      )
                    : (props) => (
                        <DriverDashboard
                          {...props}
                          userDetails={user}
                          logout={signout}
                        />
                      )}
                </Tab.Screen>

                <Tab.Screen
                  name="Orders"
                  options={{
                    headerRight: () => <Logout logout={signout} />,
                    tabBarLabel: "Bookings",
                    tabBarIcon: ({ focused }) => {
                      return (
                        <Ionicons
                          name={focused ? "clipboard" : "clipboard-outline"}
                          size={30}
                          color={focused ? "tomato" : "gray"}
                        />
                      );
                    },
                  }}
                >
                  {(props) => (
                    <Bookings {...props} userDetails={user} logout={signout} />
                  )}
                </Tab.Screen>
                <Tab.Screen
                  name="Booking"
                  component={MainStackNavigator}
                  options={{
                    tabBarButton: () => null,
                  }}
                />
                <Tab.Screen
                  name="Map"
                  component={Map}
                  options={{
                    tabBarButton: () => null,
                  }}
                />
              </Tab.Navigator>
            </View>
          </NavigationContainer>
          <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.6)" />
        </SafeAreaView>
      </ToastProvider>
    );
  }
  console.log("null");
  return (
    <ToastProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login">
              {(props) => <Login {...props} user={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Admin_Login">
              {(props) => <Admin_Login {...props} user={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Signup">
              {(props) => <SignUp {...props} user={setUser} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.6)" />
      </SafeAreaView>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
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
