import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text } from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import InvEditButton from "../components/InvEditButton";
import InvInput from "../components/InvInput";
import InvPopup from "../components/InvPopup";

export default function InventoryPage() {
  const navigation = useNavigation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [newStorage, setNewStorage] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Authentication Error", "Unable to retrieve user details.");
      } else {
        setUserId(data?.user?.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchInventory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pantry")
        .select("pantry_id, ingredient_name, quantity, unit, expiry_date, storage_location")
        .eq("user_id", userId);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setInventory(data);
      }

      setLoading(false);
    };

    fetchInventory();
  }, [userId]);

  const openEditModal = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity.toString());
    setNewStorage(item.storage_location || "");
    setNewExpiryDate(item.expiry_date ? new Date(item.expiry_date) : new Date());
    setIsModalVisible(true);
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from("pantry")
      .update({
        quantity: parseFloat(newQuantity),
        storage_location: newStorage,
        expiry_date: newExpiryDate.toISOString().split("T")[0],
      })
      .eq("pantry_id", selectedItem.pantry_id);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Item updated successfully!");
      setIsModalVisible(false);

      setInventory((prev) =>
        prev.map((item) =>
          item.pantry_id === selectedItem.pantry_id
            ? { ...item, quantity: parseFloat(newQuantity), storage_location: newStorage, expiry_date: newExpiryDate.toISOString().split("T")[0] }
            : item
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button (Fixed) */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pantry Inventory 📦</Text>

      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#6200ea" />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item) => item.pantry_id.toString()}
          contentContainerStyle={{ ...styles.listContainer, paddingRight: 10 }} // Moves content slightly left
          showsVerticalScrollIndicator={false} // Removes default scrollbar
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>{item.ingredient_name}</Text>
                <Text>📦 Storage: {item.storage_location || "Not specified"}</Text>
                <Text>📅 Expiry: {item.expiry_date || "Unknown"}</Text>
                <Text>📏 Quantity: {item.quantity} {item.unit}</Text>

                {/* Edit Button */}
                <InvEditButton onPress={() => openEditModal(item)} />
              </Card.Content>
            </Card>
          )}
        />
      )}

      {/* Modal Popup */}
      <InvPopup 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        onSave={handleUpdateItem}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        newExpiryDate={newExpiryDate}
        setNewExpiryDate={setNewExpiryDate}
      >
        <InvInput label="Quantity" value={newQuantity} onChangeText={setNewQuantity} keyboardType="numeric" />
        <InvInput label="Storage Location" value={newStorage} onChangeText={setNewStorage} />
      </InvPopup>
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
    top: 50, // Fixed position
    left: 20,
    zIndex: 10, // Ensures it's clickable
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Light background to make it visible
  },
  backText: {
    fontSize: 18,
    color: "#6200ea",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 60, // Pushes title down to avoid overlap with the iPhone notch
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    marginTop: 20, // Adds spacing between back button and first entry
  },
  card: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
