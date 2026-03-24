import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Task } from "../models/taskModel";
import { confirmDestructiveAction } from "../utils/confirm";
import { palette } from "../utils/theme";

interface SubTaskProps {
    task: Task;
    onToggleAchieved: (task: Task) => void;
    onDelete: (task: Task) => Promise<void>;
}

export default function SubTask({
    task,
    onToggleAchieved,
    onDelete,
}: SubTaskProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        const confirmed = await confirmDestructiveAction(
            "Delete subtask",
            `Delete "${task.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        try {
            await onDelete(task);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => {
                    onToggleAchieved(task);
                }}
                disabled={isDeleting}
                style={styles.toggle}
            >
                <MaterialIcons
                    name={task.achieved ? "check-box" : "check-box-outline-blank"}
                    size={22}
                    color={task.achieved ? palette.accent : palette.borderStrong}
                />
            </Pressable>

            <Text
                numberOfLines={1}
                style={[
                    styles.title,
                    task.achieved ? styles.titleAchieved : null,
                ]}
            >
                {task.title}
            </Text>

            <Pressable
                onPress={() => {
                    void handleDelete();
                }}
                disabled={isDeleting}
                style={styles.deleteButton}
            >
                <MaterialIcons name="delete-outline" size={20} color={palette.danger} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: palette.surfaceMuted,
        borderWidth: 1,
        borderColor: palette.border,
    },
    toggle: {
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        flex: 1,
        color: palette.textMain,
        fontWeight: "700",
    },
    titleAchieved: {
        textDecorationLine: "line-through",
        opacity: 0.72,
    },
    deleteButton: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
});
