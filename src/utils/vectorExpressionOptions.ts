import type { Option, TermEntry } from "../types/vectorExpression";

const OPERATORS = new Set(["+", "-", "(", ")"]);
const MAX_SUGGESTIONS = 12;
const OPERATOR_OPTIONS: Record<string, Option> = Object.freeze({
  subtract: { type: "op", value: "-", label: "-  subtract", hint: "Subtract next term" },
  closeGroup: { type: "op", value: ")", label: ")  close group", hint: "Close parentheses" },
  openGroup: { type: "op", value: "(", label: "(  open group", hint: "Group terms with parentheses" },
});

export function isTerm(token: string | undefined): boolean {
  return !!token && !OPERATORS.has(token);
}

export function isAfterTermOrClose(expressionItems: string[]): boolean {
  const last = expressionItems[expressionItems.length - 1];
  return isTerm(last) || last === ")";
}

export function buildOptions(expressionItems: string[], allTerms: TermEntry[], filter: string): Option[] {
  const expressionState = expressionItems.reduce(
    (state, item) => {
      if (item === "(") { state.unclosedGroups++; state.hasGroup = true; }
      else if (item === ")") state.unclosedGroups--;
      else if (isTerm(item)) state.usedTerms.add(item);
      return state;
    },
    { usedTerms: new Set(), unclosedGroups: 0, hasGroup: false },
  );

  let operators: Option[];
  if (isAfterTermOrClose(expressionItems)) {
    operators = [OPERATOR_OPTIONS.subtract];
    if (expressionState.unclosedGroups > 0) operators.push(OPERATOR_OPTIONS.closeGroup);
    if (!expressionState.hasGroup && isTerm(expressionItems[expressionItems.length - 1])) operators.push(OPERATOR_OPTIONS.openGroup);
  } else {
    operators = [];
  }

  const lower = filter.toLowerCase();
  const options = filter.length === 0
    ? operators
    : operators.filter((op) => op.value === filter);

  let termCount = 0;
  for (const { term, books } of allTerms) {
    if (expressionState.usedTerms.has(term)) continue;
    if (lower && !term.toLowerCase().includes(lower)) continue;

    options.push({ type: "term", value: term, label: term, hint: `${books.length} books` });
    termCount++;
    if (termCount === MAX_SUGGESTIONS) break;
  }

  return options;
}
