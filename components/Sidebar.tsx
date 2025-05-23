// app/admin/components/Sidebar.tsx
import { View, TouchableOpacity, Image, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { adminRoutes, logoutRoute, RouteConfig } from "../src/config/admin/_navigationConfig";
import { RootStackParamList } from "@/types";
import { useAuth } from "@/context/AuthContext"; // ✅ Import useAuth

type NavigationProp = StackNavigationProp<RootStackParamList>;

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: keyof RootStackParamList;
};

export default function Sidebar({ isOpen, onClose, activeRoute }: SidebarProps) {
  const navigation = useNavigation<NavigationProp>();
    const { logout } = useAuth(); // ✅ Access logout function from context
  
    const handleLogout = async () => {
      try {
        await logout();
        onClose();
        navigation.reset({
          index: 0,
          routes: [{ name: "(auth)/index" }],
        }); // clears the nav stack
      } catch (error) {
        Alert.alert("Error", "Logout failed. Please try again.");
      }
    };


  const renderMenuItem = ({ name, label, icon }: RouteConfig) => {
    const isLogout = name === logoutRoute.name;

    return (
      <TouchableOpacity
        key={name}
        style={[styles.menuItem, activeRoute === name && !isLogout && styles.activeMenuItem]}
        onPress={isLogout ? handleLogout : () => {
          onClose();
          navigation.navigate(name);
        }}
      >
        <Ionicons name={icon} size={24} color="#fff" />
        <Text style={styles.menuText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {isOpen && <Pressable style={styles.overlay} onPress={onClose} />}
      {isOpen && (
        <View style={styles.sidebar}>
          <View style={styles.logo}>
            <Image
              source={require("../assets/snsu-logo.png")}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>OJTMS</Text>
          </View>
          {adminRoutes.map(renderMenuItem)}
          <View style={styles.spacer} />
          {renderMenuItem(logoutRoute)}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  sidebar: {
    width: 250,
    backgroundColor: "#1B5E20",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    padding: 20,
    zIndex: 2,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeMenuItem: {
    backgroundColor: "#FFC107",
  },
  menuText: {
    color: "white",
    marginLeft: 12,
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
});