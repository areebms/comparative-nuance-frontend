export type OptionType = "op" | "term";

export interface Option {
  type: OptionType;
  value: string;
  label: string;
  hint: string;
}

export interface TermEntry {
  term: string;
  books: number[];
}

export type TermNode = { term: string };
export type OperationNode = { op: string; args: [OperationTree, OperationTree] };
export type OperationTree = TermNode | OperationNode;
