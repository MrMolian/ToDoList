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

import {
    createTaskGroup,
    deleteTaskGroup,
    updateTaskGroup,
} from "../api/TaskGroup";
import type { TaskGroup } from "../models/taskGroupModel";
import { confirmDestructiveAction } from "../utils/confirm";
import {
    defaultGroupColor,
    groupColorOptions,
    palette,
} from "../utils/theme";

interface TaskGroupEditModalProps {
    open: boolean;
    taskGroup: TaskGroup | null;
    parentGroupId: string | null;
    onClose: () => void;
    onSaved: (taskGroup: TaskGroup) => void;
    onDeleted: (taskGroup: TaskGroup) => void;
}

export default function TaskGroupEditModal({
    open,
    taskGroup,
    parentGroupId,
    onClose,
    onSaved,
    onDeleted,
}: TaskGroupEditModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(defaultGroupColor);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isEditing = taskGroup !== null;

    useEffect(() => {
        setTitle(taskGroup?.title ?? "");
        setDescription(taskGroup?.description ?? "");
        setColor(taskGroup?.color ?? defaultGroupColor);
        setErrorMessage(null);
        setIsSaving(false);
        setIsDeleting(false);
    }, [open, taskGroup]);

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
                color: color.trim() || null,
            };

            const savedTaskGroup = taskGroup
                ? await updateTaskGroup(taskGroup.id, payload)
                : await createTaskGroup({
                      ...payload,
                      parent_id: parentGroupId,
                  });

            onSaved(savedTaskGroup);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Task group changes could not be saved.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!taskGroup) {
            return;
        }

        const shouldDelete = await confirmDestructiveAction(
            "Delete group",
            `Delete "${taskGroup.title}" and all nested task groups and tasks?`,
        );

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage(null);

        try {
            await deleteTaskGroup(taskGroup.id);
            onDeleted(taskGroup);
            onClose();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Task group could not be deleted.",
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
                            {isEditing ? "Edit task group" : "Create task group"}
                        </Text>

                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Product launch"
                                style={styles.input}
                                placeholderTextColor={palette.textSoft}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="What belongs in this group?"
                                multiline
                                style={[styles.input, styles.textArea]}
                                placeholderTextColor={palette.textSoft}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Accent color</Text>
                            <View style={styles.colorRow}>
                                {groupColorOptions.map((option) => (
                                    <Pressable
                                        key={option}
                                        onPress={() => {
                                            setColor(option);
                                        }}
                                        style={[
                                            styles.colorSwatch,
                                            { backgroundColor: option },
                                            color === option ? styles.colorSwatchActive : null,
                                        ]}
                                    />
                                ))}
                            </View>
                            <TextInput
                                value={color}
                                onChangeText={setColor}
                                placeholder="#7b91ff"
                                autoCapitalize="none"
                                style={styles.input}
                                placeholderTextColor={palette.textSoft}
                            />
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
                                        <Text style={styles.deleteText}>Delete group</Text>
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
                                            {isEditing ? "Save group" : "Create group"}
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
    colorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorSwatch: {
        width: 34,
        height: 34,
        borderRadius: 999,
        borderWidth: 3,
        borderColor: "transparent",
    },
    colorSwatchActive: {
        borderColor: palette.textMain,
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
