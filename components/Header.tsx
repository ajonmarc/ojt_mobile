// app/admin/components/Header.tsx
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import SemesterPickerModal from "./SemesterPickerModal";

type HeaderProps = {
  onToggleSidebar: () => void;
  title: string;
  onChangeSemester?: (semester: string) => void; // Updated to pass selected semester
};

export default function Header({ onToggleSidebar, title, onChangeSemester }: HeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSemesterPress = () => {
    setModalVisible(true);
  };

  const handleSelectSemester = (semester: string) => {
    if (onChangeSemester) {
      onChangeSemester(semester);
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onToggleSidebar}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.spacer} />
        {/* <TouchableOpacity style={styles.semesterButton} onPress={handleSemesterPress}>
          <Text style={styles.headerText}>{title}</Text>
          <Ionicons name="calendar" size={24} color="#333" style={styles.calendarIcon} />
        </TouchableOpacity> */}
      </View>
      <SemesterPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelectSemester}
        currentSemester={title}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFC107",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1,
  },
  semesterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  calendarIcon: {
    marginLeft: 8,
  },
});