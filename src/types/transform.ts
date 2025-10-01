export type Vector3Tuple = [number, number, number];

export interface TransformState {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
}

export const defaultTransformState: TransformState = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};
