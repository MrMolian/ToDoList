import type { TaskPriority } from "../models/taskModel";

export const palette = {
    backgroundTop: "#eef3ff",
    backgroundBottom: "#f7f4ef",
    textMain: "#102038",
    textMuted: "#5b6778",
    textSoft: "#7f8b9d",
    accent: "#3d6dff",
    accentStrong: "#2448d8",
    accentSoft: "rgba(61, 109, 255, 0.12)",
    success: "#30a46c",
    warning: "#d97706",
    danger: "#d64745",
    glassStrong: "rgba(255, 255, 255, 0.82)",
    glassMedium: "rgba(255, 255, 255, 0.72)",
    glassLight: "rgba(255, 255, 255, 0.56)",
    glassBorder: "rgba(255, 255, 255, 0.58)",
    shadow: "rgba(111, 139, 185, 0.18)",
    shadowSoft: "rgba(85, 105, 138, 0.12)",
    orbBlue: "rgba(164, 188, 255, 0.7)",
    orbOrange: "rgba(255, 208, 161, 0.7)",
};

export const defaultGroupColor = "#7b91ff";

export const priorityTheme: Record<
    TaskPriority,
    { label: string; background: string; color: string }
> = {
    low: {
        label: "Low",
        background: "rgba(123, 145, 255, 0.12)",
        color: "#4e62be",
    },
    medium: {
        label: "Medium",
        background: "rgba(255, 179, 71, 0.14)",
        color: "#ab6e00",
    },
    high: {
        label: "High",
        background: "rgba(214, 71, 69, 0.12)",
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
        return `rgba(61, 109, 255, ${alpha})`;
    }

    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
