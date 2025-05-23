import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";

// Define types
interface Profile {
  name: string;
  email: string;
  role: string;
  contactNumber: string;
  department: string;
  joinDate: string;
}

interface FormErrors {
  email?: string;
  contactNumber?: string;
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

export default function AdminProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });

  // Mock admin profile data (replace with API data)
  const [profile, setProfile] = useState<Profile>({
    name: "Admin, John D.",
    email: "admin.john@school.edu.ph",
    role: "Administrator",
    contactNumber: "093828989291",
    department: "CEIT",
    joinDate: "Jan 15, 2020",
  });

  const [editForm, setEditForm] = useState({
    email: profile.email,
    contactNumber: profile.contactNumber,
    errors: {} as FormErrors,
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

  const openEditModal = () => {
    setEditForm({
      email: profile.email,
      contactNumber: profile.contactNumber,
      errors: {},
      processing: false,
    });
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditForm({
      email: profile.email,
      contactNumber: profile.contactNumber,
      errors: {},
      processing: false,
    });
  };

  const validateEditForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(editForm.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    // Contact number validation
    const contactRegex = /^\d{10,12}$/;
    if (!editForm.contactNumber) {
      errors.contactNumber = "Contact number is required";
      isValid = false;
    } else if (!contactRegex.test(editForm.contactNumber)) {
      errors.contactNumber = "Contact number must be 10-12 digits";
      isValid = false;
    }

    setEditForm((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const submitEdit = () => {
    if (!validateEditForm()) {
      setToast({ message: "Please fix the errors in the form.", visible: true });
      return;
    }

    setEditForm((prev) => ({ ...prev, processing: true }));

    setTimeout(() => {
      setProfile((prev) => ({
        ...prev,
        email: editForm.email,
        contactNumber: editForm.contactNumber,
      }));
      setToast({ message: "Profile updated successfully!", visible: true });
      setEditForm((prev) => ({ ...prev, processing: false }));
      closeEditModal();
    }, 1000);
  };

  // Input error component
  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/profile" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={openEditModal}>
            <Ionicons name="pencil" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          {/* Profile Picture Placeholder */}
          <View style={styles.profilePicture}>
            <Ionicons name="person" size={40} color="#666" />
          </View>

          {/* Name and Email */}
          <Text style={styles.nameText}>{profile.name}</Text>
          <Text style={styles.emailText}>{profile.email}</Text>

          {/* Profile Details */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{profile.role}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{profile.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Contact #:</Text>
            <Text style={styles.value}>{profile.contactNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Join Date:</Text>
            <Text style={styles.value}>{profile.joinDate}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent={true} animationType="slide" onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={[styles.formInput, editForm.errors.email && styles.inputError]}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, email: text }))}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <InputError message={editForm.errors.email} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contact #</Text>
                <TextInput
                  style={[styles.formInput, editForm.errors.contactNumber && styles.inputError]}
                  value={editForm.contactNumber}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, contactNumber: text }))}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
                <InputError message={editForm.errors.contactNumber} />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeEditModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, editForm.processing && styles.disabledButton]}
                onPress={submitEdit}
                disabled={editForm.processing}
              >
                {editForm.processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
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

      <Navbar activeRoute="admin/profile" />
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    textAlign: "right",
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