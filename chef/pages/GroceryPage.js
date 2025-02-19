import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import { AntDesign } from "@expo/vector-icons"; // ✅ For "Remove Meal" button
import { MaterialIcons } from "@expo/vector-icons"; // ✅ For Apple Reminders-style checklist

export default function GroceryPage() {
  const navigation = useNavigation();
  const [groceryList, setGroceryList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [userId, setUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // ✅ State to trigger re-fetch

  // ✅ Fetch authenticated user ID
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUserId(data?.user?.id);
      }
    };
    getUser();
  }, []);

  // ✅ Fetch grocery list from Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchGroceryList = async () => {
      const { data, error } = await supabase
        .from("cooked_meals")
        .select("meal_id, meal_name, ingredients")
        .eq("user_id", userId);

      if (error) {
        Alert.alert("Error", "Failed to fetch grocery list.");
        return;
      }

      // Convert ingredients JSONB into a structured list
      const formattedList = data.map((meal) => ({
        meal_id: meal.meal_id, // ✅ Store meal ID for deletion
        meal_name: meal.meal_name,
        ingredients: JSON.parse(meal.ingredients),
      }));

      setGroceryList(formattedList);
    };

    fetchGroceryList();
  }, [userId, refreshKey]); // ✅ Refresh list whenever `refreshKey` changes

  // ✅ Toggle checkbox styling (Apple Reminders-style)
  const toggleCheckbox = (mealIndex, ingredientIndex) => {
    setCheckedItems((prev) => ({
      ...prev,
      [`${mealIndex}-${ingredientIndex}`]: !prev[`${mealIndex}-${ingredientIndex}`],
    }));
  };

  // ✅ Delete a meal from Supabase & refresh page
  const removeMeal = async (mealId) => {
    Alert.alert("Remove Meal", "Are you sure you want to remove this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            const { error } = await supabase.from("cooked_meals").delete().eq("meal_id", mealId);

            if (error) {
              console.error("Error deleting meal:", error);
              Alert.alert("Error", "Failed to remove meal.");
            } else {
              Alert.alert("Success", "Meal removed successfully!");
              setRefreshKey((prevKey) => prevKey + 1); // ✅ Trigger refresh
            }
          } catch (error) {
            console.error("Unexpected error:", error);
            Alert.alert("Error", "Something went wrong.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Grocery List 🛒</Text>

      <FlatList
        data={groceryList}
        keyExtractor={(item) => item.meal_id.toString()}
        renderItem={({ item, index: mealIndex }) => (
          <View style={styles.mealSection}>
            {/* Meal Header with Remove Button */}
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{item.meal_name}</Text>
              <TouchableOpacity onPress={() => removeMeal(item.meal_id)}>
                <AntDesign name="closecircle" size={24} color="red" />
              </TouchableOpacity>
            </View>

            {/* Grocery Checklist */}
            {item.ingredients.map((ingredient, ingredientIndex) => (
              <TouchableOpacity
                key={ingredientIndex}
                style={styles.ingredientItem}
                onPress={() => toggleCheckbox(mealIndex, ingredientIndex)}
              >
                {/* Apple Reminders-style checkbox */}
                <MaterialIcons
                  name={checkedItems[`${mealIndex}-${ingredientIndex}`] ? "check-circle" : "radio-button-unchecked"}
                  size={24}
                  color={checkedItems[`${mealIndex}-${ingredientIndex}`] ? "green" : "gray"}
                />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  backText: {
    fontSize: 18,
    color: "#6200ea",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  mealSection: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  ingredientText: {
    fontSize: 16,
    marginLeft: 8,
  },
});
