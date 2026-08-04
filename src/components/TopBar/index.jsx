import { AppBar, Toolbar, Box, IconButton, Divider } from "@mui/material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import VectorExpressionInput from "./VectorExpressionInput";
import NearestTermsSort from "./NearestTermsSort";

const LogoBox = () => (
  <Box
    sx={{
      gridArea: "logo",
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
  sort,
  onSortChange,
  onDescribeSubmit,
  describeSubmitting,
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
      <Toolbar sx={{ width: "100%", py: 1 }}>
        {/* ONE tree for both layouts, rearranged by grid areas rather than
            written twice and toggled with `display`. Two copies would each hold
            their own VectorExpressionInput state -- draft expression, input
            mode, describe notice -- so crossing the breakpoint would swap in
            whatever the hidden copy was last left with. */}
        <Box
          sx={{
            display: "grid",
            width: "100%",
            alignItems: "center",
            columnGap: 2,
            rowGap: 1.5,
            // The expression input is the one thing that must be able to grow,
            // so it keeps the only flexible track; the sort control takes its
            // own `auto` track rather than sharing, so it holds its width.
            gridTemplateColumns: {
              xs: "minmax(0, 1fr) auto",
              lg: "auto minmax(0, 1fr) auto auto",
            },
            // Narrow: logo and help share a row, then the input, then the sort
            // control on its own row -- at these widths the input is already
            // the tightest thing on screen. Wide: a single horizontal row.
            gridTemplateAreas: {
              xs: `"logo help" "input input" "sort sort"`,
              lg: `"logo input sort help"`,
            },
          }}
        >
          <LogoBox />

          <Box sx={{ gridArea: "input", minWidth: 0 }}>
            <VectorExpressionInput
              expression={expression}
              onExpressionChange={onExpressionChange}
              onDescribeSubmit={onDescribeSubmit}
              describeSubmitting={describeSubmitting}
            />
          </Box>

          <Box sx={{ gridArea: "sort", justifySelf: "end" }}>
            <NearestTermsSort sort={sort} onSortChange={onSortChange} />
          </Box>

          <IconButton
            onClick={onHelpClick}
            sx={{ gridArea: "help", justifySelf: "end", color: "primary.main" }}
          >
            <HelpCenterIcon fontSize="large" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
