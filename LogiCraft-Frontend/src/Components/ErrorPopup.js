import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

const ErrorPopup = ({ visible, message, onClose }) => {
  return (
    <Modal transparent={true} animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.message}>{message}</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popup: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  message: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default ErrorPopup;
