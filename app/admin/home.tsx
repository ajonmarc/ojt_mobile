// app/admin/home.tsx
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Link } from "expo-router";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import api from "../../axios"; // Import the API module

// Define TypeScript interfaces for the data
interface Stats {
  totalStudents: number;
  totalPrograms: number;
  activeStudents: number;
  pendingApplications: number;
}

interface RecentStudent {
  id: number;
  name: string;
  program: string;
  status: string;
}

interface ProgramStat {
  id: number;
  programName: string;
  totalStudents: number;
  activeStudents: number;
}

export default function AdminHome() {
  const [expandStats, setExpandStats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalPrograms: 0,
    activeStudents: 0,
    pendingApplications: 0,
  });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [programStats, setProgramStats] = useState<ProgramStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/home");
        const { stats, recentStudents, programStats } = response.data;
        setStats(stats);
        setRecentStudents(recentStudents);
        setProgramStats(programStats);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangeSemester = (newSemester: string) => {
    setSemester(newSemester);
    // Optional: Refetch data with semester parameter if your backend supports it
  };

  const calculateProgramProgress = (program: ProgramStat) => {
    if (program.totalStudents === 0) return 0;
    return (program.activeStudents / program.totalStudents) * 100;
  };

  const getProgressColorClass = (progress: number) => {
    if (progress < 30) return "redProgress";
    if (progress < 70) return "yellowProgress";
    return "greenProgress";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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
            <Text style={styles.statsNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statsLabel}>Total Students</Text>
            <Link href="/admin/students" asChild>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="document-text" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>{stats.totalPrograms}</Text>
            <Text style={styles.statsLabel}>OJT Programs</Text>
            <Link href="/admin/programs" asChild>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="checkmark-circle" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>{stats.activeStudents}</Text>
            <Text style={styles.statsLabel}>Active Students</Text>
            <Link href="/admin/students" asChild>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="hourglass" size={32} color="#388E3C" />
            <Text style={styles.statsNumber}>{stats.pendingApplications}</Text>
            <Text style={styles.statsLabel}>Pending Applications</Text>
            <Link href="/admin/applications" asChild>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.dashboardGrid}>
          {/* Recent Students Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Students</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Program</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
              </View>
              {recentStudents.map((student) => (
                <View key={student.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{student.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{student.program}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: student.status === "Active" ? "#4CAF50" : "#FFA000" },
                    ]}
                  >
                    <Text style={styles.statusText}>{student.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Program Statistics Dropdown */}
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
              {programStats.map((program) => (
                <View key={program.id} style={styles.programStatCard}>
                  <View style={styles.programInfo}>
                    <Text style={styles.programName}>{program.programName}</Text>
                    <View style={styles.programNumbers}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Students:</Text>
                        <Text style={styles.statValue}>{program.totalStudents}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Active:</Text>
                        <Text style={styles.statValue}>{program.activeStudents}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${calculateProgramProgress(program)}%`,
                          backgroundColor:
                            calculateProgramProgress(program) < 30
                              ? "#F44336"
                              : calculateProgramProgress(program) < 70
                              ? "#FFA000"
                              : "#4CAF50",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
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
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: "#388E3C",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  viewButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  dashboardGrid: {
    flexDirection: "column",
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
  tableContainer: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    fontSize: 14,
    color: "#333",
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1,
    alignItems: "center",
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
  programStatCard: {
    marginBottom: 16,
  },
  programInfo: {
    marginBottom: 8,
  },
  programName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  programNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
  },
  redProgress: {
    backgroundColor: "#F44336",
  },
  yellowProgress: {
    backgroundColor: "#FFA000",
  },
  greenProgress: {
    backgroundColor: "#4CAF50",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
  },
});