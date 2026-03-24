import type { TaskPriority } from "../models/taskModel";

export const palette = {
    background: "#ece8de",
    surface: "#fbfaf7",
    surfaceMuted: "#f4f1ea",
    surfaceStrong: "#ebe5d9",
    border: "#d8d0c1",
    borderStrong: "#c5bcac",
    textMain: "#1f1c18",
    textMuted: "#5f584e",
    textSoft: "#7c7468",
    accent: "#2f5b4f",
    accentStrong: "#25473f",
    accentSoft: "#d7e5de",
    success: "#2f7a54",
    warning: "#ad7a2e",
    danger: "#b34b38",
    white: "#ffffff",
    shadow: "rgba(55, 47, 37, 0.14)",
    shadowSoft: "rgba(31, 28, 24, 0.08)",
};

export const defaultGroupColor = "#7b91ff";

export const priorityTheme: Record<
    TaskPriority,
    { label: string; background: string; color: string }
> = {
    low: {
        label: "Low",
        background: "#e4e8f1",
        color: "#4d6473",
    },
    medium: {
        label: "Medium",
        background: "#efe3cc",
        color: palette.warning,
    },
    high: {
        label: "High",
        background: "#f0d8d4",
        color: palette.danger,
    },
};

export const groupColorOptions = [
    "#7b91ff",
    "#3d6dff",
    "#30a46c",
    "#d97706",
    "#d64745",
    "#8f5cf7",
    "#00a7c4",
    "#111827",
];

export function hexToRgba(hex: string, alpha: number) {
    const normalized = hex.replace("#", "");
    const expanded =
        normalized.length === 3
            ? normalized
                  .split("")
                  .map((value) => value + value)
                  .join("")
            : normalized;

    if (expanded.length !== 6) {
        return `rgba(47, 91, 79, ${alpha})`;
    }

    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
