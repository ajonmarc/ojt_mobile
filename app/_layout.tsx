import { Stack, Slot } from "expo-router";
import { StatusBar } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth data to load
    console.log("Auth state:", { user, isLoading }); // Debug log
    if (user) {
      // Redirect to home based on role
      if (user.role === "admin") {
        router.replace("/admin/home");
      } else if (user.role === "student") {
        router.replace("/student/home");
      }
    } else {
      // Show login screen
      router.replace("/"); 
    }
  }, [user, isLoading]);

  return (
    <>
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
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}