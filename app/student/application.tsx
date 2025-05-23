import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";

export default function StudentApplication() {
    const [expandStats, setExpandStats] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    
    // Application data with otherDocuments as array
    const [application, setApplication] = useState({
        status: "Approved",
        documents: {
            resume: "Resume.pdf",
            applicationLetter: "Application Letter.pdf",
            otherDocuments: ["Resume.pdf"] // Changed to array to support multiple files
        },
        preferredCompany: "TTCompany",
        schedule: {
            startDate: "2025-01-01T00:00:00.000Z",
            endDate: "2025-01-31T00:00:00.000Z"
        }
    });
    
    // Form data for editing
    const [formData, setFormData] = useState({
        preferredCompany: "TTCompany",
        startDate: "",
        endDate: ""
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleChangeSemester = (newSemester) => {
        setSemester(newSemester);
        // Optional: Add logic to update data based on new semester
    };
    
    const handleOpenEditModal = () => {
        setFormData({
            preferredCompany: application.preferredCompany,
            startDate: new Date(application.schedule.startDate).toISOString().split('T')[0],
            endDate: new Date(application.schedule.endDate).toISOString().split('T')[0]
        });
        setEditModalVisible(true);
    };
    
    const handleSubmit = () => {
        // Update application data with form data
        setApplication({
            ...application,
            preferredCompany: formData.preferredCompany,
            schedule: {
                startDate: formData.startDate + "T00:00:00.000Z",
                endDate: formData.endDate + "T00:00:00.000Z"
            }
        });
        setEditModalVisible(false);
        // Show success message
        Alert.alert("Success", "Application updated successfully");
    };
    
    const handleCancel = () => {
        setEditModalVisible(false);
    };
    
    const handleOpenDeleteModal = () => {
        setDeleteModalVisible(true);
    };
    
    const handleDeleteApplication = () => {
        // Implement delete functionality
        Alert.alert("Success", "Application deleted successfully");
        setDeleteModalVisible(false);
        // Reset application or navigate away
    };
    
    // Function to add a new document
    const handleAddOtherDocument = () => {
        // In a real app, you'd open file picker here
        // For demo purposes, we'll just add a new file with a dynamic name
        const newDocName = `Other Document ${application.documents.otherDocuments.length + 1}.pdf`;
        
        setApplication({
            ...application,
            documents: {
                ...application.documents,
                otherDocuments: [...application.documents.otherDocuments, newDocName]
            }
        });
        
        // Show success message
        Alert.alert("Success", `${newDocName} added successfully`);
    };
    
    // Function to remove a document at specified index
    const handleRemoveOtherDocument = (indexToRemove) => {
        setApplication({
            ...application,
            documents: {
                ...application.documents,
                otherDocuments: application.documents.otherDocuments.filter((_, index) => index !== indexToRemove)
            }
        });
    };

    return (
        <View style={styles.container}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeRoute="student/application"
            />
            <Header
                onToggleSidebar={toggleSidebar}
                title={semester}
                onChangeSemester={handleChangeSemester}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.pageHeader}>
                    <Text style={styles.headerTitle}>OJT Application</Text>
                    <View style={styles.headerLine} />
                </View>
                
                <View style={styles.section}>
                    <View style={styles.statusContainer}>
                        <View style={styles.statusBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.statusIcon} />
                            <Text style={styles.statusText}>{application.status}</Text>
                        </View>
                        
                        <View style={styles.actionButtons}>
                            <TouchableOpacity 
                                style={styles.editButton} 
                                onPress={handleOpenEditModal}
                            >
                                <Ionicons name="create-outline" size={16} color="#555" style={styles.buttonIcon} />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.deleteButton} 
                                onPress={handleOpenDeleteModal}
                            >
                                <Ionicons name="trash-outline" size={16} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Documents</Text>
                    </View>
                    
                    <View style={styles.documentGrid}>
                        <View style={styles.documentCard}>
                            <View style={styles.documentIconContainer}>
                                <Ionicons name="document-text-outline" size={32} color="#4CAF50" />
                            </View>
                            <Text style={styles.documentTitle}>Resume</Text>
                            <TouchableOpacity style={styles.viewButton}>
                                <Ionicons name="eye-outline" size={16} color="#4CAF50" style={{marginRight: 4}} />
                                <Text style={styles.viewButtonText}>View Resume</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.documentCard}>
                            <View style={styles.documentIconContainer}>
                                <Ionicons name="mail-outline" size={32} color="#4CAF50" />
                            </View>
                            <Text style={styles.documentTitle}>Application Letter</Text>
                            <TouchableOpacity style={styles.viewButton}>
                                <Ionicons name="eye-outline" size={16} color="#4CAF50" style={{marginRight: 4}} />
                                <Text style={styles.viewButtonText}>View Letter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.sectionHeader}>
                        <Ionicons name="calendar" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Schedule Details</Text>
                    </View>
                    
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Ionicons name="business-outline" size={20} color="#4CAF50" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Preferred Company</Text>
                                <Text style={styles.detailValue}>{application.preferredCompany}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.detailDivider} />
                        
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Schedule</Text>
                                <Text style={styles.detailValue}>
                                    {new Date(application.schedule.startDate).toLocaleDateString()} to {' '}
                                    {new Date(application.schedule.endDate).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Edit Application Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={editModalVisible}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Application</Text>
                                <TouchableOpacity onPress={handleCancel}>
                                    <Ionicons name="close" size={24} color="#555" />
                                </TouchableOpacity>
                            </View>
                            
                            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                                <View style={styles.modalSectionHeader}>
                                    <Ionicons name="document-text" size={18} color="#4CAF50" />
                                    <Text style={styles.modalSectionTitle}>Documents</Text>
                                </View>
                                
                                <Text style={styles.label}>Resume</Text>
                                <View style={styles.uploadRow}>
                                    <TouchableOpacity style={styles.uploadButton}>
                                        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                                        <Text style={styles.uploadButtonText}>UPLOAD</Text>
                                    </TouchableOpacity>
                                    <View style={styles.fileNameContainer}>
                                        <Text style={styles.fileName}>{application.documents.resume}</Text>
                                        <TouchableOpacity style={styles.removeFileButton}>
                                            <Ionicons name="close-circle" size={20} color="#f44336" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <Text style={styles.label}>Application Letter</Text>
                                <View style={styles.uploadRow}>
                                    <TouchableOpacity style={styles.uploadButton}>
                                        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                                        <Text style={styles.uploadButtonText}>UPLOAD</Text>
                                    </TouchableOpacity>
                                    <View style={styles.fileNameContainer}>
                                        <Text style={styles.fileName}>{application.documents.applicationLetter}</Text>
                                        <TouchableOpacity style={styles.removeFileButton}>
                                            <Ionicons name="close-circle" size={20} color="#f44336" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                
                                <View style={styles.otherDocumentsSection}>
                                    <Text style={styles.label}>Other Documents</Text>
                                    
                                    {/* Render each other document with its own remove button */}
                                    {application.documents.otherDocuments.map((doc, index) => (
                                        <View key={index} style={styles.uploadRow}>
                                            {index === 0 && (
                                                <TouchableOpacity style={styles.uploadButton}>
                                                    <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                                                    <Text style={styles.uploadButtonText}>UPLOAD</Text>
                                                </TouchableOpacity>
                                            )}
                                            {index !== 0 && (
                                                <View style={styles.spacer} />
                                            )}
                                            <View style={styles.fileNameContainer}>
                                                <Text style={styles.fileName}>{doc}</Text>
                                                <TouchableOpacity 
                                                    style={styles.removeFileButton}
                                                    onPress={() => handleRemoveOtherDocument(index)}
                                                >
                                                    <Ionicons name="close-circle" size={20} color="#f44336" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                    
                                    {/* Add New Document Button */}
                                    <TouchableOpacity 
                                        style={styles.addDocumentButton}
                                        onPress={handleAddOtherDocument}
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color="#4CAF50" />
                                        <Text style={styles.addDocumentText}>Add Another Document</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.modalSectionHeader}>
                                    <Ionicons name="calendar" size={18} color="#4CAF50" />
                                    <Text style={styles.modalSectionTitle}>Preferred Schedule</Text>
                                </View>
                                
                                <Text style={styles.label}>Preferred Company (Optional)</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="business-outline" size={20} color="#757575" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.preferredCompany}
                                        placeholder="Enter your preferred company name"
                                        onChangeText={(text) => setFormData({...formData, preferredCompany: text})}
                                    />
                                </View>
                                
                                <Text style={styles.label}>Preferred Start Date</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={20} color="#757575" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.startDate}
                                        placeholder="yyyy-mm-dd"
                                        onChangeText={(text) => setFormData({...formData, startDate: text})}
                                    />
                                </View>
                                
                                <Text style={styles.label}>Preferred End Date</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={20} color="#757575" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.endDate}
                                        placeholder="yyyy-mm-dd"
                                        onChangeText={(text) => setFormData({...formData, endDate: text})}
                                    />
                                </View>
                            </ScrollView>
                            
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                    <Text style={styles.buttonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                
                {/* Delete Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={deleteModalVisible}
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.deleteModalContainer}>
                            <View style={styles.deleteIconContainer}>
                                <Ionicons name="warning" size={40} color="#F44336" />
                            </View>
                            
                            <Text style={styles.deleteModalTitle}>Delete Application</Text>
                            <Text style={styles.deleteModalText}>
                                Are you sure you want to delete this application? This action cannot be undone.
                            </Text>
                            
                            <View style={styles.deleteModalButtons}>
                                <TouchableOpacity 
                                    style={styles.cancelDeleteButton}
                                    onPress={() => setDeleteModalVisible(false)}
                                >
                                    <Text style={styles.cancelDeleteText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.confirmDeleteButton}
                                    onPress={handleDeleteApplication}
                                >
                                    <Ionicons name="trash-outline" size={16} color="#fff" style={{marginRight: 4}} />
                                    <Text style={styles.confirmDeleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            <Navbar activeRoute="student/application" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5", // Lighter background for better contrast
    },
    content: {
        flex: 1,
        padding: 20,
    },
    pageHeader: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#2E7D32", // Darker green for better readability
        marginBottom: 8,
    },
    headerLine: {
        height: 3,
        width: 60,
        backgroundColor: "#4CAF50",
        borderRadius: 2,
    },
    section: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 8,
        color: "#333",
    },
    // Status and action buttons
    statusContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
    },
    statusBadge: {
        backgroundColor: "#E8F5E9",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    statusIcon: {
        marginRight: 4,
    },
    statusText: {
        color: "#2E7D32",
        fontWeight: "600",
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    editButton: {
        backgroundColor: "#F5F5F5",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 10,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    buttonIcon: {
        marginRight: 6,
    },
    editButtonText: {
        color: "#555",
        fontSize: 14,
        fontWeight: "500",
    },
    deleteButton: {
        backgroundColor: "#F44336",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    deleteButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
    // Document styles
    documentGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
        flexWrap: "wrap",
    },
    documentCard: {
        backgroundColor: "#F9FFF9",
        borderRadius: 10,
        padding: 16,
        width: "48%",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E8F5E9",
    },
    documentIconContainer: {
        backgroundColor: "#E8F5E9",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    documentTitle: {
        marginVertical: 8,
        fontWeight: "600",
        fontSize: 15,
        color: "#333",
    },
    viewButton: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    viewButtonText: {
        color: "#4CAF50",
        fontWeight: "500",
    },
    // Detail styles
    detailsCard: {
        backgroundColor: "#F9FFF9",
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E8F5E9",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: "#757575",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    detailDivider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 12,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '100%',
        maxHeight: '90%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#333",
    },
    modalContent: {
        padding: 20,
        maxHeight: 500,
    },
    modalSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 12,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: "#333",
    },
    // Form styles for modal
    label: {
        fontSize: 14,
        marginBottom: 8,
        marginTop: 12,
        color: "#555",
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: "#F9F9F9",
    },
    inputIcon: {
        marginHorizontal: 12,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 15,
    },
    uploadRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        flexWrap: "wrap",
    },
    uploadButton: {
        backgroundColor: "#4CAF50",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    uploadButtonText: {
        color: "white",
        marginLeft: 6,
        fontWeight: "600",
    },
    fileNameContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
        marginBottom: 8,
        backgroundColor: "#F0F0F0",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    fileName: {
        marginRight: 8,
        color: "#555",
    },
    removeFileButton: {
        padding: 2,
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },
    cancelButton: {
        backgroundColor: "#9E9E9E",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 15,
    },
    // Delete modal styles
    deleteModalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    deleteIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#FFEBEE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#F44336',
    },
    deleteModalText: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 22,
        textAlign: "center",
        color: "#555",
    },
    deleteModalButtons: {
        flexDirection: 'row',
        width: "100%",
        justifyContent: 'center',
    },
    cancelDeleteButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginRight: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minWidth: 120,
        alignItems: "center",
    },
    cancelDeleteText: {
        color: '#757575',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmDeleteButton: {
        backgroundColor: '#F44336',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 120,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    confirmDeleteText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    // New styles for other documents section
    otherDocumentsSection: {
        marginBottom: 20,
    },
    spacer: {
        width: 110, // Approximately the width of the upload button
    },
    addDocumentButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        marginTop: 4,
    },
    addDocumentText: {
        color: "#4CAF50",
        fontWeight: "500",
        marginLeft: 6,
    },
});