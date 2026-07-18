import { createTheme } from "@mui/material/styles";

// A beautiful, highly aesthetic dark theme with a premium dynamic color scheme.
export const getTheme = (brand: string) => {
  const isRed = brand === "Flixer" || brand === "Cineby";
  return createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: isRed ? "#e50914" : "#8b5cf6", // Netflix Red vs Violet 500
        light: isRed ? "#ff3a3a" : "#a78bfa", // Red vs Violet 400
        dark: isRed ? "#9e050e" : "#6d28d9", // Dark Red vs Violet 700
        contrastText: "#ffffff",
      },
      secondary: {
        main: isRed ? "#ff4d6a" : "#ec4899", // Rose vs Pink 500
        light: isRed ? "#ff99aa" : "#f472b6", // Rose vs Pink 400
        dark: isRed ? "#a10014" : "#db2777", // Rose vs Pink 600
      },
      background: {
        default: isRed ? "#030000" : "#050110", // Sleek Interface background
        paper: isRed ? "#070001" : "#0a0218", // Sleek Interface card/paper design
      },
      text: {
        primary: "#f8fafc", // Cool slate whites
        secondary: "#94a3b8", // Muted state grays
      },
      divider: isRed ? "rgba(229, 9, 20, 0.15)" : "rgba(139, 92, 246, 0.15)", // Glowing divider
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
            border: isRed ? "1px solid rgba(229, 9, 20, 0.08)" : "1px solid rgba(139, 92, 246, 0.08)",
          },
        },
      },
    },
  });
};

export const theme = getTheme("Cineby");

