import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
// Remove this import if not used properly
// import * as FileViewer from "react-native-file-viewer";

// Replace with community datetimepicker for better stability
import DateTimePicker from '@react-native-community/datetimepicker';

import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";
import api from "../../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define types
interface Document {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  extension?: string;
}

interface Application {
  id?: string;
  status: "Pending" | "Approved" | "Rejected" | null;
  resume_path?: string;
  letter_path?: string;
  preferred_company?: string;
  start_date?: string;
  end_date?: string;
  remarks?: string;
  partner?: { name: string };
}

export default function StudentApplication() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [resumePreview, setResumePreview] = useState<Document | null>(null);
  const [letterPreview, setLetterPreview] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    resume: null as Document | null,
    applicationLetter: null as Document | null,
    preferredCompany: "",
    startDate: "" as string,
    endDate: "" as string,
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const navigation = useNavigation();

  // Fetch application data
  const fetchApplicationData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "Authentication error. Please log in.");
        navigation.navigate("Login" as never);
        return;
      }

      const response = await api.get("/application", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const app = response.data.existingApplication;
      setApplication(app);
      if (app) {
        setFormData({
          resume: null,
          applicationLetter: null,
          preferredCompany: app.preferred_company || "",
          startDate: formatDateForInput(app.start_date),
          endDate: formatDateForInput(app.end_date),
        });
      }
    } catch (error: any) {
      console.error("Error fetching application:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to load application");
      if (error.response?.status === 401) {
        navigation.navigate("Login" as never);
      }
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChangeSemester = (newSemester: string) => {
    setSemester(newSemester);
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (extension?: string) => {
    const icons: { [key: string]: string } = {
      pdf: "document",
      doc: "document-text",
      docx: "document-text",
      xls: "grid",
      xlsx: "grid",
      ppt: "easel",
      pptx: "easel",
      txt: "document-text",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
    };
    return extension ? icons[extension.toLowerCase()] || "document" : "document";
  };

  const handleFileUpload = async (type: "resume" | "applicationLetter") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const extension = asset.name.split(".").pop()?.toLowerCase();
        const doc: Document = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || "application/octet-stream",
          extension,
        };

        if (type === "resume") {
          setFormData({ ...formData, resume: doc });
          setResumePreview({
            ...doc,
            size: formatFileSize(doc.size),
          } as any);
        } else {
          setFormData({ ...formData, applicationLetter: doc });
          setLetterPreview({
            ...doc,
            size: formatFileSize(doc.size),
          } as any);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleViewDocument = async (path: string, type: "resume" | "letter") => {
    try {
      // Replace with your backend's base URL
      const baseUrl = "http://your-backend/storage/";
      const fullUrl = `${baseUrl}${path}`;
      Alert.alert("Info", `Would open ${type}: ${fullUrl}`);
      // Implement file viewing logic here
    } catch (error) {
      Alert.alert("Error", `Failed to open ${type}`);
    }
  };

  const startEditing = () => {
    setFormData({
      resume: null,
      applicationLetter: null,
      preferredCompany: application?.preferred_company || "",
      startDate: formatDateForInput(application?.start_date),
      endDate: formatDateForInput(application?.end_date),
    });
    setResumePreview(null);
    setLetterPreview(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormData({
      resume: null,
      applicationLetter: null,
      preferredCompany: "",
      startDate: "",
      endDate: "",
    });
    setResumePreview(null);
    setLetterPreview(null);
    setIsEditing(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const submit = async () => {
    if (!formData.startDate || !formData.endDate) {
      Alert.alert("Error", "Please select start and end dates");
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }
    if (!isEditing && (!formData.resume || !formData.applicationLetter)) {
      Alert.alert("Error", "Resume and application letter are required");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "Authentication error. Please log in.");
        navigation.navigate("Login" as never);
        return;
      }

      const form = new FormData();
      if (formData.resume) {
        form.append("resume", {
          uri: formData.resume.uri,
          name: formData.resume.name,
          type: formData.resume.mimeType,
        } as any);
      }
      if (formData.applicationLetter) {
        form.append("applicationLetter", {
          uri: formData.applicationLetter.uri,
          name: formData.applicationLetter.name,
          type: formData.applicationLetter.mimeType,
        } as any);
      }
      form.append("preferredCompany", formData.preferredCompany);
      form.append("startDate", formData.startDate);
      form.append("endDate", formData.endDate);
      if (isEditing) {
        form.append("_method", "PATCH");
      }

      if (isEditing && application) {
        await api.post(`/student/application/${application.id}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Alert.alert("Success", "Application updated successfully");
      } else {
        await api.post("/student/application/submit", form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Alert.alert("Success", "Application submitted successfully");
      }

      setIsEditing(false);
      fetchApplicationData();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "Authentication error. Please log in.");
        navigation.navigate("Login" as never);
        return;
      }

      await api.delete(`/student/application/${application?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Application deleted successfully");
      setShowDeleteConfirm(false);
      setApplication(null);
      setFormData({
        resume: null,
        applicationLetter: null,
        preferredCompany: "",
        startDate: "",
        endDate: "",
      });
    } catch (error: any) {
      console.error("Error deleting application:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to delete application");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Application["status"]) => {
    const colors: { [key: string]: { backgroundColor: string; color: string } } = {
      Pending: { backgroundColor: "#fef7e0", color: "#d97706" },
      Approved: { backgroundColor: "#e8f5e9", color: "#2c6929" },
      Rejected: { backgroundColor: "#fee2e2", color: "#dc3545" },
    };
    return colors[status || ""] || { backgroundColor: "#f5f5f5", color: "#666" };
  };

  const handleDateChange = (event: any, selectedDate?: Date, type?: 'start' | 'end') => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
    
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      if (type === 'start') {
        setFormData({ ...formData, startDate: dateString });
      } else if (type === 'end') {
        setFormData({ ...formData, endDate: dateString });
      }
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2c6929" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#333" }}>Loading Application...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="student/application" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchApplicationData(true)}
            colors={["#2c6929"]}
            tintColor="#2c6929"
          />
        }
      >
        <View style={styles.applicationContainer}>
          <View style={styles.applicationHeader}>
            <Text style={styles.headerTitle}>OJT Application</Text>
            {!application && !isEditing && (
              <Text style={styles.instructions}>
                Please fill out all required information and upload the necessary documents.
              </Text>
            )}
          </View>

          {/* Existing Application View */}
          {application && !isEditing ? (
            <View style={styles.existingApplication}>
              <View style={styles.statusHeader}>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, getStatusColor(application.status)]}>
                    <Text style={[styles.statusText, { color: getStatusColor(application.status).color }]}>
                      {application.status}
                      {application.partner && ` - Assigned to: ${application.partner.name}`}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.btnSecondary, application.status === "Approved" && styles.disabledButton]}
                      onPress={startEditing}
                      disabled={application.status === "Approved"}
                    >
                      <Text style={styles.btnSecondaryText}>Edit Application</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnDanger, application.status === "Approved" && styles.disabledButton]}
                      onPress={() => setShowDeleteConfirm(true)}
                      disabled={application.status === "Approved"}
                    >
                      <Text style={styles.btnDangerText}>Delete Application</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.detailGroup}>
                <Text style={styles.sectionTitle}>Documents</Text>
                <View style={styles.documentGrid}>
                  <View style={styles.documentPreview}>
                    <Text style={styles.documentTitle}>Resume</Text>
                    <TouchableOpacity
                      style={styles.fileLink}
                      onPress={() => handleViewDocument(application.resume_path!, "resume")}
                    >
                      <Ionicons
                        name={getFileIcon(application.resume_path?.split(".").pop()) as any}
                        size={16}
                        color="#2c6929"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.fileLinkText}>View Resume</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.documentPreview}>
                    <Text style={styles.documentTitle}>Application Letter</Text>
                    <TouchableOpacity
                      style={styles.fileLink}
                      onPress={() => handleViewDocument(application.letter_path!, "letter")}
                    >
                      <Ionicons
                        name={getFileIcon(application.letter_path?.split(".").pop()) as any}
                        size={16}
                        color="#2c6929"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.fileLinkText}>View Application Letter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.detailGroup}>
                <Text style={styles.sectionTitle}>Schedule Details</Text>
                <View style={styles.detailGrid}>
                  <View>
                    <Text style={styles.detailLabel}>Preferred Company</Text>
                    <Text style={styles.detailValue}>{application.preferred_company || "Not specified"}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Schedule</Text>
                    <Text style={styles.detailValue}>
                      {application.start_date} to {application.end_date}
                    </Text>
                  </View>
                </View>
              </View>

              {application.remarks && (
                <View style={styles.detailGroup}>
                  <Text style={styles.sectionTitle}>Remarks</Text>
                  <Text style={styles.remarks}>{application.remarks}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.applicationForm}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Documents</Text>

                <View style={styles.uploadGroup}>
                  <Text style={styles.label}>Resume {isEditing ? "(Optional)" : ""}</Text>
                  <View style={styles.uploadContainer}>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleFileUpload("resume")}>
                      <Ionicons name="cloud-upload-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.uploadButtonText}>Upload Resume</Text>
                    </TouchableOpacity>
                    {resumePreview && (
                      <View style={styles.filePreview}>
                        <Ionicons
                          name={getFileIcon(resumePreview.extension) as any}
                          size={16}
                          color={getFileIconColor(resumePreview.extension)}
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.filePreviewText}>
                          {resumePreview.name} ({resumePreview.size})
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.helpText}>Upload your professional resume</Text>
                </View>

                <View style={styles.uploadGroup}>
                  <Text style={styles.label}>Application Letter {isEditing ? "(Optional)" : ""}</Text>
                  <View style={styles.uploadContainer}>
                    <TouchableOpacity style={styles.uploadButton} onPress={() => handleFileUpload("applicationLetter")}>
                      <Ionicons name="cloud-upload-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.uploadButtonText}>Upload Application Letter</Text>
                    </TouchableOpacity>
                    {letterPreview && (
                      <View style={styles.filePreview}>
                        <Ionicons
                          name={getFileIcon(letterPreview.extension) as any}
                          size={16}
                          color={getFileIconColor(letterPreview.extension)}
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.filePreviewText}>
                          {letterPreview.name} ({letterPreview.size})
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.helpText}>Upload your application letter</Text>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Preferred Schedule</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Preferred Company (Optional)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.preferredCompany}
                      placeholder="Enter your preferred company name"
                      onChangeText={(text) => setFormData({ ...formData, preferredCompany: text })}
                    />
                  </View>
                  <Text style={styles.helpText}>If you have a specific company in mind, enter it here</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Preferred Start Date</Text>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                    <Text style={[styles.input, { color: formData.startDate ? "#333" : "#999" }]}>
                      {formData.startDate || "Select date"}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={formData.startDate ? new Date(formData.startDate) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'start')}
                    />
                  )}
                  {Platform.OS === 'ios' && showStartDatePicker && (
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => setShowStartDatePicker(false)}
                    >
                      <Text style={styles.btnPrimaryText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Preferred End Date</Text>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                    <Text style={[styles.input, { color: formData.endDate ? "#333" : "#999" }]}>
                      {formData.endDate || "Select date"}
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={formData.endDate ? new Date(formData.endDate) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'end')}
                    />
                  )}
                  {Platform.OS === 'ios' && showEndDatePicker && (
                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => setShowEndDatePicker(false)}
                    >
                      <Text style={styles.btnPrimaryText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.formActions}>
                {isEditing && (
                  <TouchableOpacity style={styles.btnSecondary} onPress={cancelEditing}>
                    <Text style={styles.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.btnPrimary} onPress={submit} disabled={loading}>
                  <Text style={styles.btnPrimaryText}>
                    {loading ? "Submitting..." : isEditing ? "Update Application" : "Submit Application"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <Navbar activeRoute="student/application" />

      {/* Delete Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={showDeleteConfirm}>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning" size={40} color="#dc3545" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Application</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this application? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteButton} onPress={deleteApplication}>
                <Ionicons name="trash-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getFileIconColor = (extension?: string) => {
  const colors: { [key: string]: string } = {
    pdf: "#dc3545",
    doc: "#2b579a",
    docx: "#2b579a",
    xls: "#217346",
    xlsx: "#217346",
    ppt: "#d24726",
    pptx: "#d24726",
    txt: "#666",
    jpg: "#4caf50",
    jpeg: "#4caf50",
    png: "#4caf50",
    gif: "#4caf50",
  };
  return extension ? colors[extension.toLowerCase()] || "#666" : "#666";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  applicationContainer: {
    maxWidth: 800,
    marginHorizontal: "auto",
    padding: 20,
  },
  applicationHeader: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c6929",
    marginBottom: 10,
  },
  instructions: {
    color: "#666",
    fontSize: 16,
  },
  existingApplication: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicationForm: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusText: {
    fontWeight: "500",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  btnSecondary: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  btnSecondaryText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  btnDanger: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  btnDangerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#e4606d",
    opacity: 0.6,
  },
  detailGroup: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    color: "#333",
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "500",
  },
  documentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  documentPreview: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    width: "48%",
  },
  documentTitle: {
    color: "#666",
    marginBottom: 8,
    fontSize: 14,
  },
  fileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileLinkText: {
    color: "#2c6929",
    fontSize: 14,
    textDecorationLine: "none",
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  remarks: {
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 4,
    color: "#856404",
    fontSize: 14,
  },
  formSection: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  uploadGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
    color: "#333",
    fontSize: 14,
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ddd",
    padding: 20,
    borderRadius: 4,
    backgroundColor: "#f9f9f9",
  },
  uploadButton: {
    backgroundColor: "#2c6929",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  filePreviewText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  helpText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  formGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 30,
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: "#2c6929",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  btnPrimaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  deleteModalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 12,
    color: "#dc3545",
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
    textAlign: "center",
    color: "#333",
  },
  deleteModalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  cancelDeleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 120,
    alignItems: "center",
  },
  cancelDeleteText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 14,
  },
  confirmDeleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 120,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmDeleteText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  datePicker: {
    alignSelf: "center",
    marginVertical: 10,
    width: Platform.OS === "ios" ? 300 : 280,
  },
});