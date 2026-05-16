import { useMemo, useCallback } from "react";
import { parseExpression } from "../utils/vectorExpressionParser";
import { isTerm, isAfterTermOrClose } from "../utils/vectorExpressionOptions";

export function useVectorExpression(
  expression: string,
  onExpressionChange: (expression: string) => void,
) {
  const expressionItems = useMemo(() => {
    const trimmed = expression.trim();
    if (!trimmed) return [];
    return trimmed.split(/\s+/).filter(Boolean);
  }, [expression]);

  const updateExpressionItems = useCallback(
    (newExpressionItems: string[]) => {
      onExpressionChange(newExpressionItems.join(" "));
    },
    [onExpressionChange],
  );

  const addExpressionItem = useCallback(
    (expressionItem: string) => {
      if ((isTerm(expressionItem) || expressionItem === "(") && isAfterTermOrClose(expressionItems)) {
        updateExpressionItems([...expressionItems, "+", expressionItem]);
      } else {
        updateExpressionItems([...expressionItems, expressionItem]);
      }
    },
    [expressionItems, updateExpressionItems],
  );

  const removeExpressionItem = useCallback(
    (index : number) => {
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
    () => expressionItems.length === 0 || parseExpression(expressionItems.join(" ")) !== null,
    [expressionItems],
  );

  return { expressionItems, addExpressionItem, removeExpressionItem, isValid };
}
