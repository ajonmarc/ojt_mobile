// app/student/navigationConfig.ts
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types"; // Adjust path

export type RouteConfig = {
    name: keyof RootStackParamList;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export const studentRoutes: RouteConfig[] = [
    { name: "student/home", label: "Dashboard", icon: "home" },
    { name: "student/application", label: "Application", icon: "document-text" },
  

];

export const logoutRoute: RouteConfig = {
    name: "(auth)/index",
    label: "Logout",
    icon: "log-out",
};

export const navbarRoutes: RouteConfig[] = [
    { name: "student/home", label: "Home", icon: "home" },
    { name: "student/progress", label: "Progress", icon: "checkmark-circle" },
    { name: "student/profile", label: "Profile", icon: "person" },
];