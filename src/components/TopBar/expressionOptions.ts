import { useMemo, useCallback } from "react";
import { parseExpression, tokenize } from "../../utils/vectorExpressionParser";
import type { TermResponse } from "../../types/api";

export type OptionType = "op" | "term";

export interface Option {
  type: OptionType;
  value: string;
  label: string;
  hint: string;
}

const OPERATORS = new Set(["+", "-", "(", ")"]);
const MAX_SUGGESTIONS = 12;
const OPERATOR_OPTIONS: Record<string, Option> = Object.freeze({
  subtract: {
    type: "op",
    value: "-",
    label: "-  subtract",
    hint: "Subtract next term",
  },
  closeGroup: {
    type: "op",
    value: ")",
    label: ")  close group",
    hint: "Close parentheses",
  },
  openGroup: {
    type: "op",
    value: "(",
    label: "(  open group",
    hint: "Group terms with parentheses",
  },
});

function isTerm(token: string | undefined): boolean {
  return !!token && !OPERATORS.has(token);
}

function isAfterTermOrClose(expressionItems: string[]): boolean {
  const last = expressionItems[expressionItems.length - 1];
  return isTerm(last) || last === ")";
}

export function buildOptions(
  expressionItems: string[],
  allTerms: TermResponse[],
  filter: string,
): Option[] {
  const expressionState = expressionItems.reduce(
    (state, item) => {
      if (item === "(") {
        state.unclosedGroups++;
        state.hasGroup = true;
      } else if (item === ")") state.unclosedGroups--;
      else if (isTerm(item)) state.usedTerms.add(item);
      return state;
    },
    { usedTerms: new Set(), unclosedGroups: 0, hasGroup: false },
  );

  let operators: Option[];
  if (isAfterTermOrClose(expressionItems)) {
    operators = [OPERATOR_OPTIONS.subtract];
    if (expressionState.unclosedGroups > 0)
      operators.push(OPERATOR_OPTIONS.closeGroup);
    if (
      !expressionState.hasGroup &&
      isTerm(expressionItems[expressionItems.length - 1])
    )
      operators.push(OPERATOR_OPTIONS.openGroup);
  } else {
    operators = [];
  }

  const lower = filter.toLowerCase();
  const options =
    filter.length === 0
      ? operators
      : operators.filter((op) => op.value === filter);

  let termCount = 0;
  for (const { term, books } of allTerms) {
    if (expressionState.usedTerms.has(term)) continue;
    if (lower && !term.toLowerCase().includes(lower)) continue;

    options.push({
      type: "term",
      value: term,
      label: term,
      hint: `${books.length} books`,
    });
    termCount++;
    if (termCount === MAX_SUGGESTIONS) break;
  }

  return options;
}

export function useVectorExpression(
  expression: string,
  onExpressionChange: (expression: string) => void,
) {
  const expressionItems = useMemo(() => {
    const trimmed = expression.trim();
    if (!trimmed) return [];
    return tokenize(trimmed);
  }, [expression]);

  const updateExpressionItems = useCallback(
    (newExpressionItems: string[]) => {
      onExpressionChange(newExpressionItems.join(" "));
    },
    [onExpressionChange],
  );

  const addExpressionItem = useCallback(
    (expressionItem: string) => {
      if (
        (isTerm(expressionItem) || expressionItem === "(") &&
        isAfterTermOrClose(expressionItems)
      ) {
        updateExpressionItems([...expressionItems, "+", expressionItem]);
      } else {
        updateExpressionItems([...expressionItems, expressionItem]);
      }
    },
    [expressionItems, updateExpressionItems],
  );

  const removeExpressionItem = useCallback(
    (index: number) => {
      const next = [...expressionItems];
      next.splice(index, 1);
      const cleaned = [];
      for (let i = 0; i < next.length; i++) {
        const t = next[i];
        if (t === "+") {
          const prev = cleaned.length > 0 ? cleaned[cleaned.length - 1] : null;
          const nxt = i + 1 < next.length ? next[i + 1] : null;
          if (!prev || !nxt || (!isTerm(prev) && prev !== ")")) continue;
        }
        cleaned.push(t);
      }
      updateExpressionItems(cleaned);
    },
    [expressionItems, updateExpressionItems],
  );

  const isValid = useMemo(
    () =>
      expressionItems.length === 0 ||
      parseExpression(expressionItems.join(" ")) !== null,
    [expressionItems],
  );

  return { expressionItems, addExpressionItem, removeExpressionItem, isValid };
}
