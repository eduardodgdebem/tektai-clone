import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { TransformControls as TransformControlsImpl } from "three/examples/jsm/controls/TransformControls";
import { TransformControls, Ring } from "@react-three/drei";
import { Interactive, useXRHitTest } from "@react-three/xr";
import { theme } from "../theme";
import { ModelWithFallback } from "./ModelWithFallback";
import { TransformState, Vector3Tuple } from "../types/transform";
import { ModelConfig } from "../types/modelaConfig";

export type TransformMode = "translate" | "rotate" | "scale";

const cloneVector = (vector: Vector3Tuple): Vector3Tuple => [
  vector[0],
  vector[1],
  vector[2],
];

interface ARSceneProps {
  transformMode: TransformMode;
  transformState: TransformState;
  onTransformChange: (state: TransformState) => void;
  onPlacement: (state: TransformState) => void;
  resetSignal: number;
  modelConfig?: ModelConfig;
}

export const ARScene: React.FC<ARSceneProps> = ({
  transformMode,
  transformState,
  onTransformChange,
  onPlacement,
  resetSignal,
  modelConfig,
}) => {
  const [placed, setPlaced] = useState(false);
  const transformControlsRef = useRef<TransformControlsImpl | null>(null);
  const hitPreviewRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const isUpdatingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const [transformControls, setTransformControls] =
    useState<TransformControlsImpl | null>(null);
  const [placedObject, setPlacedObject] = useState<THREE.Group | null>(null);

  const placementMatrix = useMemo(() => new THREE.Matrix4(), []);
  const placementVector = useMemo(() => new THREE.Vector3(), []);

  const handleTransformControlsRef = useCallback(
    (value: TransformControlsImpl | null) => {
      transformControlsRef.current = value;
      setTransformControls(value);
    },
    []
  );

  const handleGroupRef = useCallback((value: THREE.Group | null) => {
    groupRef.current = value;
    setPlacedObject(value);
  }, []);

  useEffect(() => {
    setPlaced(false);
    setPlacedObject(null);
    setTransformControls(null);
  }, [resetSignal]);

  useEffect(() => {
    if (!placedObject) return;
    if (isDraggingRef.current) return;
    isUpdatingRef.current = true;
    placedObject.position.set(...transformState.position);
    placedObject.rotation.set(...transformState.rotation);
    placedObject.scale.set(...transformState.scale);
    placedObject.updateMatrixWorld();
    if (transformControls) {
      transformControls.updateMatrixWorld();
    }
    isUpdatingRef.current = false;
  }, [transformState, placedObject, transformControls]);


  useEffect(() => {
    if (!placed || !transformControls || !placedObject) return;
    transformControls.attach(placedObject);
    const onDrag = (e: any) => {
      isDraggingRef.current = !!e.value;
      if (!e.value) {
        commit();
      }
    };
    transformControls.addEventListener("dragging-changed", onDrag);
    return () => {
      transformControls.removeEventListener("dragging-changed", onDrag);
      if (transformControls.object === placedObject) {
        transformControls.detach();
      }
    };
  }, [placed, transformControls, placedObject]);

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (!hitPreviewRef.current || placed || results.length === 0) return;
      getWorldMatrix(placementMatrix, results[0]);
      placementVector.setFromMatrixPosition(placementMatrix);
      hitPreviewRef.current.position.copy(placementVector);
    },
    "viewer",
    "plane"
  );

  const handleSelect = () => {
    if (placed || !hitPreviewRef.current) return;
    const { x, y, z } = hitPreviewRef.current.position;

    const rotation = modelConfig?.rotation
      ? cloneVector(modelConfig.rotation)
      : cloneVector(transformState.rotation);

    const scale =
      typeof modelConfig?.scale === "number"
        ? ([modelConfig.scale, modelConfig.scale, modelConfig.scale] as Vector3Tuple)
        : cloneVector(transformState.scale);

    const offset = modelConfig?.position
      ? cloneVector(modelConfig.position)
      : ([0, 0, 0] as Vector3Tuple);

    const next: TransformState = {
      position: [x + offset[0], y + offset[1], z + offset[2]] as Vector3Tuple,
      rotation,
      scale,
    };

    onPlacement(next);
    setPlaced(true);
  };

  const commit = () => {
    if (!groupRef.current) return;
    const { position, rotation, scale } = groupRef.current;
    const next: TransformState = {
      position: [position.x, position.y, position.z] as Vector3Tuple,
      rotation: [rotation.x, rotation.y, rotation.z] as Vector3Tuple,
      scale: [scale.x, scale.y, scale.z] as Vector3Tuple,
    };
    onTransformChange(next);
  };

  const handleObjectChange = () => {
    if (isUpdatingRef.current) return;
    if (!isDraggingRef.current) {
      commit();
    }
  };

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 5, 3]} intensity={3} castShadow />
      <Interactive onSelect={handleSelect}>
        {!placed && (
          <mesh ref={hitPreviewRef}>
            <Ring args={[0.08, 0.1, 32]} rotation={[-Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color={theme.colors.white}
                opacity={0.9}
                transparent
              />
            </Ring>
          </mesh>
        )}
        {placed && (
          <TransformControls
            ref={handleTransformControlsRef}
            mode={transformMode}
            showY={transformMode !== "scale"}
            onObjectChange={handleObjectChange}
          >
            <group ref={handleGroupRef}>
              <ModelWithFallback modelConfig={modelConfig} />
            </group>
          </TransformControls>
        )}
      </Interactive>
    </>
  );
};

export default ARScene;
