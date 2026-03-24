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
        borderRadius: 32,
        backgroundColor: palette.glassStrong,
        borderWidth: 1,
        borderColor: palette.glassBorder,
    },
    iconWrap: {
        width: 64,
        height: 64,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: palette.glassLight,
    },
    title: {
        color: palette.textMain,
        fontSize: 34,
        fontWeight: "800",
        letterSpacing: -1,
    },
    status: {
        color: palette.textMuted,
        lineHeight: 22,
    },
});
