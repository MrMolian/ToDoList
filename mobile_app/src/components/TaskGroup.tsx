import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TaskGroup } from "../models/taskGroupModel";
import { defaultGroupColor, palette } from "../utils/theme";

interface TaskGroupCardProps {
    taskGroup: TaskGroup;
    childGroupCount: number;
    taskCount: number;
    onOpen: (taskGroup: TaskGroup) => void;
    onEdit: (taskGroup: TaskGroup) => void;
}

export default function TaskGroupCard({
    taskGroup,
    childGroupCount,
    taskCount,
    onOpen,
    onEdit,
}: TaskGroupCardProps) {
    const accent = taskGroup.color || defaultGroupColor;

    return (
        <View style={[styles.card, { borderLeftColor: accent }]}>
            <View style={styles.row}>
                <Pressable
                    onPress={() => {
                        onOpen(taskGroup);
                    }}
                    style={styles.link}
                >
                    <View style={styles.copy}>
                        <View style={styles.sectionLabelRow}>
                            <MaterialIcons
                                name="folder"
                                size={14}
                                color={palette.textSoft}
                            />
                            <Text style={styles.sectionLabel}>Task group</Text>
                        </View>
                        <Text style={styles.title}>{taskGroup.title}</Text>
                        <Text style={styles.description}>
                            {taskGroup.description ||
                                "A focused container for related work."}
                        </Text>
                        <View style={styles.stats}>
                            <Text style={styles.statText}>
                                {childGroupCount} nested group
                                {childGroupCount === 1 ? "" : "s"}
                            </Text>
                            <Text style={styles.statText}>
                                {taskCount} task{taskCount === 1 ? "" : "s"}
                            </Text>
                        </View>
                    </View>
                </Pressable>

                <Pressable
                    onPress={() => {
                        onEdit(taskGroup);
                    }}
                    style={styles.iconButton}
                >
                    <MaterialIcons name="edit" size={18} color={palette.textMain} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 18,
        borderWidth: 1,
        borderLeftWidth: 8,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        shadowColor: palette.shadow,
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    link: {
        flex: 1,
    },
    copy: {
        gap: 8,
    },
    sectionLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    sectionLabel: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.1,
        textTransform: "uppercase",
    },
    title: {
        color: palette.textMain,
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    description: {
        color: palette.textMuted,
        lineHeight: 22,
    },
    stats: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    statText: {
        color: palette.textMuted,
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
});
