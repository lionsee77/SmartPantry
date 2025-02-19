import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import { Background, Logo, Header, Button, TextInput, BackButton, theme } from "../../components";

export default function RegisterPage() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Sign-Up with Supabase
  const onSignUpPressed = async () => {
    setLoading(true);
  
    // Create User in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
  
    if (error || !data?.user) {
      Alert.alert("Registration Failed", error?.message || "User creation failed.");
      setLoading(false);
      return;
    }
  
    const userId = data.user.id; 
  
    // Insert into `users` Table
    const { error: userTableError } = await supabase.from("users").insert([
      {
        user_id: userId, 
        email: email,
        username: name,
      },
    ]);
  
    if (userTableError) {
      Alert.alert("Error Saving User Data", userTableError.message);
      setLoading(false);
      return;
    }
  
    Alert.alert("Success", "Account created! Enter additional details.");
    navigation.navigate("FormPage", { userId });
  
    setLoading(false);
  };

  return (
    <Background>
      <View style={{ position: "absolute", top: 20, left: 10, zIndex: 100 }}>
        <BackButton />
      </View>
      <Logo />
      <Header>Nice To Meet You!</Header>

      {/* Name Input */}
      <TextInput label="Name" value={name} onChangeText={setName} />

      {/* Email Input */}
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

      {/* Password Input */}
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {/* Sign Up Button */}
      <Button mode="contained" onPress={onSignUpPressed} style={{ marginTop: 24 }} disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"}
      </Button>

      {/* Navigation to Login */}
      <View style={styles.row}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}> Log in</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
    justifyContent: "center",
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
