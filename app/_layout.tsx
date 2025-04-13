import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar
        backgroundColor="#FFC107"
        barStyle="dark-content"
        translucent={false}
      />
      <Stack>
        {/* Auth Screens */}
        <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />

        {/* Admin Screens */}
        <Stack.Screen name="admin/home" options={{ headerShown: false }} />
        <Stack.Screen name="admin/students" options={{ headerShown: false }} />
        <Stack.Screen name="admin/programs" options={{ headerShown: false }} />
        <Stack.Screen name="admin/partners" options={{ headerShown: false }} />
        <Stack.Screen name="admin/applications" options={{ headerShown: false }} />
        <Stack.Screen name="admin/reports" options={{ headerShown: false }} />
        <Stack.Screen name="admin/profile" options={{ headerShown: false }} />

        {/* Student Screens */}
        <Stack.Screen name="student/home" options={{ headerShown: false }} />
        <Stack.Screen name="student/application" options={{ headerShown: false }} />
        <Stack.Screen name="student/progress" options={{ headerShown: false }} />
        <Stack.Screen name="student/profile" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}