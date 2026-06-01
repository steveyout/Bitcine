import { createTheme } from "@mui/material/styles";

// A beautiful, highly aesthetic dark theme with a premium purplish gradient vibe.
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8b5cf6", // Violet 500
      light: "#a78bfa", // Violet 400
      dark: "#6d28d9", // Violet 700
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ec4899", // Pink 500
      light: "#f472b6", // Pink 400
      dark: "#db2777", // Pink 600
    },
    background: {
      default: "#050110", // Sleek Interface background
      paper: "#0a0218", // Sleek Interface card/paper design
    },
    text: {
      primary: "#f8fafc", // Cool slate whites
      secondary: "#94a3b8", // Muted state grays
    },
    divider: "rgba(139, 92, 246, 0.15)", // Glowing purple divider
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontSize: "1.1rem",
      color: "#94a3b8",
    },
    body1: {
      lineHeight: 1.7,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 99, // Pill-shape premium buttons
          padding: "8px 24px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(139, 92, 246, 0.08)",
        },
      },
    },
  },
});
