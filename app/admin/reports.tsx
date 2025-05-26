import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import api from "../../axios"; // Axios instance

// Screen width for chart responsiveness
const screenWidth = Dimensions.get("window").width;

// Define types
interface Application {
  id: number;
  user_id: number;
  partner_id: number | null;
  status: string;
  resume_path: string | null;
  letter_path: string | null;
  preferred_company: string | null;
  start_date: string | null;
  end_date: string | null;
  completed_hours: number;
  required_hours: number;
  remarks: string | null;
  application_date: string | null;
}

interface Program {
  id: number;
  programName: string;
  programDescription: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  studentId: string | null;
  studentPhone: string | null;
  ojtProgram: string | null;
  status: string | null;
  role: string;
}

interface Stats {
  total: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  active?: number;
  inactive?: number;
  onOJT?: number;
  completed?: number;
}

interface ReportData {
  applicationStats: Stats;
  partnerStats: Stats;
  studentStats: Stats;
  monthlyApplications: number[];
  applications: Application[];
  programs: Program[];
  users: User[];
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

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [toast, setToast] = useState({ message: "", visible: false });
  const [selectedReportType, setSelectedReportType] = useState("applications");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    applicationStats: { total: 0, pending: 0, approved: 0, rejected: 0 },
    partnerStats: { total: 0, active: 0, inactive: 0 },
    studentStats: { total: 0, onOJT: 0, completed: 0 },
    monthlyApplications: [0, 0, 0, 0, 0, 0],
    applications: [],
    programs: [],
    users: [],
  });

  // Fetch report data from backend
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/report', {
          params: { semester }, // Pass semester as query parameter
        });

        const data = response.data;
        setReportData({
          applicationStats: {
            total: data.applicationStats?.total || 0,
            pending: data.applicationStats?.pending || 0,
            approved: data.applicationStats?.approved || 0,
            rejected: data.applicationStats?.rejected || 0,
          },
          partnerStats: {
            total: data.partnerStats?.total || 0,
            active: data.partnerStats?.active || 0,
            inactive: data.partnerStats?.inactive || 0,
          },
          studentStats: {
            total: data.studentStats?.total || 0,
            onOJT: data.studentStats?.onOJT || 0,
            completed: data.studentStats?.completed || 0,
          },
          monthlyApplications: data.monthlyApplications || [0, 0, 0, 0, 0, 0],
          applications: Array.isArray(data.applications) ? data.applications : [],
          programs: Array.isArray(data.programs) ? data.programs : [],
          users: Array.isArray(data.users) ? data.users : [],
        });
        setToast({ message: "Data loaded successfully", visible: true });
      } catch (error) {
        console.error("Error fetching report data:", error);
        setToast({ message: "Error fetching report data", visible: true });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [semester]); // Refetch when semester changes

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ message: "", visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Chart data
  const applicationChartData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [{
      data: [
        reportData.applicationStats.pending || 0,
        reportData.applicationStats.approved || 0,
        reportData.applicationStats.rejected || 0,
      ],
    }],
  };

  const monthlyApplicationsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: reportData.monthlyApplications }],
  };

  const completionRatesData = {
    labels: ["On OJT", "Completed"],
    datasets: [{ data: [reportData.studentStats.onOJT || 0, reportData.studentStats.completed || 0] }],
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green theme
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: "#4CAF50" },
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangeSemester = (newSemester: string) => {
    setSemester(newSemester);
  };

  // Calculate percentages for progress bars
  const getPendingPercentage = reportData.applicationStats.total
    ? ((reportData.applicationStats.pending! / reportData.applicationStats.total) * 100).toFixed(1)
    : "0";
  const getApprovedPercentage = reportData.applicationStats.total
    ? ((reportData.applicationStats.approved! / reportData.applicationStats.total) * 100).toFixed(1)
    : "0";
  const getRejectedPercentage = reportData.applicationStats.total
    ? ((reportData.applicationStats.rejected! / reportData.applicationStats.total) * 100).toFixed(1)
    : "0";

  const getActivePartnersPercentage = reportData.partnerStats.total
    ? ((reportData.partnerStats.active! / reportData.partnerStats.total) * 100).toFixed(1)
    : "0";
  const getInactivePartnersPercentage = reportData.partnerStats.total
    ? ((reportData.partnerStats.inactive! / reportData.partnerStats.total) * 100).toFixed(1)
    : "0";

  const getOnOJTPercentage = reportData.studentStats.total
    ? ((reportData.studentStats.onOJT! / reportData.studentStats.total) * 100).toFixed(1)
    : "0";
  const getCompletedPercentage = reportData.studentStats.total
    ? ((reportData.studentStats.completed! / reportData.studentStats.total) * 100).toFixed(1)
    : "0";

  // Format header for table
  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Id", "ID");
  };

  // Generate report PDF
  const generateReport = async () => {
    try {
      setLoading(true);
      const applications = Array.isArray(reportData.applications) ? reportData.applications : [];
      const programs = Array.isArray(reportData.programs) ? reportData.programs : [];
      const users = Array.isArray(reportData.users) ? reportData.users : [];

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1, h2 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #4CAF50; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .section { margin-bottom: 30px; }
              .stats { margin-bottom: 20px; }
              .stats p { margin: 5px 0; }
              .no-data { color: #666; font-style: italic; }
            </style>
          </head>
          <body>
            <h1>Internship Report - ${semester}</h1>

            <div class="section">
              <h2>Application Statistics</h2>
              <div class="stats">
                <p><strong>Total Applications:</strong> ${reportData.applicationStats.total}</p>
                <p><strong>Pending:</strong> ${reportData.applicationStats.pending || 0}</p>
                <p><strong>Approved:</strong> ${reportData.applicationStats.approved || 0}</p>
                <p><strong>Rejected:</strong> ${reportData.applicationStats.rejected || 0}</p>
              </div>
              <h3>Application Details</h3>
              ${applications.length > 0 ? `
                <table>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Partner ID</th>
                    <th>Status</th>
                    <th>Preferred Company</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Completed Hours</th>
                    <th>Required Hours</th>
                    <th>Application Date</th>
                    <th>Remarks</th>
                  </tr>
                  ${applications.map(app => `
                    <tr>
                      <td>${app.id || 'N/A'}</td>
                      <td>${app.user_id || 'N/A'}</td>
                      <td>${app.partner_id || 'N/A'}</td>
                      <td>${app.status || 'N/A'}</td>
                      <td>${app.preferred_company || 'N/A'}</td>
                      <td>${app.start_date || 'N/A'}</td>
                      <td>${app.end_date || 'N/A'}</td>
                      <td>${app.completed_hours || 0}</td>
                      <td>${app.required_hours || 0}</td>
                      <td>${app.application_date || 'N/A'}</td>
                      <td>${app.remarks || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : '<p class="no-data">No application data available</p>'}
            </div>

            <div class="section">
              <h2>Partner Statistics</h2>
              <div class="stats">
                <p><strong>Total Partners:</strong> ${reportData.partnerStats.total}</p>
                <p><strong>Active:</strong> ${reportData.partnerStats.active || 0}</p>
                <p><strong>Inactive:</strong> ${reportData.partnerStats.inactive || 0}</p>
              </div>
              <h3>Partner Details</h3>
              ${programs.length > 0 ? `
                <table>
                  <tr>
                    <th>ID</th>
                    <th>Program Name</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                  ${programs.map(program => `
                    <tr>
                      <td>${program.id || 'N/A'}</td>
                      <td>${program.programName || 'N/A'}</td>
                      <td>${program.programDescription || 'N/A'}</td>
                      <td>${program.status || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : '<p class="no-data">No partner data available</p>'}
            </div>

            <div class="section">
              <h2>Student Statistics</h2>
              <div class="stats">
                <p><strong>Total Students:</strong> ${reportData.studentStats.total}</p>
                <p><strong>On OJT:</strong> ${reportData.studentStats.onOJT || 0}</p>
                <p><strong>Completed:</strong> ${reportData.studentStats.completed || 0}</p>
              </div>
              <h3>Student Details</h3>
              ${users.length > 0 ? `
                <table>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Phone</th>
                    <th>OJT Program</th>
                    <th>Status</th>
                  </tr>
                  ${users.map(user => `
                    <tr>
                      <td>${user.id || 'N/A'}</td>
                      <td>${user.name || 'N/A'}</td>
                      <td>${user.email || 'N/A'}</td>
                      <td>${user.studentId || 'N/A'}</td>
                      <td>${user.studentPhone || 'N/A'}</td>
                      <td>${user.ojtProgram || 'N/A'}</td>
                      <td>${user.status || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : '<p class="no-data">No student data available</p>'}
            </div>

            <div class="section">
              <h2>Monthly Applications Trend</h2>
              <p>January: ${reportData.monthlyApplications[0] || 0}</p>
              <p>February: ${reportData.monthlyApplications[1] || 0}</p>
              <p>March: ${reportData.monthlyApplications[2] || 0}</p>
              <p>April: ${reportData.monthlyApplications[3] || 0}</p>
              <p>May: ${reportData.monthlyApplications[4] || 0}</p>
              <p>June: ${reportData.monthlyApplications[5] || 0}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
      setToast({ message: "Report generated and shared successfully", visible: true });
    } catch (error) {
      console.error("Error generating report:", error);
      setToast({ message: `Error generating report: ${error.message}`, visible: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading report data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/reports" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Reports</Text>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Application Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Applications</Text>
              <Ionicons name="document-text" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statsContent}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={[styles.statValue, styles.totalValue]}>{reportData.applicationStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Pending</Text>
                  <Text style={[styles.statValue, styles.pendingValue]}>{reportData.applicationStats.pending || 0}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Approved</Text>
                  <Text style={[styles.statValue, styles.approvedValue]}>{reportData.applicationStats.approved || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Rejected</Text>
                  <Text style={[styles.statValue, styles.rejectedValue]}>{reportData.applicationStats.rejected || 0}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressSegment, styles.pendingSegment, { width: `${getPendingPercentage}%` }]} />
                <View style={[styles.progressSegment, styles.approvedSegment, { width: `${getApprovedPercentage}%` }]} />
                <View style={[styles.progressSegment, styles.rejectedSegment, { width: `${getRejectedPercentage}%` }]} />
              </View>
            </View>
          </View>

          {/* Partner Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Partners</Text>
              <Ionicons name="business" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statsContent}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={[styles.statValue, styles.totalValue]}>{reportData.partnerStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Active</Text>
                  <Text style={[styles.statValue, styles.approvedValue]}>{reportData.partnerStats.active || 0}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statItem, styles.fullWidth]}>
                  <Text style={styles.statLabel}>Inactive</Text>
                  <Text style={[styles.statValue, styles.rejectedValue]}>{reportData.partnerStats.inactive || 0}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressSegment, styles.approvedSegment, { width: `${getActivePartnersPercentage}%` }]} />
                <View style={[styles.progressSegment, styles.rejectedSegment, { width: `${getInactivePartnersPercentage}%` }]} />
              </View>
            </View>
          </View>

          {/* Student Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Students</Text>
              <Ionicons name="school" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statsContent}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={[styles.statValue, styles.totalValue]}>{reportData.studentStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>On OJT</Text>
                  <Text style={[styles.statValue, styles.pendingValue]}>{reportData.studentStats.onOJT || 0}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statItem, styles.fullWidth]}>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={[styles.statValue, styles.approvedValue]}>{reportData.studentStats.completed || 0}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressSegment, styles.pendingSegment, { width: `${getOnOJTPercentage}%` }]} />
                <View style={[styles.progressSegment, styles.approvedSegment, { width: `${getCompletedPercentage}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsGrid}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Application Status Distribution</Text>
            <BarChart
              data={{
                ...applicationChartData,
                datasets: [{
                  ...applicationChartData.datasets[0],
                  backgroundColor: ["#FF9800", "#4CAF50", "#F44336"],
                }],
              }}
              width={screenWidth - 80}
              height={220}
              yAxisLabel=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              style={styles.chart}
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Monthly Applications Trend</Text>
            <LineChart
              data={monthlyApplicationsData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>OJT Completion Rates</Text>
            <PieChart
              data={[
                {
                  name: "On OJT",
                  population: reportData.studentStats.onOJT || 0,
                  color: "#FF9800",
                  legendFontColor: "#333",
                  legendFontSize: 14,
                },
                {
                  name: "Completed",
                  population: reportData.studentStats.completed || 0,
                  color: "#4CAF50",
                  legendFontColor: "#333",
                  legendFontSize: 14,
                },
              ]}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </View>

        {/* Report Generator */}
        <View style={styles.reportGenerator}>
          <Text style={styles.sectionTitle}>Generate Report</Text>
          <TouchableOpacity style={styles.generateButton} onPress={generateReport}>
            <Text style={styles.generateButtonText}>GENERATE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={() => setToast({ message: "", visible: false })}
      />
      <Navbar activeRoute="admin/reports" />
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
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statsContent: {},
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  fullWidth: {
    flex: 2,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#333",
  },
  pendingValue: {
    color: "#FF9800",
  },
  approvedValue: {
    color: "#4CAF50",
  },
  rejectedValue: {
    color: "#F44336",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eee",
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 8,
  },
  progressSegment: {
    height: "100%",
  },
  pendingSegment: {
    backgroundColor: "#FF9800",
  },
  approvedSegment: {
    backgroundColor: "#4CAF50",
  },
  rejectedSegment: {
    backgroundColor: "#F44336",
  },
  chartsGrid: {
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  reportGenerator: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  generateButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  reportResults: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  downloadButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  downloadButtonText: {
    color: "white",
    fontWeight: "500",
  },
  tableContainer: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  tableBody: {
    backgroundColor: "white",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  formSelect: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 16,
    color: "#333",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
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