import React from "react";
import { Background, Logo, Header, Button, Paragraph, TextInput, BackButton, theme } from "../../components";

export default function StartScreen({ navigation }) {
  return (
    <Background>
      <Logo />
      <Header>Welcome to LLama!</Header>
      <Paragraph>
        My name is Alexis. Lets start cooking!
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("LoginScreen")}
      >
        Log in
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate("RegisterScreen")}
      >
        Create an account
      </Button>
    </Background>
  );
}