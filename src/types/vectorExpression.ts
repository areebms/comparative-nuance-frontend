export type OptionType = "op" | "term";

export interface Option {
  type: OptionType;
  value: string;
  label: string;
  hint: string;
}

export type TermNode = { term: string };

export type OperationNode = {
  op: "+" | "-";
  args: [OperationTree, OperationTree];
};
export type OperationTree = TermNode | OperationNode;
