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
                    <Text style={styles.sectionLabel}>Moaad&apos;s ToDoList</Text>
                    <Text style={styles.title}>
                        Connect to Moaad&apos;s ToDoList app.
                    </Text>
                    <Text style={styles.lead}>
                        Sign in with Google to access your tasks.
                    </Text>

                    <Pressable
                        onPress={() => {
                            void handleGoogleLogin();
                        }}
                        disabled={isSubmitting}
                        style={[
                            styles.primaryButton,
                            isSubmitting ? styles.primaryButtonDisabled : null,
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={palette.white} />
                        ) : (
                            <>
                                <MaterialIcons name="login" size={18} color={palette.white} />
                                <Text style={styles.primaryButtonText}>
                                    Continue with Google
                                </Text>
                                <MaterialIcons
                                    name="arrow-forward"
                                    size={18}
                                    color={palette.white}
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
    sectionLabel: {
        color: palette.textSoft,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    title: {
        color: palette.textMain,
        fontSize: 40,
        lineHeight: 40,
        fontWeight: "800",
        letterSpacing: -1.6,
    },
    lead: {
        color: palette.textMuted,
        fontSize: 16,
        lineHeight: 26,
    },
    primaryButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 18,
        minHeight: 46,
        borderRadius: 12,
        backgroundColor: palette.accent,
    },
    primaryButtonDisabled: {
        opacity: 0.72,
    },
    primaryButtonText: {
        color: palette.white,
        fontWeight: "700",
    },
    errorText: {
        color: palette.danger,
        lineHeight: 22,
    },
});
