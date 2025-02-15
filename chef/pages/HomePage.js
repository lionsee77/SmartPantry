import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Background, Logo, Header, Paragraph, Button, TextInput, BackButton, theme } from "../components";


// Import other pages
import ReceiptPage from "./ReceiptPage";
import MealPrepPage from "./MealPrepPage";
import InventoryPage from "./InventoryPage";
import SettingsPage from "./SettingsPage";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Profile Icon in Top Right */}
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={() => navigation.navigate("SettingsPage")}
      >
        <Image
          source={require("../assets/logo.png")} // Add a profile icon in assets
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Background>
        <Logo />
        <Header>Welcome 💫</Header>
        <Paragraph>Congratulations you are logged in.</Paragraph>
      </Background>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("ReceiptPage")}
        >
          <MaterialIcons name="receipt-long" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("MealPrepPage")}
        >
          <MaterialIcons name="restaurant-menu" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("InventoryPage")}
        >
          <MaterialIcons name="inventory" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("HomeScreen")}>
          <MaterialIcons name="home" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  profileIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 60,
    backgroundColor: "#6200ea",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navButton: {
    padding: 10,
  },
});
