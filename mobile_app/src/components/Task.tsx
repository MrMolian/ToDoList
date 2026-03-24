import { MaterialIcons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import type { Task } from "../models/taskModel";
import SubTask from "./SubTask";
import { palette, priorityTheme } from "../utils/theme";

interface TaskCardProps {
    task: Task;
    subTasks: Task[];
    onEdit: (task: Task) => void;
    onAddSubTask: (task: Task) => void;
    onToggleAchieved: (task: Task) => void;
    onToggleSubTaskAchieved: (task: Task) => void;
}

export default function TaskCard({
    task,
    subTasks,
    onEdit,
    onAddSubTask,
    onToggleAchieved,
    onToggleSubTaskAchieved,
}: TaskCardProps) {
    const priority = priorityTheme[task.priority];

    return (
        <View style={[styles.card, task.achieved ? styles.cardAchieved : null]}>
            <View style={styles.header}>
                <View style={styles.headerCopy}>
                    <View style={styles.badges}>
                        <Pressable
                            onPress={() => {
                                onToggleAchieved(task);
                            }}
                            style={[
                                styles.tickButton,
                                task.achieved ? styles.tickButtonAchieved : null,
                            ]}
                        >
                            <MaterialIcons
                                name={
                                    task.achieved
                                        ? "check-circle"
                                        : "radio-button-unchecked"
                                }
                                size={18}
                                color={
                                    task.achieved
                                        ? palette.success
                                        : palette.accentStrong
                                }
                            />
                            <Text
                                style={[
                                    styles.tickText,
                                    task.achieved ? styles.tickTextAchieved : null,
                                ]}
                            >
                                {task.achieved ? "Achieved" : "Pending"}
                            </Text>
                        </Pressable>

                        <View
                            style={[
                                styles.priorityPill,
                                { backgroundColor: priority.background },
                            ]}
                        >
                            <Text style={[styles.priorityText, { color: priority.color }]}>
                                {priority.label}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.title, task.achieved ? styles.titleAchieved : null]}>
                        {task.title}
                    </Text>
                </View>

                <Pressable
                    onPress={() => {
                        onEdit(task);
                    }}
                    style={styles.iconButton}
                >
                    <MaterialIcons name="edit" size={18} color={palette.textMain} />
                </Pressable>
            </View>

            <Text
                style={[
                    styles.description,
                    task.achieved ? styles.descriptionAchieved : null,
                ]}
            >
                {task.description || "No additional notes for this task yet."}
            </Text>

            <Pressable
                onPress={() => {
                    onAddSubTask(task);
                }}
                style={styles.secondaryButton}
            >
                <MaterialIcons name="add" size={18} color={palette.textMain} />
                <Text style={styles.secondaryButtonText}>Add subtask</Text>
            </Pressable>

            {subTasks.length > 0 ? (
                <View style={styles.subTasksSection}>
                    <Text style={styles.sectionLabel}>
                        {subTasks.length} subtask{subTasks.length === 1 ? "" : "s"}
                    </Text>

                    <View style={styles.subTaskList}>
                        {subTasks.slice(0, 3).map((subTask) => (
                            <SubTask
                                key={subTask.id}
                                task={subTask}
                                onToggleAchieved={onToggleSubTaskAchieved}
                            />
                        ))}
                    </View>
                </View>
            ) : (
                <Text style={styles.emptyText}>No subtasks attached.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: 18,
        padding: 22,
        borderRadius: 24,
        backgroundColor: palette.glassMedium,
        borderWidth: 1,
        borderColor: palette.glassBorder,
        shadowColor: palette.shadowSoft,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 24,
        elevation: 3,
    },
    cardAchieved: {
        opacity: 0.92,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
    },
    headerCopy: {
        flex: 1,
        gap: 12,
    },
    badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    tickButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        minHeight: 34,
        borderRadius: 999,
        backgroundColor: palette.accentSoft,
    },
    tickButtonAchieved: {
        backgroundColor: "rgba(48, 164, 108, 0.14)",
    },
    tickText: {
        color: palette.accentStrong,
        fontSize: 12,
        fontWeight: "700",
    },
    tickTextAchieved: {
        color: palette.success,
    },
    priorityPill: {
        justifyContent: "center",
        paddingHorizontal: 12,
        minHeight: 34,
        borderRadius: 999,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: "700",
    },
    title: {
        color: palette.textMain,
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.6,
    },
    titleAchieved: {
        textDecorationLine: "line-through",
        opacity: 0.72,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.66)",
    },
    description: {
        color: palette.textMuted,
        lineHeight: 22,
        minHeight: 44,
    },
    descriptionAchieved: {
        opacity: 0.72,
    },
    secondaryButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.52)",
    },
    secondaryButtonText: {
        color: palette.textMain,
        fontWeight: "700",
    },
    subTasksSection: {
        gap: 12,
    },
    subTaskList: {
        gap: 10,
    },
    sectionLabel: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    emptyText: {
        color: palette.textSoft,
    },
});
