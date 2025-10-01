export type Axis = "x" | "y" | "z";

export type TransformAction =
  | { type: "scale"; factor: number }
  | { type: "rotate"; axis: Axis; degrees: number }
  | { type: "move"; axis: Axis; distance: number };

export interface CommandResponse {
  reply: string;
  actions: TransformAction[];
}
