import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Animated, Modal, Button 
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

  // Fetch authenticated user ID
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
    const fetchMealPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('user_meal_history') // Replace with actual table name
          .select('meal_plan')
          .eq('user_id', userId) // Replace with actual user_id
          .single(); // Ensure we fetch a single row instead of an array
  
        if (error) throw error;
  
        if (data && data.meal_plan) {
          let mealData = data.meal_plan;

          // Ensure mealData is properly parsed
          if (typeof mealData === "string") {
            try {
              mealData = JSON.parse(mealData);
            } catch (parseError) {
              console.error("Error parsing meal plan JSON:", parseError);
              return;
            }
          }
  
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
  }, [supabase]); // Include supabase in dependencies to avoid stale closures
  

  const descriptionOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0], 
    extrapolate: "clamp",
  });

  const descriptionHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [40, 0], 
    extrapolate: "clamp",
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, 150], 
    outputRange: [1, 0], 
    extrapolate: "clamp",
  });

  const backButtonTranslateY = scrollY.interpolate({
    inputRange: [0, 150, 200], 
    outputRange: [0, -50, -50], 
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150], 
    outputRange: [0, -40], 
    extrapolate: "clamp",
  });

  const handleMealPress = (meal) => {
    setSelectedMeal(meal);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMeal(null);
  };

  return (
    <View style={styles.container}>
      {/* Animated Back Button */}
      <Animated.View style={[styles.backButton, { opacity: backButtonOpacity, transform: [{ translateY: backButtonTranslateY }] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerTranslateY }] }]}>
        <Text style={styles.title}>Meal Prep Page 🍽️</Text>
        <Animated.View style={[styles.descriptionContainer, { height: descriptionHeight, opacity: descriptionOpacity }]}>
          <Text style={styles.description}>Plan and manage your meal preparation here.</Text>
        </Animated.View>
      </Animated.View>2

      {/* Scrollable Meal Plan */}
      <Animated.ScrollView
        contentContainerStyle={styles.mealPlanContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {mealPlan.map((dayData) => (
          <View key={dayData.day} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>Day {dayData.day}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(dayData.meals).map(([mealType, meal]) => (
                <TouchableOpacity 
                  key={mealType} 
                  style={styles.mealBox} 
                  onPress={() => handleMealPress(meal)}
                >
                  <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
                  <View style={styles.mealTextContainer}>
                    <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                    <Text style={styles.mealTitle}>{meal.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Modal Popup for Meal Recipe */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedMeal && (
              <>
                <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                <Image source={{ uri: selectedMeal.image_url }} style={styles.modalImage} />
                <Text style={styles.modalSubtitle}>Ingredients:</Text>
                <Text style={styles.modalText}>{selectedMeal.ingredients.join(", ")}</Text>
                <Text style={styles.modalSubtitle}>Instructions:</Text>
                <ScrollView style={styles.modalTextContainer}>
                  <Text style={styles.modalText}>{selectedMeal.instructions}</Text>
                </ScrollView>
                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
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
  descriptionContainer: {
    overflow: "hidden",
    justifyContent: "center",
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
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 200,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  mealTextContainer: {
    flexDirection: "column",
  },
  mealType: {
    fontSize: 14,
    fontWeight: "bold",
  },
  mealTitle: {
    fontSize: 12,
    color: "#333",
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
    width: 300,
    maxHeight: "80%", // Prevents modal from becoming too tall
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalTextContainer: {
    maxHeight: 200, // Allow scrolling if the content is long
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
});
