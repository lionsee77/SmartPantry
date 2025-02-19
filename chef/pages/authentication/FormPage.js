import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import { Background, Header, Button, TextInput } from "../../components";
import MultiSelect from "react-native-multiple-select"; 
import {theme} from "../../components/theme"

export default function FormPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;

  useEffect(() => {
    if (!userId) {
      Alert.alert("Error", "User ID is missing. Redirecting to Login.");
      navigation.replace("LoginScreen");
    }
  }, [userId]);

  // User Input Fields
  const [allergies, setAllergies] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [diet, setDiet] = useState([]); 
  const [favoriteCuisines, setFavoriteCuisines] = useState([]);
  const [preferredMealTypes, setPreferredMealTypes] = useState([]);
  const [effortLevel, setEffortLevel] = useState([]);
  const [loading, setLoading] = useState(false);

  // Options for Multi-Select Dropdowns
  const dietOptions = [
    { id: "none", name: "None" },
    { id: "vegetarian", name: "Vegetarian" },
    { id: "vegan", name: "Vegan" },
    { id: "paleo", name: "Paleo" },
    { id: "keto", name: "Keto" },
  ];

  const cuisineOptions = [
    { id: "italian", name: "Italian" },
    { id: "japanese", name: "Japanese" },
    { id: "mexican", name: "Mexican" },
    { id: "chinese", name: "Chinese" },
    { id: "indian", name: "Indian" },
  ];

  const mealTypeOptions = [
    { id: "breakfast", name: "Breakfast" },
    { id: "lunch", name: "Lunch" },
    { id: "dinner", name: "Dinner" },
  ];

  const effortLevelOptions = [
    { id: "easy", name: "Easy" },
    { id: "moderate", name: "Moderate" },
    { id: "complex", name: "Complex" },
  ];

  // Handle form submission
  const onSubmit = async () => {
    if (!userId || !allergies || !dislikes || !diet.length || !favoriteCuisines.length || !preferredMealTypes.length || !effortLevel.length) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (preferredMealTypes.length > 3) {
      Alert.alert("Error", "You can only select up to 3 meal types.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("user_preferences").insert([
      {
        user_id: userId,
        allergies: allergies.toLowerCase().split(",").map((item) => item.trim()), 
        dislikes: dislikes.toLowerCase().split(",").map((item) => item.trim()), 
        diet: diet[0], 
        favorite_cuisines: favoriteCuisines, 
        preferred_meal_types: preferredMealTypes, 
        effort_level: effortLevel[0], 
      },
    ]);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Your preferences have been saved!");
      navigation.replace("HomeScreen");
    }
    setLoading(false);
  };

  return (
    <Background>
      {/* <Header>Tell Us More About You</Header> */}
      <Header style={styles.header}>Tell Us More About You</Header>


      {/* Use KeyboardAvoidingView instead of ScrollView */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.formContainer}>
          {/* Allergies Input */}
          <TextInput
            label="Allergies (comma-separated)"
            value={allergies}
            onChangeText={setAllergies}
            placeholder="e.g., peanuts, dairy"
          />

          {/* Dislikes Input */}
          <TextInput
            label="Food You Dislike (comma-separated)"
            value={dislikes}
            onChangeText={setDislikes}
            placeholder="e.g., mushrooms, olives"
          />

          {/* Diet Multi-Select (Single Selection) */}
          <Text style={styles.label}>Select Your Diet</Text>
          <MultiSelect
            items={dietOptions}
            uniqueKey="id"
            onSelectedItemsChange={(selectedItems) => setDiet([selectedItems[0]])} 
            selectedItems={diet}
            single={true} // Ensure only one selection is possible
            selectText="Choose diet"
            searchInputPlaceholderText="Search diet..."
            submitButtonText="Confirm"
          />

          {/* Favorite Cuisines Multi-Select */}
          <Text style={styles.label}>Favorite Cuisines</Text>
          <MultiSelect
            items={cuisineOptions}
            uniqueKey="id"
            onSelectedItemsChange={setFavoriteCuisines}
            selectedItems={favoriteCuisines}
            selectText="Choose cuisines"
            searchInputPlaceholderText="Search cuisines..."
            submitButtonText="Confirm"
          />

          {/* Preferred Meal Types Multi-Select */}
          <Text style={styles.label}>Preferred Meal Types</Text>
          <MultiSelect
            items={mealTypeOptions}
            uniqueKey="id"
            onSelectedItemsChange={setPreferredMealTypes}
            selectedItems={preferredMealTypes}
            selectText="Choose up to 3"
            searchInputPlaceholderText="Search meal types..."
            submitButtonText="Confirm"
          />

          {/* Effort Level Multi-Select (Single Selection) */}
          <Text style={styles.label}>Select Effort Level</Text>
          <MultiSelect
            items={effortLevelOptions}
            uniqueKey="id"
            onSelectedItemsChange={(selectedItems) => setEffortLevel([selectedItems[0]])} // ✅ Select only one item
            selectedItems={effortLevel}
            single={true} 
            selectText="Choose effort level"
            searchInputPlaceholderText="Search level..."
            submitButtonText="Confirm"
          />

          {/* Submit Button */}
          <Button mode="contained" onPress={onSubmit} style={{ marginTop: 24 }} disabled={loading}>
            {loading ? "Saving..." : "Next"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  header: {
    marginTop: 49,
    textAlign: "center",
    fontSize: 27,
    color: theme.colors.primary,
    fontWeight: "bold",
  }
});
