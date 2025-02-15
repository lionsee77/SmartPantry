import React from "react";
import { Provider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { theme } from "./components/theme";

// Import Auth Screens
import { StartScreen, LoginScreen, RegisterScreen, ResetPasswordScreen, FormScreen} from "./pages/authentication";

// Import Functional Screens
import HomeScreen from "./pages/HomePage";
import ReceiptPage from "./pages/ReceiptPage"; // ✅ Added
import MealPrepPage from "./pages/MealPrepPage"; // ✅ Added
import InventoryPage from "./pages/InventoryPage"; // ✅ Added
import SettingsPage from "./pages/SettingsPage"; // ✅ Added



const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ReceiptPage" component={ReceiptPage} /> 
          <Stack.Screen name="MealPrepPage" component={MealPrepPage} /> 
          <Stack.Screen name="InventoryPage" component={InventoryPage} /> 
          <Stack.Screen name="SettingsPage" component={SettingsPage} /> 
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
          <Stack.Screen name="FormPage" component={FormScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
