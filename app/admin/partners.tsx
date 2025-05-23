import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";

// Define types
interface Partner {
  id: string;
  partnerName: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  status: "Active" | "Inactive";
}

interface FormErrors {
  partnerName?: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  status?: string;
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

export default function AdminPartners() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddPartner, setIsAddPartner] = useState(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ message: "", visible: false });

  // Sample data
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: "1",
      partnerName: "Tech Corp",
      address: "123 Tech Street, City",
      phone: "123-456-7890",
      email: "contact@techcorp.com",
      contactPerson: "Jane Smith",
      status: "Active",
    },
  ]);

  const [form, setForm] = useState({
    partnerName: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: "",
    status: "",
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
    setIsAddPartner(true);
    setForm({
      partnerName: "",
      address: "",
      phone: "",
      email: "",
      contactPerson: "",
      status: "",
      errors: {},
      processing: false,
    });
    setDialogVisible(true);
  };

  const openEditModal = (partner: Partner) => {
    setIsAddPartner(false);
    setSelectedPartnerId(partner.id);
    setForm({
      partnerName: partner.partnerName,
      address: partner.address,
      phone: partner.phone,
      email: partner.email,
      contactPerson: partner.contactPerson,
      status: partner.status,
      errors: {},
      processing: false,
    });
    setDialogVisible(true);
  };

  const closeModal = () => {
    setDialogVisible(false);
    setForm({
      partnerName: "",
      address: "",
      phone: "",
      email: "",
      contactPerson: "",
      status: "",
      errors: {},
      processing: false,
    });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!form.partnerName.trim()) {
      errors.partnerName = "Partner Name is required";
      isValid = false;
    }

    if (!form.address.trim()) {
      errors.address = "Address is required";
      isValid = false;
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!form.contactPerson.trim()) {
      errors.contactPerson = "Contact Person is required";
      isValid = false;
    }

    if (!form.status) {
      errors.status = "Status is required";
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
      if (isAddPartner) {
        const newPartner: Partner = {
          id: Date.now().toString(),
          partnerName: form.partnerName,
          address: form.address,
          phone: form.phone,
          email: form.email,
          contactPerson: form.contactPerson,
          status: form.status as "Active" | "Inactive",
        };
        setPartners((prev) => [...prev, newPartner]);
        setToast({ message: `Partner ${form.partnerName} added successfully!`, visible: true });
      } else if (selectedPartnerId) {
        setPartners((prev) =>
          prev.map((partner) =>
            partner.id === selectedPartnerId
              ? {
                  ...partner,
                  partnerName: form.partnerName,
                  address: form.address,
                  phone: form.phone,
                  email: form.email,
                  contactPerson: form.contactPerson,
                  status: form.status as "Active" | "Inactive",
                }
              : partner
          )
        );
        setToast({ message: `Partner ${form.partnerName} updated successfully!`, visible: true });
      }

      setForm((prev) => ({ ...prev, processing: false }));
      closeModal();
    }, 1000);
  };

  const handleDelete = (id: string, partnerName: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${partnerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPartners((prev) => prev.filter((partner) => partner.id !== id));
            setToast({ message: `Partner ${partnerName} deleted successfully!`, visible: true });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Filter partners based on search query
  const filteredPartners = partners.filter(
    (partner) =>
      partner.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Input error component
  const InputError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <Text style={styles.errorText}>{message}</Text>;
  };

  // Column widths for consistent table layout
  const columnWidths = {
    partnerName: 150,
    address: 200,
    phone: 120,
    email: 180,
    contactPerson: 150,
    status: 100,
    actions: 120,
  };

  const activePartners = partners.filter((partner) => partner.status === "Active").length;
  const inactivePartners = partners.filter((partner) => partner.status === "Inactive").length;

  return (
    <View style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/partners" />
      <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
      <ScrollView style={styles.content}>
        <Text style={styles.headerTitle}>Partners</Text>

        {/* Search and Add Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search partners..."
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
            <Text style={styles.addButtonText}>Add New Partner</Text>
          </TouchableOpacity>
        </View>

        {/* Partner List with Horizontal Scroll */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: columnWidths.partnerName }]}>Partner Name</Text>
                <Text style={[styles.headerCell, { width: columnWidths.address }]}>Address</Text>
                <Text style={[styles.headerCell, { width: columnWidths.phone }]}>Phone</Text>
                <Text style={[styles.headerCell, { width: columnWidths.email }]}>Email</Text>
                <Text style={[styles.headerCell, { width: columnWidths.contactPerson }]}>Contact Person</Text>
                <Text style={[styles.headerCell, { width: columnWidths.status }]}>Status</Text>
                <Text style={[styles.headerCell, { width: columnWidths.actions }]}>Actions</Text>
              </View>

              {/* Table Body */}
              <View style={styles.tableBody}>
                {filteredPartners.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No partners found</Text>
                  </View>
                ) : (
                  filteredPartners.map((partner) => (
                    <View key={partner.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: columnWidths.partnerName }]} numberOfLines={1}>
                        {partner.partnerName}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.address }]} numberOfLines={2}>
                        {partner.address}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.phone }]} numberOfLines={1}>
                        {partner.phone}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.email }]} numberOfLines={1}>
                        {partner.email}
                      </Text>
                      <Text style={[styles.tableCell, { width: columnWidths.contactPerson }]} numberOfLines={1}>
                        {partner.contactPerson}
                      </Text>
                      <View style={[styles.tableCell, { width: columnWidths.status }]}>
                        <Text
                          style={[
                            styles.statusBadge,
                            partner.status === "Active" ? styles.activeBadge : styles.inactiveBadge,
                          ]}
                        >
                          {partner.status}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, { width: columnWidths.actions }]}>
                        <View style={styles.actionsContainer}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openEditModal(partner)}
                          >
                            <Ionicons name="create-outline" size={20} color="#2196F3" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleDelete(partner.id, partner.partnerName)}
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
              <Ionicons name="business" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{partners.length}</Text>
            <Text style={styles.statLabel}>Total Partners</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="business" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{activePartners}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="business" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{inactivePartners}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Partner Modal */}
      <Modal visible={dialogVisible} transparent={true} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isAddPartner ? "Add New Partner" : "Edit Partner"}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Partner Name</Text>
                <TextInput
                  style={[styles.formInput, form.errors.partnerName && styles.inputError]}
                  value={form.partnerName}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, partnerName: text }))}
                  placeholder="Enter partner name"
                />
                <InputError message={form.errors.partnerName} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address</Text>
                <TextInput
                  style={[styles.formInput, form.errors.address && styles.inputError, { height: 80 }]}
                  value={form.address}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, address: text }))}
                  placeholder="Enter address"
                  multiline
                  numberOfLines={4}
                />
                <InputError message={form.errors.address} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={[styles.formInput, form.errors.phone && styles.inputError]}
                  value={form.phone}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                <InputError message={form.errors.phone} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={[styles.formInput, form.errors.email && styles.inputError]}
                  value={form.email}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
                <InputError message={form.errors.email} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Contact Person</Text>
                <TextInput
                  style={[styles.formInput, form.errors.contactPerson && styles.inputError]}
                  value={form.contactPerson}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, contactPerson: text }))}
                  placeholder="Enter contact person"
                />
                <InputError message={form.errors.contactPerson} />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <TouchableOpacity
                  style={[styles.formSelect, form.errors.status && styles.inputError]}
                  onPress={() => {
                    Alert.alert(
                      "Select Status",
                      "Choose a status",
                      [
                        {
                          text: "Active",
                          onPress: () => setForm((prev) => ({ ...prev, status: "Active" })),
                        },
                        {
                          text: "Inactive",
                          onPress: () => setForm((prev) => ({ ...prev, status: "Inactive" })),
                        },
                        { text: "Cancel", style: "cancel" },
                      ],
                      { cancelable: true }
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
                {form.processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isAddPartner ? "Add Partner" : "Update Partner"}
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

      <Navbar activeRoute="admin/partners" />
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