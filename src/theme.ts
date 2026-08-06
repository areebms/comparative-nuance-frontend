import { createTheme } from "@mui/material";

export const FONT_FAMILY = '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';

export const theme = createTheme({
  palette: {
    primary: { main: "#4e79a7" },
    secondary: { main: "#e15759" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
  },
  typography: {
    fontFamily: FONT_FAMILY,
  },
  shape: { borderRadius: 12 },
});
