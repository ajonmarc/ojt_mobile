import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

// Screen width for chart responsiveness
const screenWidth = Dimensions.get("window").width;

// Define types
interface ReportRow {
  [key: string]: string | number;
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
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [selectedReportType, setSelectedReportType] = useState("applications");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportRow[]>([]);

  // Mock stats data (replace with API data)
  const applicationStats: Stats = {
    total: 100,
    pending: 30,
    approved: 50,
    rejected: 20,
  };

  const partnerStats: Stats = {
    total: 25,
    active: 20,
    inactive: 5,
  };

  const studentStats: Stats = {
    total: 200,
    onOJT: 80,
    completed: 120,
  };

  // Mock chart data
  const applicationChartData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [{ data: [applicationStats.pending, applicationStats.approved, applicationStats.rejected] }],
  };

  const monthlyApplicationsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [10, 15, 20, 25, 30, 35] }],
  };

  const completionRatesData = {
    labels: ["On OJT", "Completed"],
    datasets: [{ data: [studentStats.onOJT, studentStats.completed] }],
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

  const openReportModal = () => {
    setReportModalVisible(true);
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setSelectedReportType("applications");
    setSelectedDateRange("all");
    setSelectedStatus("");
  };

  const generateReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Mock report data based on filters
      let mockData: ReportRow[] = [];
      if (selectedReportType === "applications") {
        mockData = [
          {
            studentName: "John Doe",
            studentId: "2021-00445",
            program: "Computer Science",
            status: selectedStatus || "Pending",
            applicationDate: "2023-10-01",
          },
          {
            studentName: "Jane Smith",
            studentId: "2021-00446",
            program: "Information Technology",
            status: selectedStatus || "Approved",
            applicationDate: "2023-10-02",
          },
        ].filter((row) => !selectedStatus || row.status === selectedStatus);
      } else if (selectedReportType === "partners") {
        mockData = [
          { partnerName: "Tech Corp", status: "Active", totalApplications: 10 },
          { partnerName: "Inno Solutions", status: "Inactive", totalApplications: 5 },
        ];
      } else if (selectedReportType === "students") {
        mockData = [
          { studentName: "John Doe", studentId: "2021-00445", status: "On OJT" },
          { studentName: "Jane Smith", studentId: "2021-00446", status: "Completed" },
        ];
      }

      setReportData(mockData);
      setToast({ message: "Report generated successfully!", visible: true });
      setIsLoading(false);
      closeReportModal();
    }, 1000);
  };

  const downloadReport = () => {
    // Mock download action
    setToast({ message: "Download initiated (mock action).", visible: true });
    // In production, implement CSV export with backend
  };

  // Calculate percentages for progress bars
  const getPendingPercentage = applicationStats.total
    ? ((applicationStats.pending! / applicationStats.total) * 100).toFixed(1)
    : "0";
  const getApprovedPercentage = applicationStats.total
    ? ((applicationStats.approved! / applicationStats.total) * 100).toFixed(1)
    : "0";
  const getRejectedPercentage = applicationStats.total
    ? ((applicationStats.rejected! / applicationStats.total) * 100).toFixed(1)
    : "0";

  const getActivePartnersPercentage = partnerStats.total
    ? ((partnerStats.active! / partnerStats.total) * 100).toFixed(1)
    : "0";
  const getInactivePartnersPercentage = partnerStats.total
    ? ((partnerStats.inactive! / partnerStats.total) * 100).toFixed(1)
    : "0";

  const getOnOJTPercentage = studentStats.total
    ? ((studentStats.onOJT! / studentStats.total) * 100).toFixed(1)
    : "0";
  const getCompletedPercentage = studentStats.total
    ? ((studentStats.completed! / studentStats.total) * 100).toFixed(1)
    : "0";

  // Format header for table
  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Id", "ID");
  };

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
                  <Text style={[styles.statValue, styles.totalValue]}>{applicationStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Pending</Text>
                  <Text style={[styles.statValue, styles.pendingValue]}>{applicationStats.pending}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Approved</Text>
                  <Text style={[styles.statValue, styles.approvedValue]}>{applicationStats.approved}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Rejected</Text>
                  <Text style={[styles.statValue, styles.rejectedValue]}>{applicationStats.rejected}</Text>
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
                  <Text style={[styles.statValue, styles.totalValue]}>{partnerStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Active</Text>
                  <Text style={[styles.statValue, styles.approvedValue]}>{partnerStats.active}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statItem, styles.fullWidth]}>
                  <Text style={styles.statLabel}>Inactive</Text>
                  <Text style={[styles.statValue, styles.rejectedValue]}>{partnerStats.inactive}</Text>
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
                  <Text style={[styles.statValue, styles.totalValue]}>{studentStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>On OJT</Text>
                  <Text style={[styles.statValue, styles.pendingValue]}>{studentStats.onOJT}</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={[styles.statItem, styles.fullWidth]}>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={[styles.statValue, styles.approvedValue]}>{studentStats.completed}</Text>
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
                datasets: [{ ...applicationChartData.datasets[0], backgroundColor: ["#FF9800", "#4CAF50", "#F44336"] }],
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
                  population: studentStats.onOJT || 0,
                  color: "#FF9800",
                  legendFontColor: "#333",
                  legendFontSize: 14,
                },
                {
                  name: "Completed",
                  population: studentStats.completed || 0,
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
          <TouchableOpacity style={styles.generateButton} onPress={openReportModal}>
            <Text style={styles.generateButtonText}>Open Report Generator</Text>
          </TouchableOpacity>
        </View>

        {/* Report Results */}
        {reportData.length > 0 && (
          <View style={styles.reportResults}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Report Results</Text>
              <TouchableOpacity style={styles.downloadButton} onPress={downloadReport}>
                <Text style={styles.downloadButtonText}>Download CSV</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tableContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  <View style={styles.tableHeader}>
                    {reportData[0] &&
                      Object.keys(reportData[0]).map((header) => (
                        <Text key={header} style={[styles.headerCell, { width: 150 }]}>
                          {formatHeader(header)}
                        </Text>
                      ))}
                  </View>
                  <View style={styles.tableBody}>
                    {reportData.map((row, index) => (
                      <View key={index} style={styles.tableRow}>
                        {Object.values(row).map((value, i) => (
                          <Text key={i} style={[styles.tableCell, { width: 150 }]} numberOfLines={1}>
                            {value.toString()}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Report Generator Modal */}
      <Modal visible={reportModalVisible} transparent={true} animationType="slide" onRequestClose={closeReportModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Report</Text>
              <TouchableOpacity onPress={closeReportModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Report Type</Text>
                <TouchableOpacity
                  style={styles.formSelect}
                  onPress={() => {
                    Alert.alert(
                      "Select Report Type",
                      "Choose a report type",
                      [
                        { text: "Applications", onPress: () => setSelectedReportType("applications") },
                        { text: "Partners", onPress: () => setSelectedReportType("partners") },
                        { text: "Students", onPress: () => setSelectedReportType("students") },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={styles.selectText}>
                    {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date Range</Text>
                <TouchableOpacity
                  style={styles.formSelect}
                  onPress={() => {
                    Alert.alert(
                      "Select Date Range",
                      "Choose a date range",
                      [
                        { text: "Last Week", onPress: () => setSelectedDateRange("week") },
                        { text: "Last Month", onPress: () => setSelectedDateRange("month") },
                        { text: "Last Quarter", onPress: () => setSelectedDateRange("quarter") },
                        { text: "Last Year", onPress: () => setSelectedDateRange("year") },
                        { text: "All Time", onPress: () => setSelectedDateRange("all") },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={styles.selectText}>
                    {selectedDateRange === "week"
                      ? "Last Week"
                      : selectedDateRange === "month"
                      ? "Last Month"
                      : selectedDateRange === "quarter"
                      ? "Last Quarter"
                      : selectedDateRange === "year"
                      ? "Last Year"
                      : "All Time"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {selectedReportType === "applications" && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Status</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => {
                      Alert.alert(
                        "Select Status",
                        "Choose a status",
                        [
                          { text: "All", onPress: () => setSelectedStatus("") },
                          { text: "Pending", onPress: () => setSelectedStatus("Pending") },
                          { text: "Approved", onPress: () => setSelectedStatus("Approved") },
                          { text: "Rejected", onPress: () => setSelectedStatus("Rejected") },
                          { text: "Cancel", style: "cancel" },
                        ],
                        { cancelable: true }
                      );
                    }}
                  >
                    <Text style={styles.selectText}>{selectedStatus || "All"}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeReportModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={generateReport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Generate Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
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