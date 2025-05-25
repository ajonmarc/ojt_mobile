import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";
import api from "../../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types
interface PartnerInfo {
  partnerName: string;
  partnerAddress: string;
  partnerPhone: string;
  partnerEmail: string;
}

interface Evaluation {
  id: string;
  date: string;
  supervisor: string;
  score: number; // Changed to score to match frontend usage
  feedback: string;
}

interface Application {
  status: "Pending" | "Approved" | "Rejected" | null;
  remarks?: string;
  partner?: PartnerInfo;
  start_date?: string;
  end_date?: string;
  required_hours?: number;
  completed_hours?: number;
}

interface Student {
  name: string;
  studentId: string;
  ojtProgram: string;
}

interface DashboardData {
  student: Student;
  application: Application;
  partner: PartnerInfo | null;
  evaluations: Evaluation[];
}

// Toast component for notifications
const Toast = ({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) => {
  if (!visible) return null;
  return (
    <View style={[styles.toastContainer, { backgroundColor: message.includes("error") ? "#F44336" : "#4CAF50" }]}>
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default function StudentHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [toast, setToast] = useState({ message: "", visible: false });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  // Add this before the useEffect (around line 70, after state declarations)
const fetchDashboardData = async (isRefresh = false) => {
  try {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      setToast({ message: "Authentication error. Please log in.", visible: true });
      navigation.navigate("Login");
      return;
    }

    const response = await api.post("/dashboard", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDashboardData(response.data);
    setToast({ message: "Dashboard data loaded successfully", visible: true });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    const errorMessage = error.response?.data?.error || "Failed to load dashboard data";
    setToast({ message: errorMessage, visible: true });
    if (error.response?.status === 401) {
      navigation.navigate("Login");
    }
  } finally {
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  }
};

// Update the useEffect (around line 80) to call the function
useEffect(() => {
  fetchDashboardData();
}, []);

  // Fetch dashboard data
  useEffect(() => {
 const fetchDashboardData = async (isRefresh = false) => {
  try {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      setToast({ message: "Authentication error. Please log in.", visible: true });
      navigation.navigate("Login");
      return;
    }

    const response = await api.post("/dashboard", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDashboardData(response.data);
    setToast({ message: "Dashboard data loaded successfully", visible: true });
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    const errorMessage = error.response?.data?.error || "Failed to load dashboard data";
    setToast({ message: errorMessage, visible: true });
    if (error.response?.status === 401) {
      navigation.navigate("Login");
    }
  } finally {
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  }
};

    fetchDashboardData();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ message: "", visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangeSemester = (newSemester: string) => {
    setSemester(newSemester);
  };

  const navigateTo = (route: string) => {
    navigation.navigate(route);
    setToast({ message: `Navigating to ${route.replace("student/", "")}...`, visible: true });
  };

  const calculateProgress = () => {
    if (!dashboardData?.application?.required_hours || !dashboardData?.application?.completed_hours) return 0;
    return Math.round((dashboardData.application.completed_hours / dashboardData.application.required_hours) * 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Invalid date format:", error);
      return "Invalid date";
    }
  };

  const getStatusClass = (status: Application["status"]) => {
    switch (status) {
      case "Pending":
        return styles.pendingBadge;
      case "Approved":
        return styles.approvedBadge;
      case "Rejected":
        return styles.rejectedBadge;
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.container}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  const { student, application, partner, evaluations } = dashboardData;

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="student/home" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView
  style={styles.content}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => fetchDashboardData(true)}
      colors={["#4CAF50"]} // Matches your app's theme
      tintColor="#4CAF50"
    />
  }
>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, {student.name}!</Text>
          <Text style={styles.studentId}>Student ID: {student.studentId}</Text>
           <Text style={styles.studentId}>Program: {student.ojtProgram}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigateTo("student/application")}>
              <Ionicons name="document-text" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>OJT Application</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigateTo("student/progress")}>
              <Ionicons name="stats-chart" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>View Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigateTo("student/profile")}>
              <Ionicons name="person" size={24} color="#4CAF50" />
              <Text style={styles.actionText}>My Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OJT Status Overview */}
        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>OJT Status Overview</Text>
          {application?.status ? (
            <View style={styles.statusContent}>
              {/* Status Header */}
              <View style={styles.statusHeader}>
                <Text style={[styles.statusBadge, getStatusClass(application.status)]}>
                  {application.status}
                </Text>
                {application.status === "Rejected" && (
                  <TouchableOpacity style={styles.reapplyButton} onPress={() => navigateTo("student/application")}>
                    <Text style={styles.reapplyButtonText}>Reapply</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Approved Details */}
              {application.status === "Approved" && (
                <View>
                  {/* Company Information */}
                  {partner && (
                    <View style={styles.partnerInfo}>
                      <Text style={styles.subSectionTitle}>Company Information</Text>
                      <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                          <Text style={styles.label}>Company Name:</Text>
                          <Text style={styles.value}>{partner.partnerName}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.label}>Address:</Text>
                          <Text style={styles.value}>{partner.partnerAddress}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.label}>Contact:</Text>
                          <Text style={styles.value}>{partner.partnerPhone}</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.label}>Email:</Text>
                          <Text style={styles.value}>{partner.partnerEmail}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* OJT Progress */}
                  <View style={styles.ojtProgress}>
                    <Text style={styles.subSectionTitle}>OJT Progress</Text>
                    <View style={styles.progressOverview}>
                      <View style={styles.timeDetails}>
                        <View style={styles.detailItem}>
                          <Text style={styles.label}>Start Date:</Text>
                          <Text style={styles.value}>{formatDate(application.start_date)}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.label}>End Date:</Text>
                          <Text style={styles.value}>{formatDate(application.end_date)}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.label}>Required Hours:</Text>
                          <Text style={styles.value}>{application.required_hours} hours</Text>
                        </View>
                      </View>
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Completion Progress</Text>
                          <Text style={styles.progressPercentage}>{calculateProgress()}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
                        </View>
                        <Text style={styles.hoursCounter}>
                          {application.completed_hours} / {application.required_hours} hours completed
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Pending Message */}
              {application.status === "Pending" && (
                <View style={styles.pendingMessage}>
                  <Text style={styles.messageText}>
                    Your application is currently under review. We will notify you once there's an update.
                  </Text>
                  <Text style={styles.subMessageText}>
                    You can track your application status here.
                  </Text>
                </View>
              )}

              {/* Rejected Message */}
              {application.status === "Rejected" && (
                <View style={styles.rejectedMessage}>
                  <Text style={styles.messageText}>
                    Unfortunately, your application was not approved. Please review the feedback and consider reapplying.
                  </Text>
                  {application.remarks && (
                    <View style={styles.feedbackSection}>
                      <Text style={styles.feedbackTitle}>Feedback:</Text>
                      <Text style={styles.feedbackText}>{application.remarks}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noApplication}>
              <Text style={styles.messageText}>You haven't submitted an OJT application yet.</Text>
              <TouchableOpacity style={styles.applyButton} onPress={() => navigateTo("student/application")}>
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Evaluations */}
        {evaluations.length > 0 && (
          <View style={styles.evaluationsCard}>
            <Text style={styles.sectionTitle}>Recent Evaluations</Text>
            <View style={styles.evaluationsList}>
              {evaluations.map((evaluation) => (
                <View key={evaluation.id} style={styles.evaluationItem}>
                  <View style={styles.evaluationHeader}>
                    <Text style={styles.evalDate}>{formatDate(evaluation.date)}</Text>
                    <Text style={styles.evalScore}>Score: {evaluation.score}/100</Text>
                  </View>
                  <Text style={styles.evalFeedback}>{evaluation.feedback}</Text>
                  <Text style={styles.evalSupervisor}>Supervisor: {evaluation.supervisor}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ message: "", visible: false })}
      />

      <Navbar activeRoute="student/home" />
    </View>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
    loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  studentId: {
    fontSize: 16,
    color: "#666",
  },
  quickActionsCard: {
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  statusCard: {
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
  statusContent: {},
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
    color: "#FF9800",
  },
  approvedBadge: {
    backgroundColor: "#E8F5E9",
    color: "#4CAF50",
  },
  rejectedBadge: {
    backgroundColor: "#FFEBEE",
    color: "#F44336",
  },
  reapplyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  reapplyButtonText: {
    color: "white",
    fontWeight: "500",
  },
  partnerInfo: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoGrid: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  ojtProgress: {},
  progressOverview: {},
  timeDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eee",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  hoursCounter: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  pendingMessage: {
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subMessageText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  rejectedMessage: {
    alignItems: "center",
  },
  feedbackSection: {
    marginTop: 12,
    width: "100%",
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: "#666",
  },
  noApplication: {
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginTop: 12,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  evaluationsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  evaluationsList: {},
  evaluationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  evalDate: {
    fontSize: 14,
    color: "#666",
  },
  evalScore: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  evalFeedback: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  evalSupervisor: {
    fontSize: 14,
    color: "#666",
  },
  toastContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  toastText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});