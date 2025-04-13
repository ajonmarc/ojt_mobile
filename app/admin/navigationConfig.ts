// app/admin/navigationConfig.ts
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types"; // Adjust path

export type RouteConfig = {
    name: keyof RootStackParamList;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export const adminRoutes: RouteConfig[] = [
    { name: "admin/home", label: "Dashboard", icon: "home" },
    { name: "admin/students", label: "Students", icon: "people" },
    { name: "admin/programs", label: "OJT Programs", icon: "document-text" },
    { name: "admin/partners", label: "Partners", icon: "business" },
    { name: "admin/applications", label: "OJT Applications", icon: "documents" },
    { name: "admin/reports", label: "Reports", icon: "stats-chart" },
];

export const logoutRoute: RouteConfig = {
    name: "(auth)/index",
    label: "Logout",
    icon: "log-out",
};

export const navbarRoutes: RouteConfig[] = [
    { name: "admin/home", label: "Home", icon: "home" },
    { name: "admin/reports", label: "Reports", icon: "stats-chart" },
    { name: "admin/profile", label: "Profile", icon: "person" },
];