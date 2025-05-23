// app/admin/components/Navbar.tsx
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import  { navbarRoutes, RouteConfig } from "../src/config/student/_navigationConfig";


import { RootStackParamList } from "../types"; // Adjust path

type NavigationProp = StackNavigationProp<RootStackParamList>;

type NavbarProps = {
  activeRoute: keyof RootStackParamList;
};

export default function Navbar({ activeRoute }: NavbarProps) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.navbar}>
      {navbarRoutes.map(({ name, label, icon }) => (
        <TouchableOpacity
          key={name + label}
          style={styles.navItem}
          onPress={() => navigation.navigate(name)}
        >
          <Ionicons
            name={icon}
            size={24}
            color={activeRoute === name ? "#388E3C" : "#777"}
          />
          <Text
            style={[
              styles.navText,
              activeRoute === name && styles.activeNavText,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#777",
  },
  activeNavText: {
    color: "#388E3C",
    fontWeight: "500",
  },
});