import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Animated, Modal, Button 
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function MealPrepPage() {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [mealPlan, setMealPlan] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    // Placeholder data for meal plan
    const fetchMealPlan = {
      "user_id": "fdde9b7f-1442-4c08-af35-e8cbdc60de53",
      "days": [
        {
          "day": 1,
          "meals": {
            "breakfast": {
              "name": "Bread omelette",
              "ingredients": ["Bread", "Egg", "Salt"],
              "instructions": "Make and enjoy",
              "image_url": "https://www.themealdb.com/images/media/meals/hqaejl1695738653.jpg"
            },
            "lunch": {
              "name": "Ribollita",
              "ingredients": [
                "Olive Oil", "Onion", "Carrots", "Celery", "Garlic",
                "Cannellini Beans", "Canned tomatoes", "Water", "Rosemary",
                "Thyme", "Kale", "Wholegrain Bread", "Red Onions", "Parmesan"
              ],
              "instructions": "Put 2 tablespoons of the oil in a large pot over medium heat...",
              "image_url": "https://www.themealdb.com/images/media/meals/xrrwpx1487347049.jpg"
            },
            "dinner": {
              "name": "French Omelette",
              "ingredients": [
                "Eggs", "Butter", "Parmesan", "Tarragon Leaves",
                "Parsley", "Chives", "Gruyère"
              ],
              "instructions": "Get everything ready. Warm a 20cm (measured across the top) non-stick frying pan on a medium heat...",
              "image_url": "https://www.themealdb.com/images/media/meals/yvpuuy1511797244.jpg"
            }
          }
        },
        {
          "day": 2,
          "meals": {
            "breakfast": {
              "name": "Chicken Quinoa Greek Salad",
              "ingredients": [
                "Quinoa", "Butter", "Red Chilli", "Garlic", "Chicken Breast",
                "Olive Oil", "Black Olives", "Red Onions", "Feta", "Mint", "Lemon"
              ],
              "instructions": "Cook the quinoa following the pack instructions, then rinse in cold water and drain thoroughly...",
              "image_url": "https://www.themealdb.com/images/media/meals/k29viq1585565980.jpg"
            },
            "lunch": {
              "name": "Tuna and Egg Briks",
              "ingredients": [
                "Olive Oil", "Spring Onions", "Spinach", "Filo Pastry",
                "Tuna", "Eggs", "Hotsauce", "Tomatoes", "Cucumber",
                "Lemon Juice", "Apricot Jam"
              ],
              "instructions": "Heat 2 tsp of the oil in a large saucepan and cook the spring onions over a low heat for 3 minutes or until beginning to soften. Add the spinach, cover with a tight-fitting lid and cook for a further 2–3 minutes or until tender and wilted, stirring once or twice. Tip the mixture into a sieve or colander and leave to drain and cool.Using a saucer as a guide, cut out 24 rounds about 12.5 cm (5 in) in diameter from the filo pastry, cutting 6 rounds from each sheet. Stack the filo rounds in a pile, then cover with cling film to prevent them from drying out. When the spinach mixture is cool, squeeze out as much excess liquid as possible, then transfer to a bowl. Add the tuna, eggs, hot pepper sauce, and salt and pepper to taste. Mix well. Preheat the oven to 200°C (400°F, gas mark 6). Take one filo round and very lightly brush with some of the remaining oil. Top with a second round and brush with a little oil, then place a third round on top and brush with oil. Place a heaped tbsp of the filling in the middle of the round, then fold the pastry over to make a half-moon shape. Fold in the edges, twisting them to seal, and place on a non-stick baking sheet. Repeat with the remaining pastry and filling to make 8 briks in all. Lightly brush the briks with the remaining oil. Bake for 12–15 minutes or until the pastry is crisp and golden brown.Meanwhile, combine the tomatoes and cucumber in a bowl and sprinkle with the lemon juice and seasoning to taste. Serve the briks hot with this salad and the chutney.",
              "image_url": "https://www.themealdb.com/images/media/meals/2dsltq1560461468.jpg"
            },
            "dinner": {
              "name": "French Onion Chicken with Roasted Carrots & Mashed Potatoes",
              "ingredients": [
                "Chicken Breasts", "Carrots", "Small Potatoes", "Onion",
                "Beef Stock", "Mozzarella", "Sour Cream", "Butter",
                "Sugar", "Vegetable Oil", "Salt", "Pepper"
              ],
              "instructions": "Preheat oven to 425 degrees. Wash and dry all produce...",
              "image_url": "https://www.themealdb.com/images/media/meals/b5ft861583188991.jpg"
            }
          }
        }
      ]
    };
    setMealPlan(fetchMealPlan.days);
  }, []);

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
      </Animated.View>

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
