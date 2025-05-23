import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";

// Define types
interface Program {
  id: string;
  programId: string;
  programName: string;
  description: string;
}

interface FormErrors {
  programId?: string;
  programName?: string;
  description?: string;
}

// Toast component for notifications
const Toast = ({ message, visible, onClose }: { message: string; visible: boolean; onClose: () => void }) => {
  if (!visible) return null;
  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default function AdminPrograms() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddProgram, setIsAddProgram] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ message: "", visible: false });

  // Sample data
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "1",
      programId: "PROG-001",
      programName: "Computer Science",
      description: "A program focused on software development and algorithms.",
    },
  ]);

  const [form, setForm] = useState({
    programId: "",
    programName: "",
    description: "",
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

  const openAddModal = () => {
    setIsAddProgram(true);
    setForm({
      programId: "",
      programName: "",
      description: "",
      errors: {},
      processing: false,
    });
    setDialogVisible(true);
  };

  const openEditModal = (program: Program) => {
    setIsAddProgram(false);
    setSelectedProgramId(program.id);
    setForm({
      programId: program.programId,
      programName: program.programName,
      description: program.description,
      errors: {},
      processing: false,
    });
    setDialogVisible(true);
  };

  const closeModal = () => {
    setDialogVisible(false);
    setForm({
      programId: "",
      programName: "",
      description: "",
      errors: {},
      processing: false,
    });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!form.programId.trim()) {
      errors.programId = "Program ID is required";
      isValid = false;
    }

    if (!form.programName.trim()) {
      errors.programName = "Program Name is required";
      isValid = false;
    }

    if (!form.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    setForm((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const submit = () => {
    if (!validateForm()) {
      setToast({ message: "Please fix the errors in the form.", visible: true });
      return;
    }

    setForm((prev) => ({ ...prev, processing: true }));

    setTimeout(() => {
      if (isAddProgram) {
        const newProgram: Program = {
          id: Date.now().toString(),
          programId: form.programId,
          programName: form.programName,
          description: form.description,
        };
        setPrograms((prev) => [...prev, newProgram]);
        setToast({ message: `Program ${form.programName} added successfully!`, visible: true });
      } else if (selectedProgramId) {
        setPrograms((prev) =>
          prev.map((program) =>
            program.id === selectedProgramId
              ? {
                  ...program,
                  programId: form.programId,
                  programName: form.programName,
                  description: form.description,
                }
              : program
          )
        );
        setToast({ message: `Program ${form.programName} updated successfully!`, visible: true });
      }

      setForm((prev) => ({ ...prev, processing: false }));
      closeModal();
    }, 1000);
  };

  const handleDelete = (id: string, programName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${programName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPrograms((prev) => prev.filter((program) => program.id !== id));
            setToast({ message: `Program ${programName} deleted successfully!`, visible: true });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Filter programs based on search query
  const filteredPrograms = programs.filter(
    (program) =>
      program.programId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Input error component
  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

  // Column widths for consistent table layout
  const columnWidths = {
    programId: 120,
    programName: 180,
    description: 250,
    actions: 120,
  };

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/programs" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>OJT Programs</Text>

        {/* Search and Add Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search programs..."
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
            <Text style={styles.addButtonText}>Add New Program</Text>
          </TouchableOpacity>
        </View>

        {/* Program List with Horizontal Scroll */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: columnWidths.programId }]}>Program ID</Text>
                <Text style={[styles.headerCell, { width: columnWidths.programName }]}>Program Name</Text>
                <Text style={[styles.headerCell, { width: columnWidths.description }]}>Description</Text>
                <Text style={[styles.headerCell, { width: columnWidths.actions }]}>Action</Text>
              </View>

              {/* Table Body */}
              <View style={styles.tableBody}>
                {filteredPrograms.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No programs found</Text>
                  </View>
                ) : (
                  filteredPrograms.map((program) => (
                    <View key={program.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: columnWidths.programId }]} numberOfLines={1}>
                        {program.programId}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.programName }]} numberOfLines={1}>
                        {program.programName}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.description }]} numberOfLines={2}>
                        {program.description}
                      </Text>
                      <View style={[styles.tableCell, { width: columnWidths.actions }]}>
                        <View style={styles.actionsContainer}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openEditModal(program)}
                          >
                            <Ionicons name="create-outline" size={20} color="#2196F3" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(program.id, program.programName)}
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
              <Ionicons name="book" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{programs.length}</Text>
            <Text style={styles.statLabel}>Total Programs</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Program Modal */}
      <Modal visible={dialogVisible} transparent={true} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isAddProgram ? "Add New Program" : "Edit Program"}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Program ID</Text>
                <TextInput
                  style={[styles.formInput, form.errors.programId && styles.inputError]}
                  value={form.programId}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, programId: text }))}
                  placeholder="Enter program ID"
                />
                <InputError message={form.errors.programId} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Program Name</Text>
                <TextInput
                  style={[styles.formInput, form.errors.programName && styles.inputError]}
                  value={form.programName}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, programName: text }))}
                  placeholder="Enter program name"
                />
                <InputError message={form.errors.programName} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, form.errors.description && styles.inputError, { height: 80 }]}
                  value={form.description}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
                  placeholder="Enter program description"
                  multiline
                  numberOfLines={4}
                />
                <InputError message={form.errors.description} />
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
                {form.processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isAddProgram ? "Add Program" : "Update Program"}
                  </Text>
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

      <Navbar activeRoute="admin/programs" />
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
    backgroundColor: "#4CAF50",
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