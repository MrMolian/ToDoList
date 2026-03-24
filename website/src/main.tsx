import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";
import SessionProvider from "./providers/SessionProvider.tsx";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2f5b4f",
            dark: "#25473f",
        },
        error: {
            main: "#b34b38",
        },
        background: {
            default: "#ece8de",
            paper: "#fbfaf7",
        },
        text: {
            primary: "#1f1c18",
            secondary: "#645d52",
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily:
            '"Aptos", "Segoe UI Variable Text", "Segoe UI", "Helvetica Neue", sans-serif',
        button: {
            fontWeight: 600,
            textTransform: "none",
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: "10px 16px",
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: "#f4f1ea",
                },
                notchedOutline: {
                    borderColor: "#d6cfbf",
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <SessionProvider>
                    <App />
                </SessionProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
