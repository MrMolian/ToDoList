import {
    Platform,
    StatusBar as NativeStatusBar,
    StyleSheet,
    View,
} from "react-native";
import type { PropsWithChildren } from "react";

import { palette } from "../utils/theme";

export default function ScreenCanvas({ children }: PropsWithChildren) {
    const topInset =
        Platform.OS === "android" ? NativeStatusBar.currentHeight ?? 0 : 0;

    return (
        <View style={[styles.root, { paddingTop: topInset }]}>
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: palette.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
});
