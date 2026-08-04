import { Box } from "@mui/material";


export default function CenteredMessage({ children, height }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height,
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
}
