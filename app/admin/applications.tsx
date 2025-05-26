  import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ActivityIndicator, Linking, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import api from "../../axios"; // Axios instance
import AddApplicationModal from "@/components/AddApplicationModal"; // React Native equivalent

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
  partnerName?: string;
  startDate?: string;
  endDate?: string;
  requiredHours?: number;
  remarks?: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  program: string;
}

interface Partner {
  id: string;
  partnerName: string;
}

interface FormErrors {
  status?: string;
  requiredHours?: string;
}

// Toast component for notifications
const Toast = ({ message, visible, onClose }: { message: { text: string; isError?: boolean }; visible: boolean; onClose: () => void }) => {
  if (!visible) return null;
  return (
    <View style={[styles.toastContainer, { backgroundColor: message.isError ? "#F44336" : "#4CAF50" }]}>
      <Text style={styles.toastText}>{message.text}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// PDF Viewer Modal Component
const PDFViewerModal = ({ visible, onClose, pdfUrl, documentTitle, applicationId, documentType }) => {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      const filename = `${documentTitle}_${documentType}.pdf`;
      const downloadDir = FileSystem.documentDirectory + filename;
      
      const { uri } = await FileSystem.downloadAsync(pdfUrl, downloadDir);
      
      // Share the downloaded file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Download ${documentTitle} ${documentType}`
        });
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download PDF');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const printPDF = async () => {
    try {
      setPrinting(true);
      
      // For printing, we'll create a print job with the PDF URL
      await Print.printAsync({
        uri: pdfUrl,
        printerUrl: pdfUrl // This allows the system to handle PDF printing
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to print PDF');
      console.error('Print error:', error);
    } finally {
      setPrinting(false);
    }
  };

  const showDownloadOptions = () => {
    Alert.alert(
      'PDF Options',
      'Choose an action for this PDF',
      [
        {
          text: 'Download',
          onPress: downloadPDF,
          style: 'default'
        },
        {
          text: 'Print',
          onPress: printPDF,
          style: 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.pdfModalContainer}>
        {/* Header */}
        <View style={styles.pdfModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.pdfCloseButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.pdfModalTitle} numberOfLines={1}>
            {documentTitle} - {documentType}
          </Text>
          <View style={styles.pdfHeaderActions}>
            <TouchableOpacity 
              onPress={showDownloadOptions} 
              style={styles.pdfActionButton}
              disabled={downloading || printing}
            >
              {downloading || printing ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Ionicons name="download-outline" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={printPDF} 
              style={styles.pdfActionButton}
              disabled={downloading || printing}
            >
              {printing ? (
                <ActivityIndicator size="small" color="#2196F3" />
              ) : (
                <Ionicons name="print-outline" size={24} color="#2196F3" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* PDF Viewer */}
        <View style={styles.pdfViewer}>
          <WebView
            source={{ uri: pdfUrl }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.pdfLoadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.pdfLoadingText}>Loading PDF...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
              Alert.alert('Error', 'Failed to load PDF. Please try again.');
            }}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        {/* Bottom Actions */}
        <View style={styles.pdfModalFooter}>
          <TouchableOpacity 
            style={[styles.pdfFooterButton, styles.downloadButton]} 
            onPress={downloadPDF}
            disabled={downloading || printing}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#fff" />
                <Text style={styles.pdfFooterButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.pdfFooterButton, styles.printButton]} 
            onPress={printPDF}
            disabled={downloading || printing}
          >
            {printing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="print" size={20} color="#fff" />
                <Text style={styles.pdfFooterButtonText}>Print</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function AdminApplications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ message: { text: "", isError: false }, visible: false });
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF viewer state
  const [pdfViewerData, setPdfViewerData] = useState({
    url: '',
    title: '',
    documentType: '',
    applicationId: ''
  });

  const [reviewForm, setReviewForm] = useState({
    status: "",
    partnerId: "",
    startDate: "",
    endDate: "",
    requiredHours: "600",
    remarks: "",
    errors: {} as FormErrors,
    processing: false,
  });

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/applications");
        const { applications, students, partners } = response.data;
        setApplications(applications);
        setStudents(students);
        setPartners(partners);
        setError(null);
      } catch (err: any) {
        setError("Failed to fetch applications. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ message: { text: "", isError: false }, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangeSemester = (newSemester: string) => {
    setSemester(newSemester);
  };

  const openReviewModal = (application: Application) => {
    setSelectedApplicationId(application.id);
    setReviewForm({
      status: application.status,
      partnerId: application.partnerId || "",
      startDate: application.startDate || "",
      endDate: application.endDate || "",
      requiredHours: application.requiredHours?.toString() || "600",
      remarks: application.remarks || "",
      errors: {},
      processing: false,
    });
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedApplicationId(null);
    setReviewForm({
      status: "",
      partnerId: "",
      startDate: "",
      endDate: "",
      requiredHours: "600",
      remarks: "",
      errors: {},
      processing: false,
    });
  };

  const validateReviewForm = (): boolean => {
    const errors: FormErrors = {};
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

  const submitReview = async () => {
    if (!validateReviewForm()) {
      setToast({ message: { text: "Please fix the errors in the form.", isError: true }, visible: true });
      return;
    }

    if (!selectedApplicationId) {
      setToast({ message: { text: "No application selected.", isError: true }, visible: true });
      return;
    }

    setReviewForm((prev) => ({ ...prev, processing: true }));

    try {
      const response = await api.put(`/admin/applications/${selectedApplicationId}`, {
        status: reviewForm.status,
        partnerId: reviewForm.partnerId || null,
        startDate: reviewForm.startDate || null,
        endDate: reviewForm.endDate || null,
        requiredHours: reviewForm.requiredHours ? Number(reviewForm.requiredHours) : null,
        remarks: reviewForm.remarks || null,
      });
      const updatedApplication = response.data.application;
      setApplications((prev) =>
        prev.map((app) => (app.id === selectedApplicationId ? updatedApplication : app))
      );
      setToast({ message: { text: "Application status updated successfully!", isError: false }, visible: true });
      closeReviewModal();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setReviewForm((prev) => ({ ...prev, errors: err.response.data.errors }));
        setToast({ message: { text: "Please fix the errors in the form.", isError: true }, visible: true });
      } else {
        setToast({ message: { text: err.response?.data?.message || "Failed to review application.", isError: true }, visible: true });
      }
      console.error(err);
    } finally {
      setReviewForm((prev) => ({ ...prev, processing: false }));
    }
  };

  const deleteApplication = (application: Application) => {
    Alert.alert(
      "Are you sure?",
      "You won't be able to revert this!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/admin/applications/${application.id}`);
              setApplications((prev) => prev.filter((app) => app.id !== application.id));
              setToast({ message: { text: "Application deleted successfully!", isError: false }, visible: true });
            } catch (err: any) {
              setToast({
                message: { text: err.response?.data?.message || "Failed to delete application.", isError: true },
                visible: true,
              });
              console.error(err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleApplicationAdded = () => {
    setAddModalVisible(false);
    setToast({ message: { text: "Application added successfully!", isError: false }, visible: true });
    // Refresh applications
    api.get("/admin/applications")
      .then((response) => {
        setApplications(response.data.applications);
      })
      .catch((err) => console.error(err));
  };

  // Filter applications
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
    program: 120,
    applicationDate: 100,
    documents: 120,
    status: 100,
    actions: 120,
  };

  // Status badge style
  const getStatusStyle = (status: string) => {
    return {
      ...styles.statusBadge,
      ...(status === "Approved" ? styles.approvedBadge : status === "Rejected" ? styles.rejectedBadge : styles.pendingBadge),
    };
  };

  // View document in PDF viewer
  const viewDocument = async (applicationId: string, type: "resume" | "letter") => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      const pdfUrl = `${api.defaults.baseURL}/admin/applications/${applicationId}/${type.toLowerCase()}`;
      const documentTitle = `${application.studentName} - ${application.studentId}`;
      
      setPdfViewerData({
        url: pdfUrl,
        title: documentTitle,
        documentType: type.charAt(0).toUpperCase() + type.slice(1),
        applicationId: applicationId
      });
      setPdfModalVisible(true);
    } catch (err) {
      setToast({ message: { text: `Error loading ${type}.`, isError: true }, visible: true });
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/applications" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Student OJT Applications</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Application</Text>
          </TouchableOpacity>
        </View>

        {/* Search Section */}
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
        </View>

        {/* Applications Table */}
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
                              onPress={() => viewDocument(application.id, "resume")}
                            >
                              <Ionicons name="document-text" size={16} color="#2196F3" />
                              <Text style={styles.documentText}>View Resume</Text>
                            </TouchableOpacity>
                          )}
                          {application.hasLetter && (
                            <TouchableOpacity
                              style={styles.documentLink}
                              onPress={() => viewDocument(application.id, "letter")}
                            >
                              <Ionicons name="document" size={16} color="#2196F3" />
                              <Text style={styles.documentText}>View Letter</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <View style={[styles.tableCell, { width: columnWidths.status }]}>
                        <Text style={getStatusStyle(application.status)}>{application.status}</Text>
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
                            onPress={() => deleteApplication(application)}
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
      </ScrollView>

      {/* Add Application Modal */}
      <AddApplicationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        students={students}
        partners={partners}
        onApplicationAdded={handleApplicationAdded}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        pdfUrl={pdfViewerData.url}
        documentTitle={pdfViewerData.title}
        applicationId={pdfViewerData.applicationId}
        documentType={pdfViewerData.documentType}
      />

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
        onClose={() => setToast({ message: { text: "", isError: false }, visible: false })}
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
    pdfModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  pdfCloseButton: {
    padding: 8,
  },
  pdfModalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  pdfHeaderActions: {
    flexDirection: 'row',
  },
  pdfActionButton: {
    marginLeft: 12,
    padding: 8,
  },
  pdfViewer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  webView: {
    flex: 1,
  },
  pdfLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  pdfModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  pdfFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
  },
  printButton: {
    backgroundColor: '#2196F3',
  },
  pdfFooterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});