// app/admin/students.tsx
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import api from "../../axios"; // Import the API module

// Define types
interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  status: "Active" | "Inactive";
}

interface Program {
  id: string;
  programName: string;
}

interface Stats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
}

interface FormErrors {
  studentId?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  program?: string;
  status?: string;
}

export default function AdminStudents() {
  const [expandStats, setExpandStats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddUser, setIsAddUser] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
  });
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    program: "",
    status: "",
    errors: {} as FormErrors,
    processing: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/students");
        const { students, programs, stats } = response.data;
        setStudents(students);
        setPrograms(programs);
        setStats(stats);
        setError(null);
      } catch (err: any) {
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
    // Optional: Refetch data with semester parameter if supported
  };

  const openAddModal = () => {
    setIsAddUser(true);
    setForm({
      studentId: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      program: "",
      status: "",
      errors: {},
      processing: false,
    });
    setDialogVisible(true);
  };

  const openEditModal = (student: Student) => {
    setIsAddUser(false);
    setSelectedStudentId(student.id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      password: "",
      phone: student.phone,
      program: student.program,
      status: student.status,
      errors: {},
      processing: false,
    });
    setDialogVisible(true);
  };

  const closeModal = () => {
    setDialogVisible(false);
    setForm({
      studentId: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      program: "",
      status: "",
      errors: {},
      processing: false,
    });
    setSelectedStudentId(null);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!form.studentId.trim()) {
      errors.studentId = "Student ID is required";
      isValid = false;
    }

    if (!form.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (isAddUser && !form.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    }

    if (!form.program) {
      errors.program = "OJT Program is required";
      isValid = false;
    }

    if (!form.status) {
      errors.status = "Status is required";
      isValid = false;
    }

    setForm((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setForm((prev) => ({ ...prev, processing: true }));

    try {
      if (isAddUser) {
        // Add new student
        const response = await api.post("/admin/students", {
          studentId: form.studentId,
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          program: form.program,
          status: form.status,
        });
        setStudents((prev) => [...prev, response.data.student]);
        Alert.alert("Success", response.data.message);
      } else if (selectedStudentId) {
        // Update existing student
        const response = await api.put(`/admin/students/${selectedStudentId}`, {
          studentId: form.studentId,
          name: form.name,
          email: form.email,
          password: form.password || undefined, // Send undefined if password is empty
          phone: form.phone,
          program: form.program,
          status: form.status,
        });
        setStudents((prev) =>
          prev.map((student) =>
            student.id === selectedStudentId ? response.data.student : student
          )
        );
        Alert.alert("Success", response.data.message);
      }
      closeModal();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setForm((prev) => ({ ...prev, errors: err.response.data.errors }));
      } else {
        Alert.alert("Error", "An error occurred. Please try again.");
        console.error(err);
      }
    } finally {
      setForm((prev) => ({ ...prev, processing: false }));
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this student?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/admin/students/${id}`);
              setStudents((prev) => prev.filter((student) => student.id !== id));
              Alert.alert("Success", "Student deleted successfully");
            } catch (err) {
              Alert.alert("Error", "Failed to delete student. Please try again.");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Input error component
  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

  // Column widths for consistent table layout
  const columnWidths = {
    studentId: 120,
    name: 150,
    email: 200,
    phone: 120,
    program: 180,
    status: 100,
    actions: 120,
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
        activeRoute="admin/students"
      />
      <Header
        onToggleSidebar={toggleSidebar}
        title={semester}
        onChangeSemester={handleChangeSemester}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Students Management</Text>

        {/* Search and Add Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add New Student</Text>
          </TouchableOpacity>
        </View>

        {/* Student List with Horizontal Scroll */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: columnWidths.studentId }]}>Student ID</Text>
                <Text style={[styles.headerCell, { width: columnWidths.name }]}>Name</Text>
                <Text style={[styles.headerCell, { width: columnWidths.email }]}>Email</Text>
                <Text style={[styles.headerCell, { width: columnWidths.phone }]}>Phone</Text>
                <Text style={[styles.headerCell, { width: columnWidths.program }]}>Program</Text>
                <Text style={[styles.headerCell, { width: columnWidths.status }]}>Status</Text>
                <Text style={[styles.headerCell, { width: columnWidths.actions }]}>Actions</Text>
              </View>

              {/* Table Body */}
              <View style={styles.tableBody}>
                {filteredStudents.map((student) => (
                  <View key={student.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: columnWidths.studentId }]} numberOfLines={1}>
                      {student.studentId}
                    </Text>
                    <Text style={[styles.tableCell, { width: columnWidths.name }]} numberOfLines={1}>
                      {student.name}
                    </Text>
                    <Text style={[styles.tableCell, { width: columnWidths.email }]} numberOfLines={1}>
                      {student.email}
                    </Text>
                    <Text style={[styles.tableCell, { width: columnWidths.phone }]} numberOfLines={1}>
                      {student.phone}
                    </Text>
                    <Text style={[styles.tableCell, { width: columnWidths.program }]} numberOfLines={1}>
                      {student.program}
                    </Text>
                    <View style={[styles.tableCell, { width: columnWidths.status }]}>
                      <Text
                        style={[
                          styles.statusBadge,
                          student.status === "Active" ? styles.activeBadge : styles.inactiveBadge,
                        ]}
                      >
                        {student.status}
                      </Text>
                    </View>
                    <View style={[styles.tableCell, { width: columnWidths.actions }]}>
                      <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(student)}>
                          <Ionicons name="create-outline" size={20} color="#2196F3" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(student.id)}>
                          <Ionicons name="trash-outline" size={20} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                {filteredStudents.length === 0 && (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No students found</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{stats.activeStudents}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{stats.inactiveStudents}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Student Modal */}
      <Modal visible={dialogVisible} transparent={true} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isAddUser ? "Add New Student" : "Edit Student"}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Student ID</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.studentId}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, studentId: text }))}
                  placeholder="Enter student ID"
                />
                <InputError message={form.errors.studentId} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.name}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                />
                <InputError message={form.errors.name} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.email}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
                <InputError message={form.errors.email} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {isAddUser ? "Password" : "New Password (leave blank to keep current)"}
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={form.password}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                  placeholder={isAddUser ? "Enter password" : "Enter new password"}
                  secureTextEntry
                />
                <InputError message={form.errors.password} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.phone}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                <InputError message={form.errors.phone} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>OJT Program</Text>
                <TouchableOpacity
                  style={styles.formSelect}
                  onPress={() => {
                    Alert.alert(
                      "Select Program",
                      "Choose a program",
                      programs.map((program) => ({
                        text: program.programName,
                        onPress: () => setForm((prev) => ({ ...prev, program: program.programName })),
                      }))
                    );
                  }}
                >
                  <Text style={form.program ? styles.selectText : styles.selectPlaceholder}>
                    {form.program || "Select Program"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                <InputError message={form.errors.program} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <TouchableOpacity
                  style={styles.formSelect}
                  onPress={() => {
                    Alert.alert(
                      "Select Status",
                      "Choose a status",
                      [
                        { text: "Active", onPress: () => setForm((prev) => ({ ...prev, status: "Active" })) },
                        { text: "Inactive", onPress: () => setForm((prev) => ({ ...prev, status: "Inactive" })) },
                      ]
                    );
                  }}
                >
                  <Text style={form.status ? styles.selectText : styles.selectPlaceholder}>
                    {form.status || "Select Status"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                <InputError message={form.errors.status} />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, form.processing && styles.disabledButton]}
                onPress={submit}
                disabled={form.processing}
              >
                <Text style={styles.submitButtonText}>{isAddUser ? "Add Student" : "Update Student"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Navbar activeRoute="admin/students" />
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
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "500",
  },
  activeBadge: {
    backgroundColor: "#E8F5E9",
    color: "#4CAF50",
  },
  inactiveBadge: {
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
    width: "31%",
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
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
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
  },
  submitButtonText: {
    color: "white",
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
});