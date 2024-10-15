import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import { SERVER_URL } from "../../../env";
import DriverInfo from "../../Components/DriverInfo";
import { useFocusEffect } from "@react-navigation/native";

const Driver = () => {
  const [assignments, setAssignments] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      setAssignments([]);
      // GET all assignments
      fetch(SERVER_URL + "assignments")
        .then((res) => res.json())
        .then((data) => setAssignments(data))
        .catch((error) => console.error("Error fetching assignments:", error));
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      {console.log(assignments)}
      {assignments && assignments.length > 0 ? (
        assignments.map((assignment) => (
          <DriverInfo key={assignment.id} assign={assignment} />
        ))
      ) : (
        <Text>No assignments available</Text>
      )}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  redText: {
    color: "red",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    width: "80%",
    padding: 10,
  },
});

export default Driver;
