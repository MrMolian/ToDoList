import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import type { SignInWithIdTokenCredentials } from "@supabase/supabase-js";

import supabase from "../utils/supabase";

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let isGoogleConfigured = false;

function configureGoogleSignIn() {
    if (isGoogleConfigured) {
        return;
    }

    if (!googleWebClientId) {
        throw new Error(
            "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID for native Google sign-in.",
        );
    }

    GoogleSignin.configure({
        webClientId: googleWebClientId,
        iosClientId: googleIosClientId || undefined,
        offlineAccess: false,
    });

    isGoogleConfigured = true;
}

export async function logInWithGoogle() {
    configureGoogleSignIn();

    if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
        });
    }

    const result = await GoogleSignin.signIn();

    if (result.type !== "success") {
        return null;
    }

    if (!result.data.idToken) {
        throw new Error(
            "Google sign-in did not return an ID token. Check your Google Web Client ID configuration.",
        );
    }

    const credentials: SignInWithIdTokenCredentials = {
        provider: "google",
        token: result.data.idToken,
    };

    const { data, error } = await supabase.auth.signInWithIdToken(credentials);

    if (error) {
        throw error;
    }

    return data;
}

export async function signOutFromGoogle() {
    if (!googleWebClientId) {
        return;
    }

    configureGoogleSignIn();

    try {
        await GoogleSignin.signOut();
    } catch {
        await GoogleSignin.revokeAccess().catch(() => null);
    }
}
