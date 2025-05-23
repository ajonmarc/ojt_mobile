// app/admin/components/SemesterPickerModal.tsx
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

type SemesterPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (semester: string) => void;
  currentSemester: string;
};

const semesters = [
  "1st Semester, A.Y. 2023",
  "2nd Semester, A.Y. 2023",
  "1st Semester, A.Y. 2024",
  "2nd Semester, A.Y. 2024",
  "1st Semester, A.Y. 2025",
  "2nd Semester, A.Y. 2025",
];

export default function SemesterPickerModal({
  visible,
  onClose,
  onSelect,
  currentSemester,
}: SemesterPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Semester</Text>
          {semesters.map((semester) => (
            <TouchableOpacity
              key={semester}
              style={[
                styles.semesterItem,
                semester === currentSemester && styles.selectedSemester,
              ]}
              onPress={() => {
                onSelect(semester);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.semesterText,
                  semester === currentSemester && styles.selectedSemesterText,
                ]}
              >
                {semester}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  semesterItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSemester: {
    backgroundColor: "#E8F5E9",
  },
  semesterText: {
    fontSize: 16,
    color: "#333",
  },
  selectedSemesterText: {
    fontWeight: "500",
    color: "#388E3C",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});