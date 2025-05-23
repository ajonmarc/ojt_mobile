import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Image, TextInput, Modal, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";
import Toast from 'react-native-toast-message';

export default function StudentProfile() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
    const [editMode, setEditMode] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Initial student data
    const initialStudentData = {
        fullName: "Surname, Given Name, I.",
        email: "student1@ssct.edu.ph",
        studentId: "2020-00123",
        program: "CEIT",
        courseYearLevel: "BSICT-4",
        personalEmail: "xsample@gmail.com",
        contactNumber: "09382989291",
        age: "23",
        birthdate: "11/27/2001",
        civilStatus: "Single",
        address: "Surigao City",
        ojtProgram: "Software Development Intern at xAI",
        startDate: "Jan 15, 2025"
    };

    // Student profile data state
    const [studentData, setStudentData] = useState(initialStudentData);
    // Temp data for editing
    const [tempData, setTempData] = useState({...initialStudentData});

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleChangeSemester = (newSemester: string) => {
        setSemester(newSemester);
    };

    const handleEdit = () => {
        setTempData({...studentData});
        setEditModalVisible(true);
    };

    const handleSave = () => {
        // Validate fields before saving
        if (!tempData.personalEmail.includes('@') || !tempData.personalEmail.includes('.')) {
            showNotification('Please enter a valid email address');
            return;
        }
        
        if (tempData.contactNumber.length < 10) {
            showNotification('Please enter a valid contact number');
            return;
        }

        // Update the student data
        setStudentData({...tempData});
        setEditModalVisible(false);
        
        // Show success notification
        showNotification('Profile updated successfully!');
    };

    const handleCancel = () => {
        setEditModalVisible(false);
    };

    const showNotification = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // Fields that are editable
    const editableFields = [
        { key: 'personalEmail', label: 'Personal Email' },
        { key: 'contactNumber', label: 'Contact Number' },
        { key: 'address', label: 'Address' },
        { key: 'civilStatus', label: 'Civil Status' },
        { key: 'ojtProgram', label: 'OJT Program/Company' }
    ];

    return (
        <View style={styles.container}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeRoute="student/profile"
            />
            <Header
                onToggleSidebar={toggleSidebar}
                title={semester}
                onChangeSemester={handleChangeSemester}
            />
            <ScrollView style={styles.content}>
                <View style={styles.profileHeader}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <MaterialIcons name="edit" size={24} color="#006400" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileCardContent}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}></View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{studentData.fullName}</Text>
                            <Text style={styles.profileEmail}>{studentData.email}</Text>
                        </View>
                    </View>
                </View>

                {/* Student Details */}
                <View style={styles.detailContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Student ID:</Text>
                        <Text style={styles.detailValue}>{studentData.studentId}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Program:</Text>
                        <Text style={styles.detailValue}>{studentData.program}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Course/Year Level:</Text>
                        <Text style={styles.detailValue}>{studentData.courseYearLevel}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Personal Email:</Text>
                        <Text style={styles.detailValue}>{studentData.personalEmail}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Contact #:</Text>
                        <Text style={styles.detailValue}>{studentData.contactNumber}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Age:</Text>
                        <Text style={styles.detailValue}>{studentData.age}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Birthdate:</Text>
                        <Text style={styles.detailValue}>{studentData.birthdate}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Civil Status:</Text>
                        <Text style={styles.detailValue}>{studentData.civilStatus}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Address:</Text>
                        <Text style={styles.detailValue}>{studentData.address}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>OJT Program/Company:</Text>
                        <Text style={styles.detailValue}>{studentData.ojtProgram}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start Date:</Text>
                        <Text style={styles.detailValue}>{studentData.startDate}</Text>
                    </View>
                </View>
            </ScrollView>
            
            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        
                        <ScrollView style={styles.modalScrollView}>
                            {editableFields.map((field) => (
                                <View key={field.key} style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>{field.label}:</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={tempData[field.key]}
                                        onChangeText={(text) => setTempData({...tempData, [field.key]: text})}
                                        placeholder={`Enter ${field.label}`}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* Toast Notification */}
            {showToast && (
                <View style={styles.toastContainer}>
                    <View style={styles.toast}>
                        <Text style={styles.toastText}>{toastMessage}</Text>
                    </View>
                </View>
            )}
            
            <Navbar activeRoute="student/profile" />
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
        padding: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    editButton: {
        padding: 8,
    },
    profileCard: {
        backgroundColor: "#2E7D32",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    profileCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: "#E0E0E0",
    },
    detailContainer: {
        backgroundColor: "transparent",
        paddingVertical: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 0,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        flex: 1,
    },
    detailValue: {
        fontSize: 16,
        color: "#333",
        textAlign: 'right',
        flex: 1,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#2E7D32',
        textAlign: 'center',
    },
    modalScrollView: {
        maxHeight: 400,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 4,
        color: '#333',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    saveButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    // Toast notification styles
    toastContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    toast: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        minWidth: 150,
        alignItems: 'center',
    },
    toastText: {
        color: 'white',
        fontSize: 16,
    }
});