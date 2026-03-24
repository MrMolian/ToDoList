import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Task } from "../models/taskModel";
import { palette } from "../utils/theme";

interface SubTaskProps {
    task: Task;
    onToggleAchieved: (task: Task) => void;
}

export default function SubTask({ task, onToggleAchieved }: SubTaskProps) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => {
                    onToggleAchieved(task);
                }}
                style={[
                    styles.toggle,
                    task.achieved ? styles.toggleAchieved : null,
                ]}
            >
                <MaterialIcons
                    name={
                        task.achieved
                            ? "check-circle"
                            : "radio-button-unchecked"
                    }
                    size={18}
                    color={task.achieved ? palette.success : palette.accentStrong}
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

            <Text style={styles.meta}>
                {task.achieved ? "Achieved" : "Pending"}
            </Text>
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
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.44)",
    },
    toggle: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        backgroundColor: palette.accentSoft,
    },
    toggleAchieved: {
        backgroundColor: "rgba(48, 164, 108, 0.14)",
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
    meta: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "600",
    },
});
