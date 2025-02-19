import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import { TextInput, Button, Chip, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";
import DropDownPicker from "react-native-dropdown-picker";

export default function SettingsPage() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  // User preferences state
  const [allergies, setAllergies] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [diet, setDiet] = useState("none");
  const [favoriteCuisines, setFavoriteCuisines] = useState([]);
  const [preferredMealTypes, setPreferredMealTypes] = useState([]);
  const [effortLevel, setEffortLevel] = useState("moderate");

  // Dropdown state
  const [dietOpen, setDietOpen] = useState(false);
  const [effortOpen, setEffortOpen] = useState(false);

  // Available options
  const dietOptions = [
    { label: "None", value: "none" },
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Vegan", value: "vegan" },
    { label: "Keto", value: "keto" },
    { label: "Paleo", value: "paleo" },
  ];

  const effortOptions = [
    { label: "Easy", value: "easy" },
    { label: "Moderate", value: "moderate" },
    { label: "Complex", value: "complex" },
  ];

  const cuisineOptions = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "French"];
  const mealTypeOptions = ["Breakfast", "Lunch", "Dinner"];

  // Fetch user ID on mount
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

  // Fetch user preferences from Supabase
  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single();

      if (error) {
        console.error("Error fetching preferences:", error);
      } else if (data) {
        setAllergies(data.allergies ? data.allergies.join(", ") : "");
        setDislikes(data.dislikes ? data.dislikes.join(", ") : "");
        setDiet(data.diet || "none");
        setFavoriteCuisines(data.favorite_cuisines || []);
        setPreferredMealTypes(data.preferred_meal_types || []);
        setEffortLevel(data.effort_level || "moderate");
      }
    };

    fetchPreferences();
  }, [userId]);

  // Handle saving preferences
  const handleSavePreferences = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is missing. Please re-login.");
      return;
    }

    const updatedPreferences = {
      allergies: allergies ? allergies.split(",").map((a) => a.trim()) : [],
      dislikes: dislikes ? dislikes.split(",").map((d) => d.trim()) : [],
      diet,
      favorite_cuisines: favoriteCuisines,
      preferred_meal_types: preferredMealTypes,
      effort_level: effortLevel,
    };

    const { error } = await supabase.from("user_preferences").upsert({ user_id: userId, ...updatedPreferences });

    if (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences.");
    } else {
      Alert.alert("Success", "Preferences saved successfully!");
    }
  };

  // Toggle chip selection
  const toggleSelection = (item, setSelected, selectedList) => {
    if (selectedList.includes(item)) {
      setSelected(selectedList.filter((i) => i !== item));
    } else {
      setSelected([...selectedList, item]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Settings ⚙️</Text>

      {/* Allergies Input */}
      <TextInput
        label="Allergies (comma-separated)"
        value={allergies}
        onChangeText={setAllergies}
        mode="outlined"
        style={styles.input}
      />

      {/* Dislikes Input */}
      <TextInput
        label="Dislikes (comma-separated)"
        value={dislikes}
        onChangeText={setDislikes}
        mode="outlined"
        style={styles.input}
      />

      {/* Diet Dropdown */}
      <View style={{ zIndex: 3000, marginBottom: 15 }}>
        <DropDownPicker
          open={dietOpen}
          value={diet}
          items={dietOptions}
          setOpen={setDietOpen}
          setValue={setDiet}
          placeholder="Select Diet"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>

      {/* Effort Level Dropdown */}
      <View style={{ zIndex: 2000, marginBottom: 15 }}>
        <DropDownPicker
          open={effortOpen}
          value={effortLevel}
          items={effortOptions}
          setOpen={setEffortOpen}
          setValue={setEffortLevel}
          placeholder="Select Effort Level"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      </View>
      {/* Favorite Cuisines */}
      <Text style={styles.label}>Favorite Cuisines:</Text>
      <View style={styles.chipContainer}>
        {cuisineOptions.map((cuisine) => (
          <Chip
            key={cuisine}
            mode="outlined"
            selected={favoriteCuisines.includes(cuisine)}
            onPress={() => toggleSelection(cuisine, setFavoriteCuisines, favoriteCuisines)}
            style={[styles.chip, favoriteCuisines.includes(cuisine) && styles.chipSelected]}
          >
            {cuisine}
          </Chip>
        ))}
      </View>

      {/* Preferred Meal Types */}
      <Text style={styles.label}>Preferred Meal Types:</Text>
      <View style={styles.chipContainer}>
        {mealTypeOptions.map((meal) => (
          <Chip
            key={meal}
            mode="outlined"
            selected={preferredMealTypes.includes(meal)}
            onPress={() => toggleSelection(meal, setPreferredMealTypes, preferredMealTypes)}
            style={[styles.chip, preferredMealTypes.includes(meal) && styles.chipSelected]}
          >
            {meal}
          </Chip>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Save Preferences Button */}
      <Button mode="contained" onPress={handleSavePreferences} style={styles.saveButton}>
        Save Preferences
      </Button>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 10,
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
    marginTop: 80,
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  dropdown: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#6200ea",
    color: "white",
  },
  divider: {
    marginVertical: 15,
  },
  saveButton: {
    marginTop: 10,
  },
});
