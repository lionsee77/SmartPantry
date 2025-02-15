// import React, { useState, useEffect } from "react";
// import { View, StyleSheet, Alert, ScrollView } from "react-native";
// import { Text } from "react-native-paper";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { supabase } from "../../services/supabase";
// import { Background, Header, Button, TextInput } from "../../components";
// import { Picker } from "@react-native-picker/picker"; // ✅ Import for dropdowns
// import MultiSelect from "react-native-multiple-select"; // ✅ Import for multi-select

// export default function FormPage() {
//   const navigation = useNavigation();
//   const route = useRoute();
  
//   // ✅ Handle missing params safely
//   const userId = route.params?.userId;

//   useEffect(() => {
//     if (!userId) {
//       Alert.alert("Error", "User ID is missing. Redirecting to Login.");
//       navigation.replace("LoginScreen"); // ✅ Redirect if userId is missing
//     }
//   }, [userId]);

//   // User Input Fields
//   const [allergies, setAllergies] = useState("");
//   const [dislikes, setDislikes] = useState("");
//   const [diet, setDiet] = useState("none"); // ✅ Default diet value
//   const [favoriteCuisines, setFavoriteCuisines] = useState("");
//   const [preferredMealTypes, setPreferredMealTypes] = useState([]); // ✅ Multi-select
//   const [effortLevel, setEffortLevel] = useState("moderate"); // ✅ Default effort level
//   const [loading, setLoading] = useState(false);

//   // Options for Dropdowns & Multi-Select
//   const dietOptions = ["none", "vegetarian", "vegan", "paleo", "keto"];
//   const mealTypeOptions = [
//     { id: "breakfast", name: "Breakfast" },
//     { id: "lunch", name: "Lunch" },
//     { id: "dinner", name: "Dinner" }
//   ];
//   const effortLevelOptions = ["easy", "moderate", "complex"];

//   // Handle form submission
//   const onSubmit = async () => {
//     if (!userId || !allergies || !dislikes || !diet || !favoriteCuisines || preferredMealTypes.length === 0 || !effortLevel) {
//       Alert.alert("Error", "Please fill out all fields.");
//       return;
//     }
  
//     if (preferredMealTypes.length > 3) {
//       Alert.alert("Error", "You can only select up to 3 meal types.");
//       return;
//     }
  
//     setLoading(true);
  
//     const { error } = await supabase.from("user_preferences").insert([
//       {
//         user_id: userId,
//         allergies: `{${allergies.split(",").map(item => item.trim()).join(",")}}`, 
//         dislikes: `{${dislikes.split(",").map(item => item.trim()).join(",")}}`,  
//         diet,
//         favorite_cuisines: `{${favoriteCuisines.split(",").map(item => item.trim()).join(",")}}`,
//         preferred_meal_types: `{${preferredMealTypes.join(",")}}`, 
//         effort_level: effortLevel,
//       },
//     ]);
  
//     if (error) {
//       Alert.alert("Update Failed", error.message);
//     } else {
//       Alert.alert("Success", "Your preferences have been saved!");
  
//       // ✅ Ensure this runs after update success
//       navigation.replace("HomeScreen");
//     }
  
//     setLoading(false);
//   };
  

//   return (
//     <Background>
//       <Header>Tell Us More About You</Header>

//       <ScrollView contentContainerStyle={styles.formContainer}>
//         {/* Allergies Input */}
//         <TextInput 
//           label="Allergies (comma-separated)" 
//           value={allergies} 
//           onChangeText={setAllergies} 
//           placeholder="e.g., Peanuts, Dairy" 
//         />

//         {/* Dislikes Input */}
//         <TextInput 
//           label="Food You Dislike (comma-separated)" 
//           value={dislikes} 
//           onChangeText={setDislikes} 
//           placeholder="e.g., Mushrooms, Olives" 
//         />

//         {/* Diet Dropdown */}
//         <Text style={styles.label}>Select Your Diet</Text>
//         <Picker
//           selectedValue={diet}
//           onValueChange={(itemValue) => setDiet(itemValue)}
//           style={styles.picker}
//         >
//           {dietOptions.map((option) => (
//             <Picker.Item key={option} label={option} value={option} />
//           ))}
//         </Picker>

//         {/* Favorite Cuisines Input */}
//         <TextInput 
//           label="Favorite Cuisines (comma-separated)" 
//           value={favoriteCuisines} 
//           onChangeText={setFavoriteCuisines} 
//           placeholder="e.g., Italian, Japanese" 
//         />

//         {/* Preferred Meal Types Multi-Select */}
//         <Text style={styles.label}>Select Preferred Meal Types</Text>
//         <MultiSelect
//           items={mealTypeOptions}
//           uniqueKey="id"
//           onSelectedItemsChange={setPreferredMealTypes}
//           selectedItems={preferredMealTypes}
//           selectText="Choose up to 3"
//           searchInputPlaceholderText="Search meal types..."
//           tagRemoveIconColor="#CCC"
//           tagBorderColor="#CCC"
//           tagTextColor="#333"
//           selectedItemTextColor="#333"
//           selectedItemIconColor="#6200ea"
//           itemTextColor="#000"
//           displayKey="name"
//           submitButtonText="Confirm"
//           styleDropdownMenuSubsection={styles.multiSelect}
//         />

//         {/* Effort Level Dropdown */}
//         <Text style={styles.label}>Select Effort Level</Text>
//         <Picker
//           selectedValue={effortLevel}
//           onValueChange={(itemValue) => setEffortLevel(itemValue)}
//           style={styles.picker}
//         >
//           {effortLevelOptions.map((option) => (
//             <Picker.Item key={option} label={option} value={option} />
//           ))}
//         </Picker>

//         {/* Submit Button */}
//         <Button mode="contained" onPress={onSubmit} style={{ marginTop: 24 }} disabled={loading}>
//           {loading ? "Saving..." : "Next"}
//         </Button>
//       </ScrollView>
//     </Background>
//   );
// }

// const styles = StyleSheet.create({
//   formContainer: {
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginVertical: 10,
//   },
//   picker: {
//     backgroundColor: "#f0f0f0",
//     marginBottom: 20,
//   },
//   multiSelect: {
//     padding: 10,
//   },
// });

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import { Background, Header, Button, TextInput } from "../../components";
import MultiSelect from "react-native-multiple-select"; // ✅ Multi-option selection

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
  const [diet, setDiet] = useState([]); // ✅ Changed from string to array
  const [favoriteCuisines, setFavoriteCuisines] = useState([]);
  const [preferredMealTypes, setPreferredMealTypes] = useState([]);
  const [effortLevel, setEffortLevel] = useState([]); // ✅ Changed from string to array
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
        allergies: allergies.toLowerCase().split(",").map((item) => item.trim()), // Convert to lowercase array
        dislikes: dislikes.toLowerCase().split(",").map((item) => item.trim()), // Convert to lowercase array
        diet: diet[0], // ✅ Only one diet can be selected, so we take the first element
        favorite_cuisines: favoriteCuisines, // Already an array
        preferred_meal_types: preferredMealTypes, // Already an array
        effort_level: effortLevel[0], // ✅ Only one effort level can be selected, so we take the first element
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
      <Header>Tell Us More About You</Header>

      {/* ✅ FIX: Use KeyboardAvoidingView instead of ScrollView */}
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
            onSelectedItemsChange={(selectedItems) => setDiet([selectedItems[0]])} // ✅ Select only one item
            selectedItems={diet}
            single={true} // ✅ Ensure only one selection is possible
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
            single={true} // ✅ Ensure only one selection is possible
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
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
});
