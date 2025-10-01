import {  Vector3Tuple } from "../types/transform";

export type ModelConfig = {
  id: string;
  name: string;
  type: "glb" | "obj";
  url: string;
  scale?: number;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  thumbnail?: string;
  description?: string;
  isLocal?: boolean;
}