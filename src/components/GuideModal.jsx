import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MobileStepper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import DifferenceIcon from "@mui/icons-material/Difference";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";

function ExpressionChip({ label }) {
  return (
    <Chip
      label={label}
      variant="outlined"
      size="small"
      sx={{
        fontFamily: "monospace",
        bgcolor: "background.paper",
        maxWidth: "100%",
        "& .MuiChip-label": {
          overflowWrap: "anywhere",
          whiteSpace: "normal",
        },
      }}
    />
  );
}

function DescribeBlock({ children }) {
  return (
    <Box
      component="code"
      sx={{
        display: "inline-block",
        maxWidth: "100%",
        fontFamily: "monospace",
        fontSize: "0.8125rem",
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        px: 1.25,
        py: 0.25,
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </Box>
  );
}

function GuideCard({ icon, title, children }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "primary.main",
              bgcolor: "action.hover",
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
              {title}
            </Typography>
            <Stack spacing={1}>{children}</Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StepHeader({ title }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Box>
  );
}

function ExploreStep() {
  return (
    <Box>
      <StepHeader title="Explore the language of classical economics" />

      <Stack spacing={2.25}>
        <GuideCard icon={<SearchIcon fontSize="small" />} title="Overview">
          <Typography variant="body2" color="text.secondary">
            Search a word to see which concepts surround it across texts by
            Smith, Ricardo, Mill, Steuart, and Bastiat. Compare associations to
            spot shared vocabulary and track how ideas shift over time. Books
            are color-coded chronologically: warmer tones for earlier writers,
            cooler for later ones.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Go further with vector expressions. Enter{" "}
            <ExpressionChip label="labour + (productive - unproductive)" /> to
            probe a specific conceptual distinction rather than just browsing
            terms.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            If vector expressions feel too complicated, describe your query in
            plain English and the tool will convert it. For example,{" "}
            <DescribeBlock>
              productive vs unproductive labour
            </DescribeBlock>{" "}
            will be converted to{" "}
            <ExpressionChip label="labour + (productive - unproductive)" />. If
            a term in your description is not found in the corpus, the closest
            match will be substituted automatically.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Results include a confidence range derived from an ensemble of
            aligned Word2Vec models. Tighter intervals mean stronger confidence,
            wider intervals mean the word may carry multiple meanings in the
            text.
          </Typography>
        </GuideCard>

        <GuideCard
          icon={<BarChartIcon fontSize="small" />}
          title="Reading the chart"
        >
          <Typography variant="body2" color="text.secondary">
            Each row represents a related term. The position of the dots
            indicates the association between the term usage for a given book
            and your query. Further right indicates a stronger association. The
            horizontal line represents the confidence range.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Divergence across books on the same row indicates a measurable
            difference in how the term is used. That divergence is the starting
            point for analysis. Is the meaning of the word shifting over time?
            Is the book's author engaged in a different debate?
          </Typography>
        </GuideCard>
      </Stack>
    </Box>
  );
}

function QueryingStep() {
  return (
    <Box>
      <StepHeader title="Querying Concepts" />

      <Stack spacing={2.25}>
        <GuideCard
          icon={<DifferenceIcon fontSize="small" />}
          title="Vector expressions"
        >
          <Typography variant="subtitle2">Searching terms</Typography>
          <Typography variant="body2" color="text.secondary">
            Type a word into the search box and select from the autocomplete
            dropdown. The dropdown contains terms drawn directly from the
            corpus.
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Adding terms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Words can carry multiple meanings, so a single term query may return
            unrelated concepts. Use + to pull results toward a more specific
            meaning.
          </Typography>
          <Box>
            <ExpressionChip label="capital + profit" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pulls "capital" toward its economic sense by combining it with
            "profit", excluding the geographical meaning.
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Subtracting terms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Word2Vec places antonyms close together, so a single term query may
            return opposites. Use - to push an unwanted direction away.
          </Typography>
          <Box>
            <ExpressionChip label="productive - unproductive" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pushes the query away from association with "unproductive" to
            isolate what is distinctive about "productive".
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Combining expressions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Without parentheses,{" "}
            <ExpressionChip label="labour + productive - unproductive" />{" "}
            averages all three directions together. With parentheses,{" "}
            <ExpressionChip label="labour + (productive - unproductive)" />{" "}
            isolates the productive/unproductive contrast first, then adds
            "labour". This surfaces terms similar to productive labour but not
            unproductive labour.
          </Typography>
        </GuideCard>

        <GuideCard icon={<AutoAwesomeIcon fontSize="small" />} title="Describe">
          <Typography variant="body2" color="text.secondary">
            Describe what you are looking for in plain English without needing
            to know how to construct an expression. The tool handles the
            translation. For example,{" "}
            <DescribeBlock>
              productive vs unproductive labour
            </DescribeBlock>{" "}
            produces{" "}
            <ExpressionChip label="labour + (productive - unproductive)" />{" "}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            If a term in
            your description is not found in the corpus, the closest match will
            be substituted.
          </Typography>
        </GuideCard>
      </Stack>
    </Box>
  );
}

const steps = [ExploreStep, QueryingStep];

export default function GuideModal({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const StepContent = steps[activeStep];

  useEffect(() => {
    if (open) setActiveStep(0);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: { xs: 0, sm: 2.5 } },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Using Embedding Analytics
      </DialogTitle>

      <DialogContent>
        <StepContent />
      </DialogContent>

      <MobileStepper
        variant="dots"
        steps={steps.length}
        position="static"
        activeStep={activeStep}
        sx={{ bgcolor: "transparent", px: 3, py: 1.5 }}
        nextButton={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={() => setActiveStep((s) => s + 1)}
              disabled={activeStep === steps.length - 1}
            >
              Next
              <KeyboardArrowRight />
            </Button>
            <Button size="small" onClick={onClose}>
              Close
            </Button>
          </Stack>
        }
        backButton={
          <Button
            size="small"
            onClick={() => setActiveStep((s) => s - 1)}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    </Dialog>
  );
}
