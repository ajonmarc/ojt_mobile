import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import Sidebar from "@/components/studentSidebar";
import Navbar from "@/components/studentNavbar";
import Header from "@/components/Header";
import { Link } from "expo-router";

export default function StudentProgress() {
    const [expandStats, setExpandStats] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [semester, setSemester] = useState("1st Semester, A.Y. 2023");
    
    // Mock data - in a real app, this would come from an API
    const [userData, setUserData] = useState({
        name: "John Doe",
        studentId: "2020-12345"
    });
    
    const [application, setApplication] = useState({
        status: "Approved", // Possible values: "Approved", "Rejected", "Pending"
        startDate: "2023-06-01",
        endDate: "2023-09-01",
        completedHours: 120,
        requiredHours: 300,
        remarks: "Application needs more details about previous experience."
    });
    
    const [partnerInfo, setPartnerInfo] = useState({
        name: "Tech Solutions Inc.",
        address: "123 Innovation Street, Tech City"
    });
    
    const [progress, setProgress] = useState({
        recentEntries: [
            {
                id: 1,
                date: "2023-07-15",
                hours: 8,
                tasks: "Assisted in database migration and setup of development environment.",
                remarks: "Good progress on learning the tech stack."
            },
            {
                id: 2,
                date: "2023-07-14",
                hours: 7,
                tasks: "Attended team meeting and worked on UI design for client portal.",
                remarks: ""
            },
            {
                id: 3,
                date: "2023-07-13",
                hours: 6,
                tasks: "Debugged authentication issues and implemented password reset functionality.",
                remarks: "Need more guidance on security best practices."
            }
        ]
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    const handleChangeSemester = (newSemester) => {
        setSemester(newSemester);
        // Optional: Add logic to update data based on new semester
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const getStatusClass = (status) => {
        switch (status) {
            case "Approved": return styles.statusApproved;
            case "Rejected": return styles.statusRejected;
            case "Pending": return styles.statusPending;
            default: return {};
        }
    };
    
    const progressPercentage = Math.min(
        Math.round((application.completedHours / application.requiredHours) * 100),
        100
    );

    return (
        <View style={styles.container}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeRoute="student/progress"
            />
            <Header
                onToggleSidebar={toggleSidebar}
                title={semester}
                onChangeSemester={handleChangeSemester}
            />
            <ScrollView style={styles.content}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>Welcome, {userData.name}!</Text>
                    <Text style={styles.studentId}>Student ID: {userData.studentId}</Text>
                </View>

                {application ? (
                    <View style={styles.statusCard}>
                        <Text style={styles.cardTitle}>OJT Status</Text>
                        <View style={styles.statusContent}>
                            <View style={styles.statusHeader}>
                                <Text style={[styles.statusBadge, getStatusClass(application.status)]}>
                                    {application.status}
                                </Text>
                            </View>

                            {application.status === "Approved" && (
                                <View style={styles.approvedDetails}>
                                    {/* Company Info */}
                                    {partnerInfo && (
                                        <View style={styles.infoSection}>
                                            <Text style={styles.sectionTitle}>Company Information</Text>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoText}>
                                                    <Text style={styles.infoLabel}>Company:</Text> {partnerInfo.name}
                                                </Text>
                                                <Text style={styles.infoText}>
                                                    <Text style={styles.infoLabel}>Address:</Text> {partnerInfo.address}
                                                </Text>
                                                <Text style={styles.infoText}>
                                                    <Text style={styles.infoLabel}>Start Date:</Text> {formatDate(application.startDate)}
                                                </Text>
                                                <Text style={styles.infoText}>
                                                    <Text style={styles.infoLabel}>End Date:</Text> {formatDate(application.endDate)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Progress Overview */}
                                    <View style={styles.infoSection}>
                                        <Text style={styles.sectionTitle}>Progress Overview</Text>
                                        <View style={styles.progressStats}>
                                            <View style={styles.statItem}>
                                                <Text style={styles.statLabel}>Hours Completed</Text>
                                                <Text style={styles.statValue}>
                                                    {application.completedHours || 0} / {application.requiredHours || 0}
                                                </Text>
                                            </View>
                                            <View style={styles.progressBarContainer}>
                                                <View style={styles.progressBar}>
                                                    <View
                                                        style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                                                    ></View>
                                                </View>
                                                <Text style={styles.percentage}>{progressPercentage}%</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Recent Progress Entries */}
                                    {progress?.recentEntries?.length > 0 && (
                                        <View style={styles.infoSection}>
                                            <Text style={styles.sectionTitle}>Recent Progress</Text>
                                            <View style={styles.entriesList}>
                                                {progress.recentEntries.map((entry) => (
                                                    <View key={entry.id} style={styles.entryItem}>
                                                        <View style={styles.entryHeader}>
                                                            <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                                                            <Text style={styles.entryHours}>{entry.hours} hours</Text>
                                                        </View>
                                                        <View style={styles.entryTasks}>
                                                            <Text style={styles.entryLabel}>Tasks Completed:</Text>
                                                            <Text style={styles.entryText}>{entry.tasks}</Text>
                                                        </View>
                                                        {entry.remarks && (
                                                            <View style={styles.entryRemarks}>
                                                                <Text style={styles.entryLabel}>Remarks:</Text>
                                                                <Text style={styles.entryText}>{entry.remarks}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {application.status === "Rejected" && (
                                <View style={styles.rejectedInfo}>
                                    <Text style={styles.rejectionMessage}>
                                        Your application needs revision. Please check the remarks and reapply.
                                    </Text>
                                    {application.remarks && (
                                        <View style={styles.remarks}>
                                            <Text style={styles.remarksTitle}>Remarks:</Text>
                                            <Text style={styles.remarksText}>{application.remarks}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        style={styles.reapplyBtn}
                                        onPress={() => {
                                            // Navigate to application page
                                            // In a real app, you'd use router.push or similar
                                        }}
                                    >
                                        <Text style={styles.btnText}>Reapply</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {application.status === "Pending" && (
                                <View style={styles.pendingInfo}>
                                    <Text style={styles.pendingText}>
                                        Your application is under review. We will notify you once it's processed.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.noApplicationCard}>
                        <View style={styles.noApplication}>
                            <Text style={styles.noApplicationText}>
                                You haven't submitted your OJT application yet.
                            </Text>
                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => {
                                    // Navigate to application page
                                    // In a real app, you'd use router.push or similar
                                }}
                            >
                                <Text style={styles.btnText}>Apply Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
            <Navbar activeRoute="student/progress" />
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
    welcomeSection: {
        marginBottom: 20,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    studentId: {
        fontSize: 14,
        color: "#666",
    },
    statusCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    noApplicationCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    statusContent: {
        padding: 8,
    },
    statusHeader: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 16,
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        fontWeight: "bold",
        overflow: "hidden",
    },
    statusApproved: {
        backgroundColor: "#D4EDDA",
        color: "#155724",
    },
    statusRejected: {
        backgroundColor: "#F8D7DA",
        color: "#721C24",
    },
    statusPending: {
        backgroundColor: "#FFF3CD",
        color: "#856404",
    },
    approvedDetails: {
        marginTop: 8,
    },
    infoSection: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        color: "#2E7D32",
    },
    infoContent: {
        marginLeft: 4,
    },
    infoText: {
        marginBottom: 6,
        fontSize: 14,
    },
    infoLabel: {
        fontWeight: "600",
    },
    progressStats: {
        marginTop: 8,
    },
    statItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 14,
        color: "#555",
    },
    statValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    progressBarContainer: {
        marginVertical: 8,
    },
    progressBar: {
        height: 12,
        backgroundColor: "#e0e0e0",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 4,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#4CAF50",
    },
    percentage: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
    },
    entriesList: {
        marginTop: 8,
    },
    entryItem: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    entryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    entryDate: {
        fontWeight: "500",
        color: "#555",
    },
    entryHours: {
        fontWeight: "600",
        color: "#2E7D32",
    },
    entryTasks: {
        marginBottom: 8,
    },
    entryLabel: {
        fontWeight: "500",
        marginBottom: 2,
    },
    entryText: {
        fontSize: 13,
        color: "#444",
    },
    entryRemarks: {
        marginTop: 4,
    },
    rejectedInfo: {
        padding: 12,
    },
    rejectionMessage: {
        color: "#721c24",
        marginBottom: 16,
        textAlign: "center",
    },
    remarks: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    remarksTitle: {
        fontWeight: "600",
        marginBottom: 4,
    },
    remarksText: {
        fontSize: 14,
        color: "#444",
    },
    reapplyBtn: {
        backgroundColor: "#dc3545",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    pendingInfo: {
        padding: 16,
        alignItems: "center",
    },
    pendingText: {
        textAlign: "center",
        color: "#856404",
    },
    noApplication: {
        alignItems: "center",
        padding: 16,
    },
    noApplicationText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: "center",
    },
    applyBtn: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    btnText: {
        color: "white",
        fontWeight: "600",
    },
});