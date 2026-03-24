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
            <View style={[styles.orb, styles.orbLeft]} />
            <View style={[styles.orb, styles.orbRight]} />
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: palette.backgroundTop,
    },
    content: {
        flex: 1,
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
    orb: {
        position: "absolute",
        borderRadius: 999,
        opacity: 0.65,
    },
    orbLeft: {
        top: -40,
        left: -70,
        width: 220,
        height: 220,
        backgroundColor: palette.orbBlue,
    },
    orbRight: {
        right: -50,
        bottom: 80,
        width: 200,
        height: 200,
        backgroundColor: palette.orbOrange,
    },
});
