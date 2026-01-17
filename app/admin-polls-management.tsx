import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, X } from "lucide-react-native";

interface Poll {
  id: number;
  question: string;
  description?: string;
  advertisementId: number;
  isMultipleChoice: boolean;
  showResults: boolean;
  isActive: boolean;
  endDate?: Date;
  options: PollOption[];
}

interface PollOption {
  id: number;
  optionText: string;
  order: number;
}

export default function AdminPollsManagement() {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    advertisementId: "",
    isMultipleChoice: false,
    showResults: false,
    isActive: true,
    endDate: "",
    options: [{ optionText: "", order: 1 }],
  });

  const { data: polls, isLoading, refetch } = useQuery(trpc.polls.getAll.queryOptions());

  const createPollMutation = useMutation(trpc.polls.create.mutationOptions());
  const updatePollMutation = useMutation(trpc.polls.update.mutationOptions());
  const deletePollMutation = useMutation(trpc.polls.delete.mutationOptions());

  const resetForm = () => {
    setFormData({
      question: "",
      description: "",
      advertisementId: "",
      isMultipleChoice: false,
      showResults: false,
      isActive: true,
      endDate: "",
      options: [{ optionText: "", order: 1 }],
    });
    setSelectedPoll(null);
  };

  const handleSavePoll = () => {
    const mutation = selectedPoll ? updatePollMutation : createPollMutation;
    const pollData = {
      ...formData,
      advertisementId: parseInt(formData.advertisementId),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      id: selectedPoll?.id,
    };

    mutation.mutate(pollData as any, {
      onSuccess: () => {
        Alert.alert("Success", `Poll ${selectedPoll ? "updated" : "created"} successfully.`);
        setShowModal(false);
        resetForm();
        refetch();
      },
      onError: (error) => {
        Alert.alert("Error", error.message || "Failed to save poll.");
      },
    });
  };

  const handleDeletePoll = (pollId: number) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this poll?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePollMutation.mutate({ id: pollId } as any, {
            onSuccess: () => {
              Alert.alert("Success", "Poll deleted successfully.");
              refetch();
            },
            onError: (error) => {
              Alert.alert("Error", error.message || "Failed to delete poll.");
            },
          });
        },
      },
    ]);
  };

  const openEditModal = (poll: Poll) => {
    setSelectedPoll(poll);
    setFormData({
      question: poll.question,
      description: poll.description || "",
      advertisementId: poll.advertisementId.toString(),
      isMultipleChoice: poll.isMultipleChoice,
      showResults: poll.showResults,
      isActive: poll.isActive,
      endDate: poll.endDate ? new Date(poll.endDate).toISOString().split("T")[0] : "",
      options: poll.options.map((opt) => ({ optionText: opt.optionText, order: opt.order })),
    });
    setShowModal(true);
  };

  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...formData.options];
    newOptions[index].optionText = text;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { optionText: "", order: formData.options.length + 1 }],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Polls Management" }} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Polls</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Poll</Text>
          </TouchableOpacity>
        </View>

        {polls?.map((poll) => (
          <View key={poll.id} style={styles.pollCard}>
            <Text style={styles.pollQuestion}>{poll.question}</Text>
            <View style={styles.pollActions}>
              <TouchableOpacity onPress={() => openEditModal(poll)}>
                <Edit size={20} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePoll(poll.id)}>
                <Trash2 size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedPoll ? "Edit Poll" : "Add Poll"}</Text>
              <TextInput
                style={styles.input}
                placeholder="Question"
                value={formData.question}
                onChangeText={(text) => setFormData({ ...formData, question: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Advertisement ID"
                value={formData.advertisementId}
                onChangeText={(text) => setFormData({ ...formData, advertisementId: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="End Date (YYYY-MM-DD)"
                value={formData.endDate}
                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
              />
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, isMultipleChoice: !formData.isMultipleChoice })}
                >
                  <Text>{formData.isMultipleChoice ? "[x]" : "[ ]"} Multiple Choice</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFormData({ ...formData, showResults: !formData.showResults })}>
                  <Text>{formData.showResults ? "[x]" : "[ ]"} Show Results</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                  <Text>{formData.isActive ? "[x]" : "[ ]"} Active</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.optionsTitle}>Options</Text>
              {formData.options.map((option, index) => (
                <View key={index} style={styles.optionContainer}>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${index + 1}`}
                    value={option.optionText}
                    onChangeText={(text) => handleOptionChange(text, index)}
                  />
                  <TouchableOpacity onPress={() => removeOption(index)}>
                    <Trash2 size={20} color="gray" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                <Text>Add Option</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePoll}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  addButton: { flexDirection: "row-reverse", backgroundColor: "blue", padding: 10, borderRadius: 5 },
  addButtonText: { color: "#fff", marginLeft: 5 },
  pollCard: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  pollQuestion: { fontSize: 16 },
  pollActions: { flexDirection: "row-reverse", gap: 15 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  checkboxContainer: { flexDirection: "row-reverse", justifyContent: "space-around", marginBottom: 20 },
  optionsTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  optionContainer: { flexDirection: "row-reverse", alignItems: "center", marginBottom: 10 },
  optionInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginRight: 10 },
  addOptionButton: {
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 5,
    marginTop: 10,
  },
  modalActions: { flexDirection: "row-reverse", justifyContent: "flex-end", marginTop: 20 },
  saveButton: { backgroundColor: "blue", padding: 10, borderRadius: 5, marginRight: 10 },
  saveButtonText: { color: "#fff" },
  cancelButton: { backgroundColor: "gray", padding: 10, borderRadius: 5 },
  cancelButtonText: { color: "#fff" },
});
