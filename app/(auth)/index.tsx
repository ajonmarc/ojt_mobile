import { Text, View, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../context/AuthContext";

type RootStackParamList = {
  "(auth)/index": undefined;
  "admin/home": undefined; 
  "student/home": undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "(auth)/index">;

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = () => {
    if (login(email, password)) {
      if (email === "admin") {
        navigation.navigate("admin/home"); // Navigate to tabs
      } else if (email === "student") {
        navigation.navigate("student/home");
      }
    } else {
      Alert.alert("Error", "Invalid email or password");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.welcomeText}>Login</Text>
      <Text style={styles.subText}>Welcome back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Username / Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.freshmenLink}>
          Freshmen? <Text style={styles.clickHere}>Click here</Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Login with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC107",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  subText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "#FFF",
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 25,
  },
  forgotPassword: {
    color: "#000",
    textAlign: "right",
    width: "100%",
    marginVertical: 10,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  freshmenLink: {
    color: "#000",
    marginVertical: 10,
  },
  clickHere: {
    color: "#000",
    textDecorationLine: "underline",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#FFF",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#000",
    fontSize: 16,
  },
});