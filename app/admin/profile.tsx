import { View, ScrollView, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import api from "../../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const [user, setUser] = useState({ name: "", email: "" });
    const [form, setForm] = useState({ name: "", email: "", current_password: "", password: "", password_confirmation: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
      const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

      const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile().then(() => setRefreshing(false));
      }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await api.get("/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const { name, email } = response.data.auth.user;
            setUser({ name, email });
            setForm({ ...form, name, email });
        } catch (error) {
            Alert.alert("Error", "Failed to fetch profile data");
        }
    };

    const updateProfile = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await api.patch(
                "/update/profile",
                { name: form.name, email: form.email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus("Profile updated successfully");
            setErrors({});
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setStatus("");
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await api.put(
                "/update/password",
                {
                    current_password: form.current_password,
                    password: form.password,
                    password_confirmation: form.password_confirmation,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus("Password updated successfully");
            setErrors({});
            setForm({ ...form, current_password: "", password: "", password_confirmation: "" });
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setStatus("");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = () => {
        setShowDeleteModal(true);
    };

    const deleteAccount = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await api.delete("/delete/profile", {
                data: { password: form.password },
                headers: { Authorization: `Bearer ${token}` },
            });
            await AsyncStorage.removeItem("token");
            Alert.alert("Success", "Account deleted successfully");
            // Navigate to login screen or home
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            setStatus("");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleChangeSemester = (newSemester: string) => {
        setSemester(newSemester);
    };

    return (
        <View style={styles.container}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeRoute="admin/profile" />
            <Header onToggleSidebar={toggleSidebar} title={semester} onChangeSemester={handleChangeSemester} />
            <ScrollView style={styles.content}
             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Profile Information */}
                <View style={styles.section}>
                    <Text style={styles.header}>Profile Information</Text>
                    <Text style={styles.subHeader}>Update your account's profile information and email address.</Text>
                    <TextInput
                        style={styles.input}
                        value={form.name}
                        onChangeText={(text) => setForm({ ...form, name: text })}
                        placeholder="Name"
                    />
                    {errors.name && <Text style={styles.error}>{errors.name}</Text>}
                    <TextInput
                        style={styles.input}
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        placeholder="Email"
                        keyboardType="email-address"
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                    <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
                    </TouchableOpacity>
                    {status === "Profile updated successfully" && <Text style={styles.success}>Saved.</Text>}
                </View>

                {/* Update Password */}
                <View style={styles.section}>
                    <Text style={styles.header}>Update Password</Text>
                    <Text style={styles.subHeader}>Ensure your account is using a long, random password to stay secure.</Text>
                    <TextInput
                        style={styles.input}
                        value={form.current_password}
                        onChangeText={(text) => setForm({ ...form, current_password: text })}
                        placeholder="Current Password"
                        secureTextEntry
                    />
                    {errors.current_password && <Text style={styles.error}>{errors.current_password}</Text>}
                    <TextInput
                        style={styles.input}
                        value={form.password}
                        onChangeText={(text) => setForm({ ...form, password: text })}
                        placeholder="New Password"
                        secureTextEntry
                    />
                    {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                    <TextInput
                        style={styles.input}
                        value={form.password_confirmation}
                        onChangeText={(text) => setForm({ ...form, password_confirmation: text })}
                        placeholder="Confirm Password"
                        secureTextEntry
                    />
                    {errors.password_confirmation && <Text style={styles.error}>{errors.password_confirmation}</Text>}
                    <TouchableOpacity style={styles.button} onPress={updatePassword} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
                    </TouchableOpacity>
                    {status === "Password updated successfully" && <Text style={styles.success}>Saved.</Text>}
                </View>

                {/* Delete Account */}
                <View style={styles.section}>
                    <Text style={styles.header}>Delete Account</Text>
                    <Text style={styles.subHeader}>
                        Once your account is deleted, all of its resources and data will be permanently deleted.
                    </Text>
                    <TouchableOpacity style={styles.dangerButton} onPress={confirmDelete}>
                        <Text style={styles.buttonText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Delete Confirmation Modal */}
                <Modal visible={showDeleteModal} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.header}>Are you sure you want to delete your account?</Text>
                            <Text style={styles.subHeader}>
                                Once your account is deleted, all of its resources and data will be permanently deleted.
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={form.password}
                                onChangeText={(text) => setForm({ ...form, password: text })}
                                placeholder="Password"
                                secureTextEntry
                            />
                            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDeleteModal(false)}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.dangerButton} onPress={deleteAccount} disabled={loading}>
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Delete Account</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
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
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F2937",
    },
    subHeader: {
        fontSize: 14,
        color: "#4B5563",
        marginVertical: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 5,
        padding: 8,
        marginVertical: 8,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#2c6929",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 8,
    },
    dangerButton: {
        backgroundColor: "#DC2626",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 8,
    },
    cancelButton: {
        backgroundColor: "#6B7280",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginRight: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    error: {
        color: "#DC2626",
        fontSize: 12,
        marginTop: 4,
    },
    success: {
        color: "#16A34A",
        fontSize: 12,
        marginTop: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
    },
});