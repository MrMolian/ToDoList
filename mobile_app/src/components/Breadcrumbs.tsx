import { MaterialIcons } from "@expo/vector-icons";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import type { TaskGroup } from "../models/taskGroupModel";
import { palette } from "../utils/theme";

interface BreadcrumbsProps {
    path: TaskGroup[];
    onNavigateRoot: () => void;
    onNavigateTo: (index: number) => void;
}

export default function Breadcrumbs({
    path,
    onNavigateRoot,
    onNavigateTo,
}: BreadcrumbsProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            <Pressable onPress={onNavigateRoot} style={styles.item}>
                <MaterialIcons
                    name="home"
                    size={16}
                    color={palette.textMuted}
                />
                <Text style={styles.itemText}>Root</Text>
            </Pressable>

            {path.map((group, index) => (
                <View key={group.id} style={styles.segment}>
                    <MaterialIcons
                        name="chevron-right"
                        size={16}
                        color={palette.textSoft}
                    />
                    <Pressable
                        onPress={() => {
                            onNavigateTo(index);
                        }}
                        style={styles.item}
                    >
                        <Text style={styles.itemText}>{group.title}</Text>
                    </Pressable>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 10,
    },
    segment: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: palette.glassLight,
    },
    itemText: {
        color: palette.textMuted,
        fontWeight: "700",
    },
});
