import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import ScreenCanvas from "../components/ScreenCanvas";
import { palette } from "../utils/theme";

interface LoadingScreenProps {
    status: string;
}

export default function LoadingScreen({ status }: LoadingScreenProps) {
    return (
        <ScreenCanvas>
            <View style={styles.center}>
                <View style={styles.card}>
                    <View style={styles.iconWrap}>
                        <ActivityIndicator size="large" color={palette.accent} />
                    </View>
                    <Text style={styles.title}>Loading</Text>
                    <Text style={styles.status}>{status}</Text>
                </View>
            </View>
        </ScreenCanvas>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        width: "100%",
        maxWidth: 520,
        gap: 16,
        padding: 32,
        borderRadius: 24,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: palette.shadow,
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 30,
        elevation: 3,
    },
    iconWrap: {
        width: 56,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        backgroundColor: palette.surfaceMuted,
        borderWidth: 1,
        borderColor: palette.border,
    },
    title: {
        color: palette.textMain,
        fontSize: 32,
        fontWeight: "800",
        letterSpacing: -1,
    },
    status: {
        color: palette.textMuted,
        lineHeight: 22,
    },
});
