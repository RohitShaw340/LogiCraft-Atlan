import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useState, useCallback } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { useToast } from "react-native-toast-notifications";
import { useFocusEffect } from "@react-navigation/native";
import { SERVER_URL } from "../../../env";
import VehicleInfo from "../../Components/VehicleInfo";

const Vehicle = () => {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const vehicleTypes = ["Small", "Medium", "Large"];

  // Fetch all vehicles from the server
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(SERVER_URL + "/vehicles");
      const data = await response.json();

      if (data.vehicles) {
        setVehicles(data.vehicles);
      } else {
        throw new Error("No vehicles found");
      }

      setIsLoading(false);
    } catch (err) {
      setError(true);
      setIsLoading(false);
    }
  };

  d;
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  const submitVehicle = async () => {
    if (!vehicleNo || !vehicleType) {
      toast.show("Please fill out all fields", { type: "warning" });
      return;
    }

    try {
      const response = await fetch(SERVER_URL + "add/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_type: vehicleType.toLowerCase(),
          vehicle_no: vehicleNo.toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add vehicle");
      }

      setVehicleNo("");
      setVehicleType(null);
      setAddModalVisible(false);

      toast.show("Vehicle added successfully", { type: "success" });

      fetchVehicles();
    } catch (error) {
      toast.show("Failed to add vehicle", { type: "danger" });
    }
  };

  // Render the modal for adding a vehicle
  const renderAddModal = () => (
    <Modal
      visible={addModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAddModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Vehicle</Text>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={30} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.formInput}
              placeholder="Enter Vehicle Number"
              value={vehicleNo}
              onChangeText={(input) => setVehicleNo(input)}
            />

            {/* Picker for vehicle type */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={vehicleType}
                onValueChange={(itemValue) => setVehicleType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Vehicle Type" value={null} />
                {vehicleTypes.map((type) => (
                  <Picker.Item label={type} value={type} key={type} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={submitVehicle}>
              <MaterialCommunityIcons
                name="truck-plus-outline"
                size={25}
                color="#fff"
              />
              <Text style={styles.submitBtnText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderVehicle = ({ item }) => {
    if (!item || !item.id || !item.vehicle_no) {
      return null;
    }
    return <VehicleInfo vehicle={item} />;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="black" />
      ) : error ? (
        <Text>Something went wrong</Text>
      ) : vehicles && vehicles.length === 0 ? (
        <Text>No Vehicles Added</Text>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item?.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={styles.addBtnContainer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="truck-plus-outline"
            size={25}
            color="#fff"
          />
          <Text style={styles.addBtnText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
      {renderAddModal()}
    </View>
  );
};

export default Vehicle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  addBtnContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#fff",
  },
  addBtn: {
    flexDirection: "row",
    height: 45,
    backgroundColor: "#FE7654",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalWrapper: {
    backgroundColor: "white",
    padding: 15,
    width: "100%",
    height: "80%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#828282",
  },
  formContainer: {
    marginTop: 10,
  },
  formInput: {
    padding: 10,
    backgroundColor: "#F3F4F8",
    borderRadius: 7,
    marginBottom: 20,
  },
  pickerContainer: {
    backgroundColor: "#f5d271",
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#FE7654",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    marginTop: 20,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
