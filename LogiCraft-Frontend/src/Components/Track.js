import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import tailwind from "twrnc";
import { useRef } from "react";
import LocationMarker from "./LocationMarker";

const Track = (props) => {
  const coordinates = {
    coords: {
      ...props.source.coords,
      // latitude: 27.099699392611285,
      // longitude: 74.06328262321595,
      //   latitude: 20.94915883708834,
      //   longitude: 85.1501868996023,
    },
  };
  console.log(props.shovel);
  const mapRef = useRef(null);
  const [Loading, isLoading] = useState(true);
  const [location, setLocation] = useState({
    coords: { ...props.destination.coords },
  });
  const [coords, setCoords] = useState([]);
  const [permission_satatus, setStatus] = useState(false);

  const getPermission = async () => {
    // console.log(mapRef);
    let { status } = await Location.requestForegroundPermissionsAsync();

    console.log(status);
    if (status !== "granted") {
      console.log("please grant location permissions");
      return;
    }

    let currentLocation = coordinates;

    setLocation(currentLocation);
    setStatus((prev) => true);
    const loc = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.001,
    };
    mapRef.current.animateToRegion(loc, 1 * 1000);
    // isLoading(false);
    console.log("Loc :", currentLocation);
    return;
  };

  useEffect(() => {
    const func = async () => {
      isLoading(true);
      await getPermission()
        .then(() => isLoading(false))
        .catch(console.log("error in getting permissions"), isLoading(false));
    };
    func();
  }, []);

  const start = {
    ...props.source.coords,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const end = {
    ...props.destination.coords,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  if (Loading) {
    return (
      <View style={tailwind`flex-1 justify-center items-center h-full w-full`}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    if (permission_satatus) {
      console.log(location.coords.latitude);
      return (
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType="hybrid"
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.002,
              longitudeDelta: 0.001,
            }}
          >
            <Polyline
              coordinates={[start, end]} //specify our coordinates
              strokeColor={"#fff"}
              strokeWidth={3}
              lineDashPattern={[1]}
            />
            <LocationMarker {...props.source} />
            <LocationMarker {...props.destination} />
            {/* {coords.length > 0 && <Polyline coordinates={coords} />} */}
          </MapView>
          <TouchableOpacity
            onPress={getPermission}
            style={tailwind`absolute right-4 bottom-[20px] bg-white p-3 rounded-full`}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={30}
              color="black"
            />
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={getPath}
            style={tailwind`absolute left-4 bottom-[20px] bg-white p-3 rounded-full`}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={30}
              color="black"
            />
          </TouchableOpacity> */}
        </View>
      );
    } else {
      return (
        <View style={tailwind`flex-1 justify-center items-center`}>
          <Text>Location permission not granted</Text>
          <Button title="Grant permission" onPress={getPermission} />
        </View>
      );
    }
  }
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

export default Track;
