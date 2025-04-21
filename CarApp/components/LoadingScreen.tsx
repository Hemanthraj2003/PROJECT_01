import React from "react";
import { View, StyleSheet, Modal, ActivityIndicator } from "react-native";
import colorThemes from "../app/theme";

interface LoadingScreenProps {
  visible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colorThemes.primary1} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
});

export default LoadingScreen;
