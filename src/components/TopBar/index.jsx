import { AppBar, Toolbar, Box, IconButton, Divider } from "@mui/material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import VectorExpressionInput from "./VectorExpressionInput";

const LogoBox = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      minWidth: 0,
    }}
  >
    <Box
      component="span"
      sx={{
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 0.3,
        color: "text.primary",
        whiteSpace: "nowrap",
      }}
    >
      Embedding Analytics
    </Box>

    <Divider
      orientation="vertical"
      flexItem
      sx={{ display: { xs: "none", lg: "block" } }}
    />
  </Box>
);

export default function TopBar({
  expression,
  onExpressionChange,
  onDescribeSubmit,
  describeSubmitting,
  allTerms,
  onHelpClick,
}) {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          width: "100%",
          py: 1,
        }}
      >
        {/* ── lg: single horizontal row ── */}
        <Box
          sx={{
            display: { xs: "none", lg: "grid" },
            gridTemplateColumns: "auto minmax(0, 1fr) auto",
            gap: 2,
            alignItems: "center",
            width: "100%",
          }}
        >
          <LogoBox />
          <Box sx={{ width: "100%", minWidth: 0 }}>
            <VectorExpressionInput
              allTerms={allTerms}
              expression={expression}
              onExpressionChange={onExpressionChange}
              onDescribeSubmit={onDescribeSubmit}
              describeSubmitting={describeSubmitting}
            />
          </Box>
          <IconButton onClick={onHelpClick} sx={{ color: "primary.main" }}>
            <HelpCenterIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* ── xs: stacked rows ── */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
          }}
        >
          {/* Row 1: Logo + Help icon */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <LogoBox />
            <IconButton onClick={onHelpClick} >
              <HelpCenterIcon fontSize="large" sx={{ color: "primary.main" }} />
            </IconButton>
          </Box>

          {/* Row 2: Input */}
          <VectorExpressionInput
            allTerms={allTerms}
            expression={expression}
            onExpressionChange={onExpressionChange}
            onDescribeSubmit={onDescribeSubmit}
            describeSubmitting={describeSubmitting}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
