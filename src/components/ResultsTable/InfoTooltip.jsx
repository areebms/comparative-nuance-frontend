import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

export default function InfoTooltip({ title, children, component = "span", sx = {} }) {
  return (
    <Tooltip title={title} arrow placement="top" slotProps={{ tooltip: { sx: { maxWidth: 320 } } }}>
      <Box
        component={component}
        sx={{
          textDecoration: "underline dotted",
          textUnderlineOffset: 3,
          cursor: "help",
          ...sx,
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
