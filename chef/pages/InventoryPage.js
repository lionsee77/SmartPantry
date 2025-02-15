import React, { useEffect, useState, useRef } from "react";
import { View, FlatList, StyleSheet, Alert, Animated } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";

// Placeholder USER_ID. Update with endpoint
const USER_ID = "fdde9b7f-1442-4c08-af35-e8cbdc60de53";

export default function InventoryPage() {
  const navigation = useNavigation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header animations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const headerMarginBottom = scrollY.interpolate({
    inputRange: [0, 150],  
    outputRange: [20, 0],  // Start with more space, reduce when scrolling
    extrapolate: "clamp",
  });
  

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const backButtonTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  // Fetch inventory from Supabase for the specific User ID
  const fetchInventory = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pantry")
      .select("ingredient_name, quantity, unit, expiry_date, storage_location")
      .eq("user_id", USER_ID);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setInventory(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Back Button */}
      <Animated.View style={[styles.backButton, { opacity: backButtonOpacity, transform: [{ translateY: backButtonTranslateY }] }]}>
        <Text style={styles.backText} onPress={() => navigation.goBack()}>← Back</Text>
      </Animated.View>

      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerTranslateY }], marginBottom: headerMarginBottom }]}>
        <Text style={styles.title}>Pantry Inventory 📦</Text>
      </Animated.View>

      {/* Show loading spinner */}
      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#6200ea" />
      ) : inventory.length > 0 ? (
        <Animated.FlatList
          data={inventory}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>{item.ingredient_name}</Text>
                <Text>📦 Storage: {item.storage_location}</Text>
                <Text>📅 Expiry: {item.expiry_date || "Unknown"}</Text>
                <Text>📏 Quantity: {item.quantity} {item.unit}</Text>
              </Card.Content>
            </Card>
          )}
        />
      ) : (
        <Text style={styles.noData}>No inventory items found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 18,
    color: "#6200ea",
  },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: "white",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  noData: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
});

