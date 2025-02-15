import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";

// Placeholder USER_ID. Update with endpoint
const USER_ID = "fdde9b7f-1442-4c08-af35-e8cbdc60de53";

export default function InventoryPage() {
  const navigation = useNavigation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inventory from Supabase for the specific User ID
  const fetchInventory = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pantry")
      .select("ingredient_name, quantity, unit, expiry_date, storage_location")
      .eq("user_id", USER_ID); // ✅ Filter by the specific User ID

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
      <Text style={styles.header}>📦 Pantry Inventory</Text>

      {/* Show loading spinner */}
      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#6200ea" />
      ) : inventory.length > 0 ? (
        <FlatList
          data={inventory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>{item.ingredient_name}</Text>
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

      {/* Back Button */}
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  card: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: "white",
  },
  title: {
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
  backButton: {
    marginTop: 20,
    backgroundColor: "#6200ea",
  },
});
