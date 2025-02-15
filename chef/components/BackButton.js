import React from "react";
import { TouchableOpacity, Image, StyleSheet, View } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { useNavigation } from "@react-navigation/native"; 

export default function BackButton() {
  const navigation = useNavigation(); 

  const handleGoBack = () => {

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("StartScreen"); 
    }
  };

  return (
    <View style={styles.absoluteContainer}>
      <TouchableOpacity onPress={handleGoBack} style={styles.container}>
        <Image
          style={styles.image}
          source={require("../assets/back.png")}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 10 + getStatusBarHeight(),
    left: 10,
    zIndex: 100, 
    elevation: 10, 
  },
  container: {
    padding: 10,
  },
  image: {
    width: 24,
    height: 24,
  },
});
