import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { SERVER_URL } from "../../../env";
import { useFocusEffect } from "@react-navigation/native";

const AdminDashboard = () => {
  const [bookingData, setBookingData] = useState({});
  const [vehicleData, setVehicleData] = useState({});
  const [driverData, setDriverData] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      // Fetch booking analysis
      fetch(SERVER_URL + "analysis/bookings")
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setBookingData(data))
        .catch((error) => console.error("Error fetching booking data:", error));

      // Fetch vehicle analysis
      fetch(SERVER_URL + "analysis/vehicles")
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setVehicleData(data))
        .catch((error) => console.error("Error fetching vehicle data:", error));

      // Fetch driver analysis
      fetch(SERVER_URL + "analysis/drivers")
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => setDriverData(data))
        .catch((error) => console.error("Error fetching driver data:", error));
    }, [])
  );

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundColor: "#1cc910",
    backgroundGradientFrom: "#eff3ff",
    backgroundGradientTo: "#efefef",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView>
        {/* Booking Analysis Pie Chart */}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          Booking Analysis
        </Text>
        {bookingData &&
          bookingData.completed !== undefined &&
          bookingData.pending !== undefined && (
            <PieChart
              data={[
                {
                  name: "Completed",
                  population: bookingData.completed,
                  color: "#00ff00",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Pending",
                  population: bookingData.pending,
                  color: "#ff0000",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
              ]}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="5"
              center={[2, 5]}
              absolute
            />
          )}

        {/* Driver Analysis Pie Chart */}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          Driver Analysis
        </Text>
        {driverData &&
          driverData.not_verified !== undefined &&
          driverData.free !== undefined &&
          driverData.busy !== undefined && (
            <PieChart
              data={[
                {
                  name: "Not Verified",
                  population: driverData.not_verified,
                  color: "#ff0000",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Free",
                  population: driverData.free,
                  color: "#00ff00",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Busy",
                  population: driverData.busy,
                  color: "#0000ff",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
              ]}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="5"
              center={[2, 5]}
              absolute
            />
          )}

        {/* Vehicle Analysis Pie Chart */}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          Vehicle Analysis
        </Text>
        {vehicleData &&
          vehicleData.free !== undefined &&
          vehicleData.busy !== undefined && (
            <PieChart
              data={[
                {
                  name: "Free",
                  population: vehicleData.free,
                  color: "#00ff00",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Busy",
                  population: vehicleData.busy,
                  color: "#ff0000",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
              ]}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="5"
              center={[2, 5]}
              absolute
            />
          )}
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;
