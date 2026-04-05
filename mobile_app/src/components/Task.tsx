import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Task } from "../models/taskModel";
import SubTask from "./SubTask";
import { palette } from "../utils/theme";

interface TaskCardProps {
    task: Task;
    subTasks: Task[];
    onEdit: (task: Task) => void;
    onAddSubTask: (task: Task) => void;
    onToggleAchieved: (task: Task) => void;
    onToggleSubTaskAchieved: (task: Task) => void;
    onDeleteSubTask: (task: Task) => Promise<void>;
}

export default function TaskCard({
    task,
    subTasks,
    onEdit,
    onAddSubTask,
    onToggleAchieved,
    onToggleSubTaskAchieved,
    onDeleteSubTask,
}: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={[styles.card, task.achieved ? styles.cardAchieved : null]}>
            <View style={styles.row}>
                <Pressable
                    onPress={() => {
                        onToggleAchieved(task);
                    }}
                    style={styles.checkbox}
                >
                    <MaterialIcons
                        name={task.achieved ? "check-box" : "check-box-outline-blank"}
                        size={24}
                        color={task.achieved ? palette.accent : palette.borderStrong}
                    />
                </Pressable>

                <View style={styles.main}>
                    <View style={styles.header}>
                        <View style={styles.titleLine}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.title,
                                    task.achieved ? styles.titleAchieved : null,
                                ]}
                            >
                                {task.title}
                            </Text>
                        </View>

                        <View style={styles.controls}>
                            <Pressable
                                onPress={() => {
                                    onEdit(task);
                                }}
                                style={styles.iconButton}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={18}
                                    color={palette.textMain}
                                />
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    setIsExpanded((current) => !current);
                                }}
                                style={styles.iconButton}
                            >
                                <MaterialIcons
                                    name={isExpanded ? "expand-less" : "expand-more"}
                                    size={20}
                                    color={palette.textMain}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>

            {isExpanded ? (
                <View style={styles.details}>
                    <View style={styles.detailsActions}>
                        <Pressable
                            onPress={() => {
                                onAddSubTask(task);
                            }}
                            style={styles.secondaryButton}
                        >
                            <MaterialIcons
                                name="task-alt"
                                size={18}
                                color={palette.textMain}
                            />
                            <Text style={styles.secondaryButtonText}>Subtask</Text>
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

                    {subTasks.length > 0 ? (
                        <View style={styles.subTasksSection}>
                            <Text style={styles.sectionLabel}>
                                {subTasks.length} subtask{subTasks.length === 1 ? "" : "s"}
                            </Text>

                            <View style={styles.subTaskList}>
                                {subTasks.map((subTask) => (
                                    <SubTask
                                        key={subTask.id}
                                        task={subTask}
                                        onToggleAchieved={onToggleSubTaskAchieved}
                                        onDelete={onDeleteSubTask}
                                    />
                                ))}
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No subtasks attached.</Text>
                    )}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: 0,
        padding: 18,
        borderRadius: 18,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: palette.shadow,
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 2,
    },
    cardAchieved: {
        backgroundColor: "#f6f4ee",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    checkbox: {
        alignItems: "center",
        justifyContent: "center",
    },
    main: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    titleLine: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        flex: 1,
        color: palette.textMain,
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    titleAchieved: {
        textDecorationLine: "line-through",
        opacity: 0.72,
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    details: {
        gap: 14,
        marginTop: 14,
        paddingLeft: 36,
    },
    detailsActions: {
        flexDirection: "row",
        gap: 10,
    },
    description: {
        color: palette.textMuted,
        lineHeight: 22,
    },
    descriptionAchieved: {
        opacity: 0.72,
    },
    subTasksSection: {
        gap: 12,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: palette.border,
    },
    subTaskList: {
        gap: 10,
    },
    sectionLabel: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.1,
        textTransform: "uppercase",
    },
    secondaryButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        minHeight: 40,
        borderRadius: 10,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
    },
    secondaryButtonText: {
        color: palette.textMain,
        fontWeight: "700",
    },
    emptyText: {
        color: palette.textSoft,
    },
});
