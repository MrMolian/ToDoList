import { MaterialIcons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import type { TaskGroup } from "../models/taskGroupModel";
import {
    defaultGroupColor,
    hexToRgba,
    palette,
} from "../utils/theme";

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
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleWrap}>
                    <View
                        style={[
                            styles.swatch,
                            {
                                backgroundColor: accent,
                                shadowColor: hexToRgba(accent, 0.34),
                            },
                        ]}
                    />

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
                    </View>
                </View>

                <Pressable
                    onPress={() => {
                        onEdit(taskGroup);
                    }}
                    style={styles.iconButton}
                >
                    <MaterialIcons name="edit" size={18} color={palette.textMain} />
                </Pressable>
            </View>

            <Text style={styles.description}>
                {taskGroup.description || "A focused container for related work."}
            </Text>

            <View style={styles.stats}>
                <Text style={styles.statText}>
                    {childGroupCount} nested group{childGroupCount === 1 ? "" : "s"}
                </Text>
                <Text style={styles.statText}>
                    {taskCount} task{taskCount === 1 ? "" : "s"}
                </Text>
            </View>

            <Pressable
                onPress={() => {
                    onOpen(taskGroup);
                }}
                style={[styles.openButton, { backgroundColor: hexToRgba(accent, 0.12) }]}
            >
                <Text style={[styles.openText, { color: accent }]}>Open space</Text>
                <MaterialIcons name="arrow-outward" size={18} color={accent} />
            </Pressable>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
    },
    titleWrap: {
        flex: 1,
        flexDirection: "row",
        gap: 14,
    },
    swatch: {
        width: 18,
        height: 54,
        borderRadius: 999,
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 18,
        elevation: 2,
    },
    copy: {
        flex: 1,
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
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    title: {
        color: palette.textMain,
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.6,
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
        minHeight: 44,
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
    openButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
    },
    openText: {
        fontWeight: "800",
    },
});
