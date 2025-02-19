import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Animated, Modal, Button, Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supabase";

export default function MealPrepPage() {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [mealPlan, setMealPlan] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Authentication Error", "Unable to retrieve user details.");
      } else {
        console.log("User ID:", data?.user?.id);
        setUserId(data?.user?.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) {
      console.warn("User ID is null, skipping meal plan fetch.");
      return;
    }

    const fetchMealPlan = async () => {
      try {
        console.log("Fetching meal plan for user:", userId);
        const { data, error } = await supabase
          .from("user_meal_history")
          .select("meal_plan")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching meal plan:", error);
          return;
        }

        if (data && data.meal_plan) {
          let mealData = data.meal_plan;

          if (typeof mealData === "string") {
            try {
              mealData = JSON.parse(mealData);
            } catch (parseError) {
              console.error("Error parsing meal plan JSON:", parseError);
              return;
            }
          }

          console.log("Parsed Meal Plan:", mealData);

          if (mealData && mealData.days) {
            setMealPlan(mealData.days);
          } else {
            console.error("Unexpected structure in parsedMealData:", mealData);
          }
        }
      } catch (fetchError) {
        console.error("Error fetching meal plan:", fetchError);
      }
    };

    fetchMealPlan();
  }, [userId]); // ✅ Runs only when `userId` is available

  // ✅ Handle Meal Click
  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
    setIsModalVisible(true);
  };

  // ✅ Close Modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMeal(null);
  };

  // ✅ Store Cooked Meal in Supabase
  const handleCookMeal = async () => {
    if (!selectedMeal || !userId) {
      Alert.alert("Error", "No meal selected or user ID missing.");
      return;
    }

    try {
      const { error } = await supabase
        .from("cooked_meals")
        .insert([
          {
            user_id: userId,
            meal_name: selectedMeal.name,
            ingredients: JSON.stringify(selectedMeal.ingredients),
          },
        ]);

      if (error) {
        console.error("Error logging cooked meal:", error);
        Alert.alert("Error", "Failed to save meal.");
      } else {
        Alert.alert("Success", "Meal logged successfully!");
        closeModal();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Back Button */}
      <Animated.View style={[styles.backButton, { opacity: 1 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Meal Prep Page 🍽️</Text>
        <Text style={styles.description}>Plan and manage your meal preparation here.</Text>
      </View>

      {/* Meal Plan Content */}
      <ScrollView contentContainerStyle={styles.mealPlanContainer} showsVerticalScrollIndicator={false}>
        {mealPlan.length === 0 ? (
          <Text style={styles.noMealText}>No meal plan found.</Text>
        ) : (
          mealPlan.map((dayData) => (
            <View key={dayData.day} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>Day {dayData.day}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.entries(dayData.meals).map(([mealType, meal]) => (
                  <TouchableOpacity key={mealType} style={styles.mealBox} onPress={() => handleMealPress(meal)}>
                    <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
                    <View style={styles.mealTextContainer}>
                      <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                      <Text style={styles.mealTitle}>{meal.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Popup for Meal Details */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedMeal && (
              <>
                <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                <Image source={{ uri: selectedMeal.image_url }} style={styles.modalImage} />
                
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalSubtitle}>Ingredients:</Text>
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
                  ))}

                  <Text style={styles.modalSubtitle}>Instructions:</Text>
                  <Text style={styles.modalText}>{selectedMeal.instructions}</Text>
                </ScrollView>

                {/* Cook This Meal Button */}
                <TouchableOpacity onPress={handleCookMeal} style={styles.cookButton}>
                  <Text style={styles.cookButtonText}>Cook This Meal 🍳</Text>
                </TouchableOpacity>

                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ✅ Styles
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
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  mealPlanContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  dayContainer: {
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
    padding: 15,
    borderRadius: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealBox: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 20,
    marginRight: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 200,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%", // Larger modal width
    alignSelf: "center",
    maxHeight: "80%",
  },
  modalImage: {
    width: "100%",
    height: 150, // Bigger image
    borderRadius: 10,
    marginBottom: 15,
  },
  // modalScroll: {
  //   maxHeight: 250, // More space for content
  //   marginBottom: 10,
  // },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  ingredientText: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
  },
  cookButton: {
    backgroundColor: "#6200ea",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cookButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
