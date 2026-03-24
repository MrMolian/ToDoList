import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useEffect, useState } from "react";

import { createTask, deleteTask, updateTask } from "../api/Task";
import type { Task, TaskPriority } from "../models/taskModel";
import { confirmDestructiveAction } from "../utils/confirm";
import { palette, priorityTheme } from "../utils/theme";

interface TaskEditModalProps {
    open: boolean;
    task: Task | null;
    parentGroupId: string | null;
    parentTask: Task | null;
    onClose: () => void;
    onSaved: (task: Task) => void;
    onDeleted: (task: Task) => void;
}

const taskPriorities: TaskPriority[] = ["low", "medium", "high"];

export default function TaskEditModal({
    open,
    task,
    parentGroupId,
    parentTask,
    onClose,
    onSaved,
    onDeleted,
}: TaskEditModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isEditing = task !== null;
    const isCreatingSubTask = !isEditing && parentTask !== null;

    useEffect(() => {
        setTitle(task?.title ?? "");
        setDescription(task?.description ?? "");
        setPriority(task?.priority ?? "medium");
        setErrorMessage(null);
        setIsSaving(false);
        setIsDeleting(false);
    }, [open, task]);

    async function handleSubmit() {
        if (!title.trim()) {
            setErrorMessage("Title is required.");
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                priority,
            };

            const savedTask = task
                ? await updateTask(task.id, payload)
                : await createTask({
                      ...payload,
                      achieved: false,
                      task_parent_id: parentTask?.id ?? null,
                      group_parent_id: parentTask ? null : parentGroupId,
                  });

            onSaved(savedTask);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Task changes could not be saved.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!task) {
            return;
        }

        const shouldDelete = await confirmDestructiveAction(
            "Delete task",
            `Delete "${task.title}" and its subtasks?`,
        );

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage(null);

        try {
            await deleteTask(task.id);
            onDeleted(task);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Task could not be deleted.",
            );
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={() => {
                if (!isSaving && !isDeleting) {
                    onClose();
                }
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.overlay}
            >
                <View style={styles.backdrop} />
                <View style={styles.wrapper}>
                    <ScrollView
                        contentContainerStyle={styles.card}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.title}>
                            {isEditing
                                ? "Edit task"
                                : isCreatingSubTask
                                  ? "Create subtask"
                                  : "Create task"}
                        </Text>

                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        {isCreatingSubTask ? (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Parent task</Text>
                                <View style={styles.readOnlyField}>
                                    <Text style={styles.readOnlyText}>
                                        {parentTask?.title}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Prepare sprint recap"
                                style={styles.input}
                                placeholderTextColor={palette.textSoft}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Add notes or context"
                                multiline
                                style={[styles.input, styles.textArea]}
                                placeholderTextColor={palette.textSoft}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.priorityRow}>
                                {taskPriorities.map((value) => {
                                    const theme = priorityTheme[value];

                                    return (
                                        <Pressable
                                            key={value}
                                            onPress={() => {
                                                setPriority(value);
                                            }}
                                            style={[
                                                styles.priorityButton,
                                                {
                                                    backgroundColor:
                                                        priority === value
                                                            ? theme.background
                                                            : "rgba(255, 255, 255, 0.5)",
                                                    borderColor:
                                                        priority === value
                                                            ? theme.color
                                                            : "rgba(255, 255, 255, 0.3)",
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.priorityButtonText,
                                                    {
                                                        color:
                                                            priority === value
                                                                ? theme.color
                                                                : palette.textMuted,
                                                    },
                                                ]}
                                            >
                                                {theme.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.actions}>
                            {isEditing ? (
                                <Pressable
                                    onPress={() => {
                                        void handleDelete();
                                    }}
                                    disabled={isSaving || isDeleting}
                                    style={styles.deleteButton}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color={palette.danger} />
                                    ) : (
                                        <Text style={styles.deleteText}>Delete task</Text>
                                    )}
                                </Pressable>
                            ) : null}

                            <View style={styles.trailingActions}>
                                <Pressable
                                    onPress={onClose}
                                    disabled={isSaving || isDeleting}
                                    style={styles.secondaryButton}
                                >
                                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        void handleSubmit();
                                    }}
                                    disabled={isSaving || isDeleting}
                                    style={styles.primaryButton}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>
                                            {isEditing
                                                ? "Save task"
                                                : isCreatingSubTask
                                                  ? "Create subtask"
                                                  : "Create task"}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        padding: 18,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(16, 32, 56, 0.24)",
    },
    wrapper: {
        maxHeight: "90%",
    },
    card: {
        gap: 18,
        padding: 24,
        borderRadius: 28,
        backgroundColor: "rgba(247, 249, 255, 0.96)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.52)",
    },
    title: {
        color: palette.textMain,
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.8,
    },
    errorBox: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: "rgba(214, 71, 69, 0.1)",
    },
    errorText: {
        color: palette.danger,
        lineHeight: 20,
    },
    fieldGroup: {
        gap: 8,
    },
    label: {
        color: palette.textMuted,
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    input: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(208, 218, 235, 0.8)",
        backgroundColor: "#ffffff",
        color: palette.textMain,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    textArea: {
        minHeight: 110,
    },
    readOnlyField: {
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    readOnlyText: {
        color: palette.textMain,
        fontWeight: "600",
    },
    priorityRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    priorityButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
    },
    priorityButtonText: {
        fontWeight: "700",
    },
    actions: {
        gap: 12,
    },
    deleteButton: {
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(214, 71, 69, 0.1)",
    },
    deleteText: {
        color: palette.danger,
        fontWeight: "700",
    },
    trailingActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    secondaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.82)",
    },
    secondaryButtonText: {
        color: palette.textMain,
        fontWeight: "700",
    },
    primaryButton: {
        minWidth: 120,
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: palette.accent,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
});
