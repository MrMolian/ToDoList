import supabase from "../utils/supabase";

export async function logInWithGoogle() {
    const redirectTo = import.meta.env.VITE_APP_URL + "/callback";
    return await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo,
        },
    });
}
