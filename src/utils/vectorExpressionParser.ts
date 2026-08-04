/**
 * Parses vector algebra expressions like "labour + (productive - unproductive)"
 * into a nested OperationTree:
 *   { op: "+", args: [{ term: "labour" }, { op: "-", args: [{ term: "productive" }, { term: "unproductive" }] }] }
 *
 * A bare term returns { term: "labour" }.
 * Returns null on parse failure.
 */

import type { OperationTree } from "../types/vectorExpression";

const TOKEN_PATTERN = /[()+-]|[^\s()+-]+/g;

export const tokenize = (expression: string): string[] => expression.match(TOKEN_PATTERN) ?? [];

function parseTokens(tokens: string[]): OperationTree | null {
  let cursor = 0;
  const peek = (): string => tokens[cursor];
  const take = (): string => tokens[cursor++];

  const primary = (): OperationTree | null => {
    const token = take();
    if (!token || token === "+" || token === "-" || token === ")") return null;

    if (token === "(") {
      const expression = binaryExpression();
      return expression && take() === ")" ? expression : null;
    }

    return { term: token };
  };

  const binaryExpression = (): OperationTree | null => {
    let left = primary();

    while (left && (peek() === "+" || peek() === "-")) {
      const operator = take();
      const right = primary();
      left = right ? { op: operator, args: [left, right] } : null;
    }

    return left;
  };

  const tree = binaryExpression();
  return tree && cursor === tokens.length ? tree : null;
}

export function parseExpression(input: string): OperationTree | null {
  if (typeof input !== "string") return null;

  const expression = input.trim();
  return expression ? parseTokens(tokenize(expression)) : null;
}
