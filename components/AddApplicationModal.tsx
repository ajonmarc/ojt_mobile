// components/AddApplicationModal.tsx
import { View, Text,StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import api from "../axios";

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

interface Props {
  visible: boolean;
  onClose: () => void;
  students: Student[];
  partners: Partner[];
  onApplicationAdded: () => void;
}

interface FormErrors {
  studentId?: string;
  applicationDate?: string;
}

export default function AddApplicationModal({ visible, onClose, students, partners, onApplicationAdded }: Props) {
  const [form, setForm] = useState({
    studentId: "",
    partnerId: "",
    applicationDate: "",
    hasResume: false,
    hasLetter: false,
    errors: {} as FormErrors,
    processing: false,
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!form.studentId) {
      errors.studentId = "Student is required";
      isValid = false;
    }

    if (!form.applicationDate) {
      errors.applicationDate = "Application Date is required";
      isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.applicationDate)) {
      errors.applicationDate = "Application Date must be in YYYY-MM-DD format";
      isValid = false;
    }

    setForm((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const submit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fix the errors in the form.");
      return;
    }

    setForm((prev) => ({ ...prev, processing: true }));

    try {
      await api.post("/admin/applications", {
        studentId: form.studentId,
        partnerId: form.partnerId || null,
        applicationDate: form.applicationDate,
        hasResume: form.hasResume,
        hasLetter: form.hasLetter,
      });
      onApplicationAdded();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setForm((prev) => ({ ...prev, errors: err.response.data.errors }));
        Alert.alert("Error", "Please fix the errors in the form.");
      } else {
        Alert.alert("Error", err.response?.data?.message || "Failed to add application.");
      }
      console.error(err);
    } finally {
      setForm((prev) => ({ ...prev, processing: false }));
    }
  };

  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Application</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Student</Text>
              <TouchableOpacity
                style={[styles.formSelect, form.errors.studentId && styles.inputError]}
                onPress={() => {
                  Alert.alert(
                    "Select Student",
                    "Choose a student",
                    [
                      ...students.map((student) => ({
                        text: `${student.name} (${student.studentId})`,
                        onPress: () => setForm((prev) => ({ ...prev, studentId: student.studentId })),
                      })),
                      { text: "Cancel", style: "cancel" },
                    ],
                    { cancelable: true }
                  );
                }}
              >
                <Text style={form.studentId ? styles.selectText : styles.selectPlaceholder}>
                  {form.studentId
                    ? students.find((s) => s.studentId === form.studentId)?.name || "Select Student"
                    : "Select Student"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              <InputError message={form.errors.studentId} />
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
                      { text: "None", onPress: () => setForm((prev) => ({ ...prev, partnerId: "" })) },
                      ...partners.map((partner) => ({
                        text: partner.partnerName,
                        onPress: () => setForm((prev) => ({ ...prev, partnerId: partner.id })),
                      })),
                      { text: "Cancel", style: "cancel" },
                    ],
                    { cancelable: true }
                  );
                }}
              >
                <Text style={form.partnerId ? styles.selectText : styles.selectPlaceholder}>
                  {form.partnerId
                    ? partners.find((p) => p.id === form.partnerId)?.partnerName || "Select Partner"
                    : "Select Partner"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Application Date</Text>
              <TextInput
                style={[styles.formInput, form.errors.applicationDate && styles.inputError]}
                value={form.applicationDate}
                onChangeText={(text) => setForm((prev) => ({ ...prev, applicationDate: text }))}
                placeholder="YYYY-MM-DD"
              />
              <InputError message={form.errors.applicationDate} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Documents</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setForm((prev) => ({ ...prev, hasResume: !prev.hasResume }))}
                >
                  <Ionicons
                    name={form.hasResume ? "checkbox" : "square-outline"}
                    size={24}
                    color="#4CAF50"
                  />
                  <Text style={styles.checkboxText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setForm((prev) => ({ ...prev, hasLetter: !prev.hasLetter }))}
                >
                  <Ionicons
                    name={form.hasLetter ? "checkbox" : "square-outline"}
                    size={24}
                    color="#4CAF50"
                  />
                  <Text style={styles.checkboxText}>Letter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, form.processing && styles.disabledButton]}
              onPress={submit}
              disabled={form.processing}
            >
              {form.processing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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