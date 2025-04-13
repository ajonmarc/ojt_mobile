// app/admin/home.tsx
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";


export default function AdminHome() {
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
        activeRoute="admin/home"
      />
      <Header
        onToggleSidebar={toggleSidebar}
        title={semester}
        onChangeSemester={handleChangeSemester}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Ionicons name="people" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>1</Text>
            <Text style={styles.statsLabel}>Total Students</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="document-text" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>13</Text>
            <Text style={styles.statsLabel}>OJT Programs</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="checkmark-circle" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>1</Text>
            <Text style={styles.statsLabel}>Active Students</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="hourglass" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>0</Text>
            <Text style={styles.statsLabel}>Pending Applications</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Students</Text>
          <View style={styles.studentList}>
            <View style={styles.studentItem}>
              <Text style={styles.studentName}>Julrose E. Iibaste</Text>
              <Text style={styles.studentProgram}>BSCS</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.expandableSection}
          onPress={() => setExpandStats(!expandStats)}
        >
          <Text style={styles.sectionTitle}>Program Statistics</Text>
          <Ionicons
            name={expandStats ? "chevron-up" : "chevron-down"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
        {expandStats && (
          <View style={styles.statsExpanded}>
            <Text>Program statistics details will appear here</Text>
          </View>
        )}
      </ScrollView>
      <Navbar activeRoute="admin/home" />
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  statsLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
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
  studentList: {
    marginTop: 8,
  },
  studentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  studentName: {
    fontSize: 14,
    flex: 2,
  },
  studentProgram: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  expandableSection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsExpanded: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginTop: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});