import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supabase";
import { Background, Logo, Header, Button, TextInput, BackButton, theme } from "../../components";

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Password Reset with Supabase
  const onResetPressed = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert("Password Reset Failed", error.message);
    } else {
      Alert.alert(
        "Check Your Email",
        "We've sent you a password reset link. Please check your inbox."
      );
      navigation.replace("LoginScreen"); // Redirect back to login
    }
    setLoading(false);
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Reset Password</Header>

      {/* Email Input */}
      <TextInput
        label="Email"
        returnKeyType="done"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Reset Password Button */}
      <Button
        mode="contained"
        onPress={onResetPressed}
        style={{ marginTop: 24 }}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>

      {/* Back to Login */}
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
