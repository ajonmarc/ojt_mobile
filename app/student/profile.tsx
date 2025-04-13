// app/admin/students.tsx
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";

export default function StudentProfile() {
    const [expandStats, setExpandStats] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [semester, setSemester] = useState("1st Semester, A.Y. 2023");

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleChangeSemester = (newSemester: string) => {
        setSemester(newSemester);
        // Optional: Add logic to update data based on new semester
    };

    return (
        <View style={styles.container}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeRoute="student/profile"
            />
            <Header
                onToggleSidebar={toggleSidebar}
                title={semester}
                onChangeSemester={handleChangeSemester}
            />
            <ScrollView style={styles.content}>
                <Text style={styles.headerTitle}>Profile</Text>
              
            </ScrollView>
            <Navbar activeRoute="student/profile" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8F5E9",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    section: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
});