import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";
import api from "../../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import moment from "moment";

export default function StudentProgress() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/student/progress");
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  const progressPercentage = (completed = 0, required = 0) => {
    if (!required || required <= 0) return 0;
    return Math.min(100, Math.round((completed / required) * 100));
  };

  const formatDate = (date) => {
    return date ? moment(date).format("MMMM D, YYYY") : "Not set";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#4CAF50";
      case "Pending":
        return "#FFC107";
      case "Rejected":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangeSemester = (newSemester) => {
    setSemester(newSemester);
    // fetchData() optionally based on semester
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const { auth, application, progress } = data || {};

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="student/progress" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.welcome}>Welcome, {auth?.user?.name}!</Text>
        <Text style={styles.studentId}>Student ID: {auth?.user?.studentId}</Text>
           <Text style={styles.studentId}>Program: {auth?.user?.ojtProgram}</Text>

        {application ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>OJT Status</Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(application.status) }]}>
              <Text style={styles.badgeText}>{application.status}</Text>
            </View>

            {application.status === "Approved" && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Company Information</Text>
                  <Text>Company: {application.partner?.name || "N/A"}</Text>
                  <Text>Address: {application.partner?.address || "N/A"}</Text>
                  <Text>Start Date: {formatDate(application.startDate)}</Text>
                  <Text>End Date: {formatDate(application.endDate)}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Progress Overview</Text>
                  <Text>
                    {application.completedHours || 0} / {application.requiredHours || 0} Hours
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressPercentage(application.completedHours, application.requiredHours)}%` }]} />
                  </View>
                  <Text>{progressPercentage(application.completedHours, application.requiredHours)}%</Text>
                </View>

                {progress?.recentEntries?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Progress</Text>
                    {progress.recentEntries.map((entry) => (
                      <View key={entry.id} style={styles.entry}>
                        <Text style={styles.entryHeader}>{formatDate(entry.date)} - {entry.hours} hours</Text>
                        <Text>Tasks: {entry.tasks}</Text>
                        {entry.remarks && <Text>Remarks: {entry.remarks}</Text>}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {application.status === "Rejected" && (
              <View style={styles.section}>
                <Text>Your application was rejected. Please revise and reapply.</Text>
                {application.remarks && (
                  <View style={styles.remarks}>
                    <Text style={styles.sectionTitle}>Remarks</Text>
                    <Text>{application.remarks}</Text>
                  </View>
                )}
                <Link href="/student/application" asChild>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Reapply</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}

            {application.status === "Pending" && (
              <View style={styles.section}>
                <Text>Your application is under review.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text>You haven't submitted your OJT application yet.</Text>
            <Link href="/student/application" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Apply Now</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
      <Navbar activeRoute="student/progress" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E9" },
  content: { flex: 1, padding: 20 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  studentId: { fontSize: 16, color: "#555" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginTop: 20 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  badge: { padding: 6, borderRadius: 6, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontWeight: "bold" },
  section: { marginTop: 15 },
  sectionTitle: { fontWeight: "bold", marginBottom: 5 },
  progressBarBackground: { backgroundColor: "#ddd", height: 10, borderRadius: 5, marginVertical: 5 },
  progressBarFill: { backgroundColor: "#4CAF50", height: 10, borderRadius: 5 },
  entry: { marginTop: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  entryHeader: { fontWeight: "bold" },
  remarks: { marginTop: 10 },
  button: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 6, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center" },
});
