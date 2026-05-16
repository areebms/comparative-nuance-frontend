import { useState, useRef, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Autocomplete,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Option, TermEntry } from "../../types/vectorExpression";
import { buildOptions } from "../../utils/vectorExpressionOptions";
import { useVectorExpression } from "../../hooks/useVectorExpression";


function VectorExpressionChips({
  expressionItems,
  onRemove,
}: {
  expressionItems: string[];
  onRemove: (index: number) => void;
}) {
  if (!expressionItems.length) return null;
  return (
    <InputAdornment
      position="start"
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        gap: 0,
        height: "auto",
        maxWidth: "100%",
        minWidth: 0,
        mr: 0,
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {expressionItems.map((expressionItem, i) => (
        <Chip
          key={`${i}-${expressionItem}`}
          label={expressionItem}
          size="small"
          onDelete={() => onRemove(i)}
          sx={{ flexShrink: 0 }}
        />
      ))}
    </InputAdornment>
  );
}

type InputMode = "chat" | "vector";

function InputModeControl({
  mode,
  onModeChange,
}: {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  return (
    <
    >
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{
          color: "text.secondary",
          textTransform: "none",
          fontSize: 16,
          fontWeight: 400,
          px: 1,
          width: 100,
          flexShrink: 0,
          "&:hover": {
            bgcolor: "transparent",
          },
        }}
      >
        {mode === "chat" ? "Chat" : "Vector"}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          selected={mode === "chat"}
          onClick={() => {
            onModeChange("chat");
            setAnchorEl(null);
          }}
        >
          Chat
        </MenuItem>

        <MenuItem
          selected={mode === "vector"}
          onClick={() => {
            onModeChange("vector");
            setAnchorEl(null);
          }}
        >
          Vector
        </MenuItem>
      </Menu>
    </>
  );
}

export function VectorExpressionSubmitButton({
  disabled,
  loading,
  onSubmit,
}: {
  disabled?: boolean;
  loading?: boolean;
  onSubmit?: () => void;
}) {
  return (
      <Tooltip title="Submit">
        <span style={{ alignSelf: "stretch", display: "flex" }}>
          <Button
            aria-label="Submit expression"
            disabled={disabled || loading}
            onClick={onSubmit}
            onMouseDown={(e) => e.preventDefault()}
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              width: 40,
              minWidth: 0,
              px: 0,
              alignSelf: "stretch",
              borderRadius: "0 4px 4px 0",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlayArrowIcon fontSize="large" />
            )}
          </Button>
        </span>
      </Tooltip>
  );
}


function TermOption({
  option,
  optionProps,
}: {
  option: Option;
  optionProps: React.HTMLAttributes<HTMLLIElement>;
}) {
  const isOperator = option.type === "op";

  return (
    <Box
      component="li"
      {...optionProps}
      sx={isOperator ? { bgcolor: "grey.50 !important" } : undefined}
    >
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={
              isOperator
                ? { fontWeight: 700, fontFamily: "monospace" }
                : undefined
            }
          >
            {option.label}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {option.hint}
          </Typography>
        }
      />
    </Box>
  );
}

export default function VectorExpressionInput({
  allTerms,
  expression,
  onExpressionChange,
  onChatSubmit,
  chatSubmitting,
}: {
  allTerms: TermEntry[];
  expression: string;
  onExpressionChange: (expression: string) => void;
  onChatSubmit: (message: string) => Promise<{
    expression: string;
    terms: string[];
    substitutions: { original: string; resolved: string }[];
  }>;
  chatSubmitting: boolean;
}) {
  const [mode, setMode] = useState<InputMode>("vector");
  const [draftExpression, setDraftExpression] = useState(expression);
  const { expressionItems, addExpressionItem, removeExpressionItem, isValid } =
    useVectorExpression(draftExpression, setDraftExpression);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chat mode state
  const [chatMessage, setChatMessage] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);

  const handleModeChange = (newMode: InputMode) => {
    if (newMode === "chat") {
      setDraftExpression("");
      onExpressionChange("");
    }
    setMode(newMode);
  };

  const options = useMemo(
    () => (open ? buildOptions(expressionItems, allTerms, inputValue) : []),
    [open, expressionItems, allTerms, inputValue],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      inputValue === "" &&
      expressionItems.length > 0
    ) {
      e.preventDefault();
      removeExpressionItem(expressionItems.length - 1);
    }
  };

  const handleVectorSubmit = () => {
    onExpressionChange(draftExpression);
  };

  const handleChatSubmit = async () => {
    const trimmed = chatMessage.trim();
    if (!trimmed) return;

    setChatError(null);
    try {
      const result = await onChatSubmit(trimmed);
      setDraftExpression(result.expression);
      setMode("vector");

      if (result.substitutions?.length) {
        const lines = result.substitutions.map(
          (s: { original: string; resolved: string }) =>
            `"${s.original}" resolved to "${s.resolved}"`,
        );
        setChatError(lines.join("; "));
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          height: 40,
          minWidth: 0,
          width: "100%",
        }}
      >
        <InputModeControl mode={mode} onModeChange={handleModeChange} />

        {mode === "vector" ? (
          <>
            <Autocomplete
              freeSolo
              disableClearable
              forcePopupIcon={false}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              options={options}
              getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
              filterOptions={(x) => x}
              sx={{ flex: 1, minWidth: 0 }}
              inputValue={inputValue}
              onInputChange={(_, value, reason) => {
                if (reason === "input") {
                  setInputValue(value);
                  if (!open) setOpen(true);
                }
              }}
              onChange={(_, option) => {
                if (option && typeof option === "object") {
                  addExpressionItem(option.value);
                  setInputValue("");
                  if (option.type === "op") {
                    requestAnimationFrame(() => setOpen(true));
                  }
                  requestAnimationFrame(() => inputRef.current?.focus());
                }
              }}
              renderOption={(props, opt) => {
                const { key, ...rest } = props;
                return <TermOption key={key} option={opt} optionProps={rest} />;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={inputRef}
                  onKeyDown={handleKeyDown}
                  placeholder={expressionItems.length === 0 ? "Select a term" : ""}
                  label="Vector Expression"
                  size="small"
                  error={!isValid}
                  autoComplete="off"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <VectorExpressionChips
                        expressionItems={expressionItems}
                        onRemove={removeExpressionItem}
                      />
                    ),
                    sx: {
                      minWidth: 0,
                      flexWrap: "nowrap",
                      overflow: "hidden",
                      "& .MuiAutocomplete-input": {
                        minWidth: 0,
                      },
                      "& .MuiInputAdornment-root": {
                        flexWrap: "nowrap",
                        height: "auto",
                        minWidth: 0,
                      },
                    },
                  }}
                  sx={{
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      mx: 0,
                      px: 0,
                      bgcolor: "background.paper",
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                />
              )}
              fullWidth
            />

            <VectorExpressionSubmitButton
              disabled={!isValid || inputValue.trim().length !== 0}
              onSubmit={handleVectorSubmit}
            />
          </>
        ) : (
          <>
            <TextField
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="e.g. compare labour and capital"
              label="Chat"
              size="small"
              autoComplete="off"
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            />

            <VectorExpressionSubmitButton
              disabled={chatMessage.trim().length === 0}
              loading={chatSubmitting}
              onSubmit={handleChatSubmit}
            />
          </>
        )}
      </Box>

      {chatError && (
        <Alert
          severity="warning"
          onClose={() => setChatError(null)}
          sx={{ py: 0, fontSize: 13 }}
        >
          {chatError}
        </Alert>
      )}
    </Box>
  );
}
