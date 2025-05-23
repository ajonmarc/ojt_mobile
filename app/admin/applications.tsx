import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";

// Define types
interface Application {
  id: string;
  studentName: string;
  studentId: string;
  program: string;
  applicationDate: string;
  hasResume: boolean;
  hasLetter: boolean;
  status: "Pending" | "Approved" | "Rejected";
  partnerId?: string;
  startDate?: string;
  endDate?: string;
  requiredHours?: number;
  remarks?: string;
}

interface FormErrors {
  studentId?: string;
  partnerId?: string;
  applicationDate?: string;
  status?: string;
  requiredHours?: string;
}

interface ReviewFormErrors {
  status?: string;
  requiredHours?: string;
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

export default function AdminApplications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ message: "", visible: false });

  // Sample data
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      studentName: "John Doe",
      studentId: "2021-00445",
      program: "Computer Science",
      applicationDate: "2023-10-01",
      hasResume: true,
      hasLetter: true,
      status: "Pending",
    },
  ]);

  const [students] = useState([
    { id: "1", studentId: "2021-00445", name: "John Doe", program: "Computer Science" },
    { id: "2", studentId: "2021-00446", name: "Jane Smith", program: "Information Technology" },
  ]);

  const [partners] = useState([
    { id: "1", partnerName: "Tech Corp" },
    { id: "2", partnerName: "Inno Solutions" },
  ]);

  const [addForm, setAddForm] = useState({
    studentId: "",
    partnerId: "",
    applicationDate: "",
    hasResume: false,
    hasLetter: false,
    errors: {} as FormErrors,
    processing: false,
  });

  const [reviewForm, setReviewForm] = useState({
    status: "",
    partnerId: "",
    startDate: "",
    endDate: "",
    requiredHours: "",
    remarks: "",
    errors: {} as ReviewFormErrors,
    processing: false,
  });

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

  const openAddModal = () => {
    setAddForm({
      studentId: "",
      partnerId: "",
      applicationDate: "",
      hasResume: false,
      hasLetter: false,
      errors: {},
      processing: false,
    });
    setAddModalVisible(true);
  };

  const openReviewModal = (application: Application) => {
    setSelectedApplicationId(application.id);
    setReviewForm({
      status: application.status,
      partnerId: application.partnerId || "",
      startDate: application.startDate || "",
      endDate: application.endDate || "",
      requiredHours: application.requiredHours?.toString() || "",
      remarks: application.remarks || "",
      errors: {},
      processing: false,
    });
    setReviewModalVisible(true);
  };

  const closeAddModal = () => {
    setAddModalVisible(false);
    setAddForm({
      studentId: "",
      partnerId: "",
      applicationDate: "",
      hasResume: false,
      hasLetter: false,
      errors: {},
      processing: false,
    });
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setReviewForm({
      status: "",
      partnerId: "",
      startDate: "",
      endDate: "",
      requiredHours: "",
      remarks: "",
      errors: {},
      processing: false,
    });
    setSelectedApplicationId(null);
  };

  const validateAddForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!addForm.studentId) {
      errors.studentId = "Student is required";
      isValid = false;
    }

    if (!addForm.applicationDate) {
      errors.applicationDate = "Application Date is required";
      isValid = false;
    }

    setAddForm((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const validateReviewForm = (): boolean => {
    const errors: ReviewFormErrors = {};
    let isValid = true;

    if (!reviewForm.status) {
      errors.status = "Status is required";
      isValid = false;
    }

    if (reviewForm.status === "Approved" && !reviewForm.requiredHours) {
      errors.requiredHours = "Required Hours is required for Approved status";
      isValid = false;
    } else if (reviewForm.requiredHours && isNaN(Number(reviewForm.requiredHours))) {
      errors.requiredHours = "Required Hours must be a number";
      isValid = false;
    } else if (reviewForm.requiredHours && Number(reviewForm.requiredHours) < 1) {
      errors.requiredHours = "Required Hours must be at least 1";
      isValid = false;
    }

    setReviewForm((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const submitAdd = () => {
    if (!validateAddForm()) {
      setToast({ message: "Please fix the errors in the form.", visible: true });
      return;
    }

    setAddForm((prev) => ({ ...prev, processing: true }));

    setTimeout(() => {
      const selectedStudent = students.find((s) => s.studentId === addForm.studentId);
      if (!selectedStudent) {
        setToast({ message: "Error: Invalid student selected.", visible: true });
        setAddForm((prev) => ({ ...prev, processing: false }));
        return;
      }

      const newApplication: Application = {
        id: Date.now().toString(),
        studentName: selectedStudent.name,
        studentId: selectedStudent.studentId,
        program: selectedStudent.program,
        applicationDate: addForm.applicationDate,
        hasResume: addForm.hasResume,
        hasLetter: addForm.hasLetter,
        status: "Pending",
        partnerId: addForm.partnerId || undefined,
      };
      setApplications((prev) => [...prev, newApplication]);
      setToast({ message: `Application for ${selectedStudent.name} added successfully!`, visible: true });
      setAddForm((prev) => ({ ...prev, processing: false }));
      closeAddModal();
    }, 1000);
  };

  const submitReview = () => {
    if (!validateReviewForm()) {
      setToast({ message: "Please fix the errors in the form.", visible: true });
      return;
    }

    setReviewForm((prev) => ({ ...prev, processing: true }));

    setTimeout(() => {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplicationId
            ? {
                ...app,
                status: reviewForm.status as "Pending" | "Approved" | "Rejected",
                partnerId: reviewForm.partnerId || undefined,
                startDate: reviewForm.startDate || undefined,
                endDate: reviewForm.endDate || undefined,
                requiredHours: reviewForm.requiredHours ? Number(reviewForm.requiredHours) : undefined,
                remarks: reviewForm.remarks || undefined,
              }
            : app
        )
      );
      const selectedApp = applications.find((app) => app.id === selectedApplicationId);
      setToast({ message: `Application for ${selectedApp?.studentName} reviewed successfully!`, visible: true });
      setReviewForm((prev) => ({ ...prev, processing: false }));
      closeReviewModal();
    }, 1000);
  };

  const handleDelete = (id: string, studentName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the application for ${studentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setApplications((prev) => prev.filter((app) => app.id !== id));
            setToast({ message: `Application for ${studentName} deleted successfully!`, visible: true });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Filter applications based on search query
  const filteredApplications = applications.filter(
    (app) =>
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Input error component
  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

  // Column widths for consistent table layout
  const columnWidths = {
    studentName: 150,
    studentId: 120,
    program: 150,
    applicationDate: 120,
    documents: 150,
    status: 100,
    actions: 120,
  };

  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app) => app.status === "Pending").length;
  const approvedApplications = applications.filter((app) => app.status === "Approved").length;
  const rejectedApplications = applications.filter((app) => app.status === "Rejected").length;

  // Mock document download (replace with real URLs in production)
  const downloadDocument = (applicationId: string, type: "resume" | "letter") => {
    const url = type === "resume" ? `/api/application/${applicationId}/resume` : `/api/application/${applicationId}/letter`;
    Linking.openURL(url).catch(() => setToast({ message: `Error opening ${type}.`, visible: true }));
  };

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/applications" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>OJT Applications</Text>

        {/* Search and Add Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search applications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Application</Text>
          </TouchableOpacity>
        </View>

        {/* Application List with Horizontal Scroll */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: columnWidths.studentName }]}>Student Name</Text>
                <Text style={[styles.headerCell, { width: columnWidths.studentId }]}>Student ID</Text>
                <Text style={[styles.headerCell, { width: columnWidths.program }]}>Program</Text>
                <Text style={[styles.headerCell, { width: columnWidths.applicationDate }]}>Application Date</Text>
                <Text style={[styles.headerCell, { width: columnWidths.documents }]}>Documents</Text>
                <Text style={[styles.headerCell, { width: columnWidths.status }]}>Status</Text>
                <Text style={[styles.headerCell, { width: columnWidths.actions }]}>Actions</Text>
              </View>

              {/* Table Body */}
              <View style={styles.tableBody}>
                {filteredApplications.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No applications found</Text>
                  </View>
                ) : (
                  filteredApplications.map((application) => (
                    <View key={application.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: columnWidths.studentName }]} numberOfLines={1}>
                        {application.studentName}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.studentId }]} numberOfLines={1}>
                        {application.studentId}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.program }]} numberOfLines={1}>
                        {application.program}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.applicationDate }]} numberOfLines={1}>
                        {application.applicationDate}
                      </Text>
                      <View style={[styles.tableCell, { width: columnWidths.documents }]}>
                        <View style={styles.documentLinks}>
                          {application.hasResume && (
                            <TouchableOpacity
                              style={styles.documentLink}
                              onPress={() => downloadDocument(application.id, "resume")}
                            >
                              <Ionicons name="document-text" size={16} color="#2196F3" />
                              <Text style={styles.documentText}>Resume</Text>
                            </TouchableOpacity>
                          )}
                          {application.hasLetter && (
                            <TouchableOpacity
                              style={styles.documentLink}
                              onPress={() => downloadDocument(application.id, "letter")}
                            >
                              <Ionicons name="document" size={16} color="#2196F3" />
                              <Text style={styles.documentText}>Letter</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <View style={[styles.tableCell, { width: columnWidths.status }]}>
                        <Text
                          style={[
                            styles.statusBadge,
                            application.status === "Approved"
                              ? styles.approvedBadge
                              : application.status === "Rejected"
                              ? styles.rejectedBadge
                              : styles.pendingBadge,
                          ]}
                        >
                          {application.status}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: columnWidths.actions }]}>
                        <View style={styles.actionsContainer}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openReviewModal(application)}
                          >
                            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(application.id, application.studentName)}
                          >
                            <Ionicons name="trash-outline" size={20} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="document-text" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{totalApplications}</Text>
            <Text style={styles.statLabel}>Total Applications</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="hourglass" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{pendingApplications}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{approvedApplications}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="close" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{rejectedApplications}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Application Modal */}
      <Modal visible={addModalVisible} transparent={true} animationType="slide" onRequestClose={closeAddModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Application</Text>
              <TouchableOpacity onPress={closeAddModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Student</Text>
                <TouchableOpacity
                  style={[styles.formSelect, addForm.errors.studentId && styles.inputError]}
                  onPress={() => {
                    Alert.alert(
                      "Select Student",
                      "Choose a student",
                      [
                        ...students.map((student) => ({
                          text: `${student.name} (${student.studentId})`,
                          onPress: () =>
                            setAddForm((prev) => ({ ...prev, studentId: student.studentId })),
                        })),
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={addForm.studentId ? styles.selectText : styles.selectPlaceholder}>
                    {addForm.studentId
                      ? students.find((s) => s.studentId === addForm.studentId)?.name || "Select Student"
                      : "Select Student"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                <InputError message={addForm.errors.studentId} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Partner (Optional)</Text>
                <TouchableOpacity
                  style={styles.formSelect}
                  onPress={() => {
                    Alert.alert(
                      "Select Partner",
                      "Choose a partner",
                      [
                        { text: "None", onPress: () => setAddForm((prev) => ({ ...prev, partnerId: "" })) },
                        ...partners.map((partner) => ({
                          text: partner.partnerName,
                          onPress: () => setAddForm((prev) => ({ ...prev, partnerId: partner.id })),
                        })),
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={addForm.partnerId ? styles.selectText : styles.selectPlaceholder}>
                    {addForm.partnerId
                      ? partners.find((p) => p.id === addForm.partnerId)?.partnerName || "Select Partner"
                      : "Select Partner"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Application Date</Text>
                <TextInput
                  style={[styles.formInput, addForm.errors.applicationDate && styles.inputError]}
                  value={addForm.applicationDate}
                  onChangeText={(text) => setAddForm((prev) => ({ ...prev, applicationDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
                <InputError message={addForm.errors.applicationDate} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Documents</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setAddForm((prev) => ({ ...prev, hasResume: !prev.hasResume }))}
                  >
                    <Ionicons
                      name={addForm.hasResume ? "checkbox" : "square-outline"}
                      size={24}
                      color="#4CAF50"
                    />
                    <Text style={styles.checkboxText}>Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setAddForm((prev) => ({ ...prev, hasLetter: !prev.hasLetter }))}
                  >
                    <Ionicons
                      name={addForm.hasLetter ? "checkbox" : "square-outline"}
                      size={24}
                      color="#4CAF50"
                    />
                    <Text style={styles.checkboxText}>Letter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeAddModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, addForm.processing && styles.disabledButton]}
                onPress={submitAdd}
                disabled={addForm.processing}
              >
                {addForm.processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Application Modal */}
      <Modal visible={reviewModalVisible} transparent={true} animationType="slide" onRequestClose={closeReviewModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Application</Text>
              <TouchableOpacity onPress={closeReviewModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedApplicationId && (
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {applications.find((app) => app.id === selectedApplicationId)?.studentName}
                  </Text>
                  <Text style={styles.studentDetails}>
                    ID: {applications.find((app) => app.id === selectedApplicationId)?.studentId} | Program:{" "}
                    {applications.find((app) => app.id === selectedApplicationId)?.program}
                  </Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Application Status</Text>
                <TouchableOpacity
                  style={[styles.formSelect, reviewForm.errors.status && styles.inputError]}
                  onPress={() => {
                    Alert.alert(
                      "Select Status",
                      "Choose a status",
                      [
                        { text: "Pending", onPress: () => setReviewForm((prev) => ({ ...prev, status: "Pending" })) },
                        { text: "Approved", onPress: () => setReviewForm((prev) => ({ ...prev, status: "Approved" })) },
                        { text: "Rejected", onPress: () => setReviewForm((prev) => ({ ...prev, status: "Rejected" })) },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={reviewForm.status ? styles.selectText : styles.selectPlaceholder}>
                    {reviewForm.status || "Select Status"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                <InputError message={reviewForm.errors.status} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Assign Partner (Optional)</Text>
                <TouchableOpacity
                  style={styles.formSelect}
                  onPress={() => {
                    Alert.alert(
                      "Select Partner",
                      "Choose a partner",
                      [
                        { text: "None", onPress: () => setReviewForm((prev) => ({ ...prev, partnerId: "" })) },
                        ...partners.map((partner) => ({
                          text: partner.partnerName,
                          onPress: () => setReviewForm((prev) => ({ ...prev, partnerId: partner.id })),
                        })),
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={reviewForm.partnerId ? styles.selectText : styles.selectPlaceholder}>
                    {reviewForm.partnerId
                      ? partners.find((p) => p.id === reviewForm.partnerId)?.partnerName || "Select Partner"
                      : "Select Partner"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Start Date (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={reviewForm.startDate}
                  onChangeText={(text) => setReviewForm((prev) => ({ ...prev, startDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>End Date (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={reviewForm.endDate}
                  onChangeText={(text) => setReviewForm((prev) => ({ ...prev, endDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Required Hours</Text>
                <TextInput
                  style={[styles.formInput, reviewForm.errors.requiredHours && styles.inputError]}
                  value={reviewForm.requiredHours}
                  onChangeText={(text) => setReviewForm((prev) => ({ ...prev, requiredHours: text }))}
                  placeholder="Enter required hours"
                  keyboardType="numeric"
                />
                <InputError message={reviewForm.errors.requiredHours} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Remarks/Feedback (Optional)</Text>
                <TextInput
                  style={[styles.formInput, { height: 80 }]}
                  value={reviewForm.remarks}
                  onChangeText={(text) => setReviewForm((prev) => ({ ...prev, remarks: text }))}
                  placeholder="Add comments, feedback, or requirements"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeReviewModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, reviewForm.processing && styles.disabledButton]}
                onPress={submitReview}
                disabled={reviewForm.processing}
              >
                {reviewForm.processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
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

      <Navbar activeRoute="admin/applications" />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "500",
  },
  tableContainer: {
    borderRadius: 8,
    marginBottom: 16,
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
    justifyContent: "center",
  },
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
  documentLinks: {
    flexDirection: "column",
  },
  documentLink: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  documentText: {
    color: "#2196F3",
    marginLeft: 4,
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
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
  studentInfo: {
    marginBottom: 16,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 14,
    color: "#666",
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
  formInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#F44336",
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
  selectPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  checkboxContainer: {
    flexDirection: "column",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 8,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
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