import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { logInWithGoogle } from "../api/Auth";
import ScreenCanvas from "../components/ScreenCanvas";
import { palette } from "../utils/theme";

export default function AuthScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleGoogleLogin() {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await logInWithGoogle();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Google sign-in could not be started.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ScreenCanvas>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.panel}>
                    <Text style={styles.sectionLabel}>ToDoApp</Text>
                    <Text style={styles.title}>
                        Organize work through calm, nested task spaces.
                    </Text>
                    <Text style={styles.lead}>
                        Sign in with Google directly in the app to open your
                        dashboard, move through task groups like folders, and
                        keep every to-do anchored to the right place.
                    </Text>

                    <View style={styles.features}>
                        <View style={styles.feature}>
                            <Text style={styles.featureTitle}>Nested groups</Text>
                            <Text style={styles.featureCopy}>
                                Move from root to any child workspace with a breadcrumb
                                path.
                            </Text>
                        </View>

                        <View style={styles.feature}>
                            <Text style={styles.featureTitle}>Focused editing</Text>
                            <Text style={styles.featureCopy}>
                                Adjust tasks and groups in-place with lightweight
                                dialogs.
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={() => {
                            void handleGoogleLogin();
                        }}
                        disabled={isSubmitting}
                        style={styles.primaryButton}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="login"
                                    size={18}
                                    color="#ffffff"
                                />
                                <Text style={styles.primaryButtonText}>
                                    Continue with Google
                                </Text>
                                <MaterialIcons
                                    name="arrow-forward"
                                    size={18}
                                    color="#ffffff"
                                />
                            </>
                        )}
                    </Pressable>

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}
                </View>
            </ScrollView>
        </ScreenCanvas>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: 24,
    },
    panel: {
        gap: 24,
        padding: 32,
        borderRadius: 32,
        backgroundColor: palette.glassStrong,
        borderWidth: 1,
        borderColor: palette.glassBorder,
    },
    sectionLabel: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    title: {
        color: palette.textMain,
        fontSize: 44,
        lineHeight: 44,
        fontWeight: "800",
        letterSpacing: -1.8,
    },
    lead: {
        color: palette.textMuted,
        fontSize: 16,
        lineHeight: 27,
    },
    features: {
        gap: 16,
    },
    feature: {
        gap: 6,
        padding: 18,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.42)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    featureTitle: {
        color: palette.textMain,
        fontWeight: "800",
    },
    featureCopy: {
        color: palette.textMuted,
        lineHeight: 22,
    },
    primaryButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 999,
        backgroundColor: palette.accent,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
    errorText: {
        color: palette.danger,
        lineHeight: 22,
    },
});
